const connectionRepository = require('../repositories/connection.repository');
const businessRepository = require('../repositories/business.repository');
const pool = require('../db');
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError
} = require('../errors/AppError');

class ConnectionService {
  /**
   * Initiates a B2B connection request.
   * @param {number|string} userId 
   * @param {object} param1 
   */
  async createRequest(userId, { requester_business_id, receiver_business_id }) {
    if (requester_business_id === receiver_business_id) {
      throw new BadRequestError('Businesses cannot connect to themselves', 'SELF_CONNECTION_FORBIDDEN');
    }

    // 1. Verify requester and receiver businesses exist
    const [requester, receiver] = await Promise.all([
      businessRepository.findById(requester_business_id),
      businessRepository.findById(receiver_business_id)
    ]);

    if (!requester) {
      throw new NotFoundError('Requester business not found', 'REQUESTER_BUSINESS_NOT_FOUND');
    }
    if (!receiver) {
      throw new NotFoundError('Receiver business not found', 'RECEIVER_BUSINESS_NOT_FOUND');
    }

    // 2. Verify caller has permission in requester business
    const membership = await businessRepository.getUserMembership(requester_business_id, userId);
    if (!membership || !membership.isMember) {
      throw new ForbiddenError('You do not have permission to initiate connections for this business', 'FORBIDDEN_REQUESTER_ACCESS');
    }

    // 3. Check existing connection between pair
    const existing = await connectionRepository.findBetweenBusinesses(requester_business_id, receiver_business_id);
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new ConflictError('A pending connection request already exists between these businesses', 'DUPLICATE_PENDING_REQUEST');
      }
      if (existing.status === 'ACCEPTED') {
        throw new ConflictError('These businesses are already connected', 'ALREADY_CONNECTED');
      }
      if (existing.status === 'BLOCKED') {
        throw new ForbiddenError('Unable to connect with this business', 'CONNECTION_BLOCKED');
      }

      // If previously REJECTED or CANCELLED, reset to PENDING
      await pool.query(
        `UPDATE connections 
         SET status = 'PENDING', requester_business_id = ?, receiver_business_id = ?, requested_at = NOW() 
         WHERE connection_id = ?`,
        [requester_business_id, receiver_business_id, existing.connection_id]
      );
      return connectionRepository.findById(existing.connection_id);
    }

    // 4. Create new connection
    const created = await connectionRepository.create({
      requesterBusinessId: requester_business_id,
      receiverBusinessId: receiver_business_id
    });

    // Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
       VALUES (?, ?, 'CONNECTION_REQUESTED', ?)`,
      [userId, requester_business_id, JSON.stringify({ receiver_business_id, connection_id: created.connection_id })]
    );

    return created;
  }

  /**
   * Updates a connection status (ACCEPTED, REJECTED, CANCELLED, BLOCKED).
   * @param {number|string} userId 
   * @param {number|string} connectionId 
   * @param {string} nextStatus 
   */
  async updateStatus(userId, connectionId, nextStatus) {
    const connection = await connectionRepository.findById(connectionId);
    if (!connection) {
      throw new NotFoundError('Connection not found', 'CONNECTION_NOT_FOUND');
    }

    const [reqMembership, recMembership] = await Promise.all([
      businessRepository.getUserMembership(connection.requester_business_id, userId),
      businessRepository.getUserMembership(connection.receiver_business_id, userId)
    ]);

    const isRequesterAdmin = reqMembership && reqMembership.isMember && (reqMembership.isOwner || reqMembership.memberRole === 'ADMIN');
    const isReceiverAdmin = recMembership && recMembership.isMember && (recMembership.isOwner || recMembership.memberRole === 'ADMIN');

    if (nextStatus === 'ACCEPTED' || nextStatus === 'REJECTED') {
      if (!isReceiverAdmin) {
        throw new ForbiddenError('Only an administrator of the recipient business can accept or reject requests', 'FORBIDDEN_TRANSITION');
      }
      if (connection.status !== 'PENDING') {
        throw new BadRequestError(`Cannot transition connection from ${connection.status} to ${nextStatus}`, 'INVALID_STATE_TRANSITION');
      }
    } else if (nextStatus === 'CANCELLED') {
      if (!isRequesterAdmin) {
        throw new ForbiddenError('Only an administrator of the initiating business can cancel the request', 'FORBIDDEN_TRANSITION');
      }
      if (connection.status !== 'PENDING') {
        throw new BadRequestError(`Cannot cancel a connection that is currently ${connection.status}`, 'INVALID_STATE_TRANSITION');
      }
    } else if (nextStatus === 'BLOCKED') {
      if (!isRequesterAdmin && !isReceiverAdmin) {
        throw new ForbiddenError('Only an authorized business member can block this connection', 'FORBIDDEN_TRANSITION');
      }
    }

    const updated = await connectionRepository.updateStatus(connectionId, nextStatus);

    // Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
       VALUES (?, ?, 'CONNECTION_STATUS_CHANGED', ?)`,
      [userId, isReceiverAdmin ? connection.receiver_business_id : connection.requester_business_id, JSON.stringify({ connection_id: connectionId, old_status: connection.status, new_status: nextStatus })]
    );

    return updated;
  }

  /**
   * Retrieves connections list for a business.
   * @param {number|string} userId 
   * @param {object} params 
   */
  async listConnections(userId, { business_id, status, direction, page, pageSize }) {
    const membership = await businessRepository.getUserMembership(business_id, userId);
    if (!membership || !membership.isMember) {
      throw new ForbiddenError('You do not have permission to view connections for this business', 'FORBIDDEN_BUSINESS_ACCESS');
    }

    return connectionRepository.listForBusiness(business_id, {
      status,
      direction,
      page,
      pageSize
    });
  }

  /**
   * Retrieves single connection details.
   * @param {number|string} userId 
   * @param {number|string} connectionId 
   */
  async getConnectionById(userId, connectionId) {
    const connection = await connectionRepository.findById(connectionId);
    if (!connection) {
      throw new NotFoundError('Connection not found', 'CONNECTION_NOT_FOUND');
    }

    const [reqMembership, recMembership] = await Promise.all([
      businessRepository.getUserMembership(connection.requester_business_id, userId),
      businessRepository.getUserMembership(connection.receiver_business_id, userId)
    ]);

    if ((!reqMembership || !reqMembership.isMember) && (!recMembership || !recMembership.isMember)) {
      throw new ForbiddenError('You are not authorized to view this connection', 'FORBIDDEN_CONNECTION_ACCESS');
    }

    return connection;
  }
}

module.exports = new ConnectionService();
