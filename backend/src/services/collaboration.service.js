const collaborationRepository = require('../repositories/collaboration.repository');
const businessRepository = require('../repositories/business.repository');
const needRepository = require('../repositories/need.repository');
const serviceRepository = require('../repositories/service.repository');
const pool = require('../db');
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError
} = require('../errors/AppError');

class CollaborationService {
  /**
   * Creates a new collaboration with participants in a transaction.
   * @param {number|string} userId 
   * @param {object} param1 
   */
  async createCollaboration(userId, {
    initiator_business_id,
    partner_business_ids,
    partner_business_id,
    title,
    need_id = null,
    service_id = null,
    status = 'REQUESTED',
    start_date = null,
    end_date = null
  }) {
    // 1. Verify caller has membership/ownership in the initiator business
    const membership = await businessRepository.getUserMembership(initiator_business_id, userId);
    if (!membership || !membership.isMember) {
      throw new ForbiddenError('You do not have permission to initiate collaborations for this business', 'FORBIDDEN_INITIATOR_ACCESS');
    }

    // 2. Normalize partner IDs
    const partners = partner_business_ids || (partner_business_id ? [partner_business_id] : []);
    if (partners.length === 0) {
      throw new BadRequestError('At least one partner business must be specified', 'MISSING_PARTNER');
    }

    if (partners.includes(Number(initiator_business_id))) {
      throw new BadRequestError('A business cannot initiate a collaboration with itself', 'SELF_COLLABORATION_FORBIDDEN');
    }

    // 3. Verify all partner businesses exist
    for (const partnerId of partners) {
      const partner = await businessRepository.findById(partnerId);
      if (!partner) {
        throw new NotFoundError(`Partner business ${partnerId} not found`, 'PARTNER_BUSINESS_NOT_FOUND');
      }
    }

    // 4. Verify optional need/service
    if (need_id) {
      const need = await needRepository.findById(need_id);
      if (!need) {
        throw new NotFoundError('Referenced need not found', 'NEED_NOT_FOUND');
      }
    }

    if (service_id) {
      const service = await serviceRepository.findById(service_id);
      if (!service) {
        throw new NotFoundError('Referenced service not found', 'SERVICE_NOT_FOUND');
      }
    }

    // 5. Execute creation within a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const created = await collaborationRepository.create({
        initiatorBusinessId: initiator_business_id,
        needId: need_id,
        serviceId: service_id,
        title,
        status,
        startDate: start_date,
        endDate: end_date,
        partnerBusinessIds: partners
      }, connection);

      // Record activity event
      await connection.query(
        `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
         VALUES (?, ?, 'COLLABORATION_CREATED', ?)`,
        [
          userId,
          initiator_business_id,
          JSON.stringify({
            collaboration_id: created.collaboration_id,
            partner_business_ids: partners,
            status
          })
        ]
      );

      await connection.commit();
      return created;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Updates the status of a collaboration following the PRD state machine.
   * @param {number|string} userId 
   * @param {number|string} collaborationId 
   * @param {object} param2 
   */
  async updateStatus(userId, collaborationId, { status: nextStatus, start_date = null, end_date = null }) {
    const collaboration = await collaborationRepository.findById(collaborationId);
    if (!collaboration) {
      throw new NotFoundError('Collaboration not found', 'COLLABORATION_NOT_FOUND');
    }

    const currentStatus = collaboration.status;

    // Check if terminal
    if (['COMPLETED', 'DECLINED', 'CANCELLED'].includes(currentStatus)) {
      throw new BadRequestError(`Cannot change status of a ${currentStatus} collaboration`, 'TERMINAL_STATE_IMMUTABLE');
    }

    // Valid state transitions
    const validTransitions = {
      DRAFT: ['REQUESTED', 'CANCELLED'],
      REQUESTED: ['NEGOTIATING', 'ACCEPTED', 'DECLINED', 'CANCELLED'],
      NEGOTIATING: ['ACCEPTED', 'DECLINED', 'CANCELLED'],
      ACCEPTED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['COMPLETED', 'CANCELLED']
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestError(`Invalid transition from ${currentStatus} to ${nextStatus}`, 'INVALID_STATE_TRANSITION');
    }

    // Determine caller's roles across participants
    let isInitiatorAdmin = false;
    let isPartnerAdmin = false;
    let isAnyParticipantMember = false;

    for (const participant of collaboration.participants) {
      const membership = await businessRepository.getUserMembership(participant.business_id, userId);
      if (membership && membership.isMember) {
        isAnyParticipantMember = true;
        const isAdminOrOwner = membership.isOwner || membership.memberRole === 'ADMIN';
        if (participant.participant_role === 'INITIATOR' && isAdminOrOwner) {
          isInitiatorAdmin = true;
        }
        if (participant.participant_role === 'PARTNER' && isAdminOrOwner) {
          isPartnerAdmin = true;
        }
      }
    }

    if (!isAnyParticipantMember) {
      throw new ForbiddenError('You are not a participant in this collaboration', 'FORBIDDEN_COLLABORATION_ACCESS');
    }

    // Check transition specific authorization
    if (['ACCEPTED', 'DECLINED'].includes(nextStatus)) {
      if (!isPartnerAdmin && !isInitiatorAdmin) {
        throw new ForbiddenError('Only an administrator of an involved business can accept or decline this collaboration', 'FORBIDDEN_TRANSITION');
      }
    } else if (nextStatus === 'ACTIVE' || nextStatus === 'COMPLETED') {
      if (!isInitiatorAdmin && !isPartnerAdmin) {
        throw new ForbiddenError('Only an administrator of a participating business can update this collaboration progress', 'FORBIDDEN_TRANSITION');
      }
    } else if (nextStatus === 'CANCELLED') {
      if (!isInitiatorAdmin && !isPartnerAdmin) {
        throw new ForbiddenError('Only an administrator of a participating business can cancel this collaboration', 'FORBIDDEN_TRANSITION');
      }
    }

    const updated = await collaborationRepository.updateStatus(collaborationId, nextStatus, {
      startDate: start_date,
      endDate: end_date || (nextStatus === 'COMPLETED' ? new Date().toISOString().slice(0, 10) : null)
    });

    // Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
       VALUES (?, ?, 'COLLABORATION_STATUS_CHANGED', ?)`,
      [
        userId,
        collaboration.initiator_business_id,
        JSON.stringify({
          collaboration_id: collaborationId,
          old_status: currentStatus,
          new_status: nextStatus
        })
      ]
    );

    return updated;
  }

  /**
   * Retrieves single collaboration details with participants.
   * @param {number|string} userId 
   * @param {number|string} collaborationId 
   */
  async getCollaborationById(userId, collaborationId) {
    const collaboration = await collaborationRepository.findById(collaborationId);
    if (!collaboration) {
      throw new NotFoundError('Collaboration not found', 'COLLABORATION_NOT_FOUND');
    }

    // Verify user belongs to at least one participant business
    let isAuthorized = false;
    for (const participant of collaboration.participants) {
      const membership = await businessRepository.getUserMembership(participant.business_id, userId);
      if (membership && membership.isMember) {
        isAuthorized = true;
        break;
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenError('You are not authorized to view this collaboration', 'FORBIDDEN_COLLABORATION_ACCESS');
    }

    return collaboration;
  }

  /**
   * Lists collaborations for a business.
   * @param {number|string} userId 
   * @param {object} param1 
   */
  async listCollaborations(userId, { business_id, status, page, pageSize }) {
    const membership = await businessRepository.getUserMembership(business_id, userId);
    if (!membership || !membership.isMember) {
      throw new ForbiddenError('You do not have permission to view collaborations for this business', 'FORBIDDEN_BUSINESS_ACCESS');
    }

    return collaborationRepository.listForBusiness(business_id, {
      status,
      page,
      pageSize
    });
  }
}

module.exports = new CollaborationService();
