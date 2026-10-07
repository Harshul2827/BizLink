const messageRepository = require('../repositories/message.repository');
const connectionRepository = require('../repositories/connection.repository');
const businessRepository = require('../repositories/business.repository');
const pool = require('../db');
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError
} = require('../errors/AppError');

class MessageService {
  /**
   * Sends a message within an accepted connection.
   * @param {number|string} userId 
   * @param {number|string} connectionId 
   * @param {object} param2 
   */
  async sendMessage(userId, connectionId, { sender_business_id, body }) {
    const connection = await connectionRepository.findById(connectionId);
    if (!connection) {
      throw new NotFoundError('Connection not found', 'CONNECTION_NOT_FOUND');
    }

    if (connection.status !== 'ACCEPTED') {
      throw new BadRequestError(`Cannot send messages in a ${connection.status} connection. Connection must be ACCEPTED.`, 'INVALID_CONNECTION_STATUS');
    }

    if (
      connection.requester_business_id !== parseInt(sender_business_id, 10) &&
      connection.receiver_business_id !== parseInt(sender_business_id, 10)
    ) {
      throw new BadRequestError('Sender business is not a party in this connection', 'INVALID_SENDER_BUSINESS');
    }

    // Verify user is an authorized member of sender business
    const membership = await businessRepository.getUserMembership(sender_business_id, userId);
    if (!membership || !membership.isMember) {
      throw new ForbiddenError('You are not authorized to send messages on behalf of this business', 'FORBIDDEN_SENDER_ACCESS');
    }

    const message = await messageRepository.create({
      connectionId,
      senderUserId: userId,
      senderBusinessId: sender_business_id,
      body
    });

    // Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
       VALUES (?, ?, 'MESSAGE_SENT', ?)`,
      [userId, sender_business_id, JSON.stringify({ connection_id: connectionId, message_id: message.message_id })]
    );

    return message;
  }

  /**
   * Retrieves messages for a connection.
   * @param {number|string} userId 
   * @param {number|string} connectionId 
   * @param {object} pagination 
   */
  async getConversationMessages(userId, connectionId, { page = 1, pageSize = 50 } = {}) {
    const connection = await connectionRepository.findById(connectionId);
    if (!connection) {
      throw new NotFoundError('Connection not found', 'CONNECTION_NOT_FOUND');
    }

    const [reqMembership, recMembership] = await Promise.all([
      businessRepository.getUserMembership(connection.requester_business_id, userId),
      businessRepository.getUserMembership(connection.receiver_business_id, userId)
    ]);

    if ((!reqMembership || !reqMembership.isMember) && (!recMembership || !recMembership.isMember)) {
      throw new ForbiddenError('You are not authorized to access this conversation', 'FORBIDDEN_CONVERSATION_ACCESS');
    }

    return messageRepository.findByConnectionId(connectionId, { page, pageSize });
  }

  /**
   * Retrieves recent conversations list for the current user.
   * @param {number|string} userId 
   */
  async getUserConversations(userId) {
    return messageRepository.findConversationsForUser(userId);
  }
}

module.exports = new MessageService();
