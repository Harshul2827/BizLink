require('dotenv').config();
const assert = require('assert');
const pool = require('../db');
const authService = require('../services/auth.service');
const businessService = require('../services/business.service');
const connectionService = require('../services/connection.service');
const messageService = require('../services/message.service');

async function runConnectionsMessagesTests() {
  console.log('--- Starting Track 4 (Connections & Messaging) Tests ---');
  let passed = 0;
  let failed = 0;

  let userA, userB;
  let bizA, bizB;
  let connection;
  let message;

  try {
    // 1. Setup two businesses with owner users
    console.log('[Test 1] Setting up two test users and businesses...');
    const regA = await authService.register({
      email: `usera_${Date.now()}@conntest.com`,
      password: 'Password123!',
      full_name: 'Alice Requester',
      role: 'OWNER'
    });
    userA = regA.user;

    const regB = await authService.register({
      email: `userb_${Date.now()}@conntest.com`,
      password: 'Password123!',
      full_name: 'Bob Receiver',
      role: 'OWNER'
    });
    userB = regB.user;

    bizA = await businessService.createBusiness(userA.userId, {
      name: `Alpha Innovations ${Date.now()}`,
      city: 'Seattle',
      state: 'WA',
      country: 'USA'
    });

    bizB = await businessService.createBusiness(userB.userId, {
      name: `Beta Logistics ${Date.now()}`,
      city: 'Portland',
      state: 'OR',
      country: 'USA'
    });

    assert(bizA.business_id, 'BizA creation failed');
    assert(bizB.business_id, 'BizB creation failed');
    console.log(`  ✓ Pass: Businesses created (BizA ID: ${bizA.business_id}, BizB ID: ${bizB.business_id})`);
    passed++;

    // 2. Self-connection rejection
    console.log('[Test 2] Preventing self-connection...');
    let selfConnError = false;
    try {
      await connectionService.createRequest(userA.userId, {
        requester_business_id: bizA.business_id,
        receiver_business_id: bizA.business_id
      });
    } catch (err) {
      if (err.statusCode === 400) selfConnError = true;
    }
    assert.strictEqual(selfConnError, true, 'Self-connection was not rejected with 400 Bad Request');
    console.log('  ✓ Pass: Self-connection rejected');
    passed++;

    // 2.1 Negative receiver ID rejection
    console.log('[Test 2.1] Preventing negative/zero receiver business ID...');
    let negIdCaught = false;
    try {
      await connectionService.createRequest(userA.userId, {
        requester_business_id: bizA.business_id,
        receiver_business_id: -1
      });
    } catch (err) {
      if (err.statusCode === 400 && err.code === 'INVALID_BUSINESS_ID') {
        negIdCaught = true;
      }
    }
    assert.strictEqual(negIdCaught, true, 'Negative business ID must be rejected with 400 INVALID_BUSINESS_ID');
    console.log('  ✓ Pass: Negative business partner ID properly rejected with 400');
    passed++;

    // 3. Initiate connection request (BizA -> BizB)
    console.log('[Test 3] Initiating connection request (BizA -> BizB)...');
    connection = await connectionService.createRequest(userA.userId, {
      requester_business_id: bizA.business_id,
      receiver_business_id: bizB.business_id
    });
    assert(connection.connection_id, 'Connection ID missing');
    assert.strictEqual(connection.status, 'PENDING');
    assert.strictEqual(connection.requester_business_id, bizA.business_id);
    assert.strictEqual(connection.receiver_business_id, bizB.business_id);
    console.log(`  ✓ Pass: Connection request created in PENDING status (ID: ${connection.connection_id})`);
    passed++;

    // 4. Duplicate active connection rejection
    console.log('[Test 4] Duplicate active connection rejection...');
    let dupCaught = false;
    try {
      await connectionService.createRequest(userA.userId, {
        requester_business_id: bizA.business_id,
        receiver_business_id: bizB.business_id
      });
    } catch (err) {
      if (err.statusCode === 409) dupCaught = true;
    }
    assert.strictEqual(dupCaught, true, 'Duplicate connection was not rejected with 409 Conflict');
    console.log('  ✓ Pass: Duplicate connection rejected with 409 Conflict');
    passed++;

    // 5. Requester cannot accept their own request
    console.log('[Test 5] Enforcing authorization on connection acceptance...');
    let invalidAcceptCaught = false;
    try {
      await connectionService.updateStatus(userA.userId, connection.connection_id, 'ACCEPTED');
    } catch (err) {
      if (err.statusCode === 403) invalidAcceptCaught = true;
    }
    assert.strictEqual(invalidAcceptCaught, true, 'Requester was incorrectly able to accept their own connection request');
    console.log('  ✓ Pass: Requester cannot accept own request (403 Forbidden)');
    passed++;

    // 6. Recipient accepts connection request
    console.log('[Test 6] Recipient accepting connection request...');
    const accepted = await connectionService.updateStatus(userB.userId, connection.connection_id, 'ACCEPTED');
    assert.strictEqual(accepted.status, 'ACCEPTED');
    console.log('  ✓ Pass: Connection transitioned to ACCEPTED status');
    passed++;

    // 7. Messaging in accepted connection: User A sends message
    console.log('[Test 7] Sending message in accepted connection...');
    message = await messageService.sendMessage(userA.userId, connection.connection_id, {
      sender_business_id: bizA.business_id,
      body: 'Hello Bob! We are eager to partner on freight optimization across our western corridors.'
    });
    assert(message.message_id, 'Message ID missing');
    assert.strictEqual(message.connection_id, connection.connection_id);
    assert.strictEqual(message.sender_business_id, bizA.business_id);
    console.log(`  ✓ Pass: Message sent successfully (ID: ${message.message_id})`);
    passed++;

    // 8. User B sends reply message
    console.log('[Test 8] Receiving reply message...');
    const reply = await messageService.sendMessage(userB.userId, connection.connection_id, {
      sender_business_id: bizB.business_id,
      body: 'Greetings Alice! Let us review availability and schedules for next quarter.'
    });
    assert(reply.message_id, 'Reply message ID missing');
    console.log('  ✓ Pass: Reply message sent');
    passed++;

    // 9. Fetch conversation messages
    console.log('[Test 9] Fetching conversation messages...');
    const conversation = await messageService.getConversationMessages(userA.userId, connection.connection_id, {
      page: 1,
      pageSize: 10
    });
    assert.strictEqual(conversation.length, 2);
    assert.strictEqual(conversation[0].message_id, message.message_id);
    console.log('  ✓ Pass: Conversation history retrieved chronologically');
    passed++;

    // 10. List user conversation threads
    console.log('[Test 10] Listing recent conversation threads...');
    const threads = await messageService.getUserConversations(userA.userId);
    assert(threads.length >= 1, 'Threads list must contain at least 1 conversation');
    assert.strictEqual(threads[0].connection_id, connection.connection_id);
    assert(threads[0].last_message_body, 'Thread must preview the latest message');
    console.log('  ✓ Pass: User conversations list verified with latest message preview');
    passed++;

  } catch (err) {
    console.error('  ✗ Track 4 Test Failed with error:', err.message);
    failed++;
  } finally {
    // Cleanup created businesses & users
    try {
      if (bizA?.business_id) await pool.query('DELETE FROM businesses WHERE business_id = ?', [bizA.business_id]);
      if (bizB?.business_id) await pool.query('DELETE FROM businesses WHERE business_id = ?', [bizB.business_id]);
      if (userA?.userId) await pool.query('DELETE FROM users WHERE user_id = ?', [userA.userId]);
      if (userB?.userId) await pool.query('DELETE FROM users WHERE user_id = ?', [userB.userId]);
      console.log('[Cleanup] Test data cleaned up successfully.');
    } catch (cleanupErr) {
      console.error('[Cleanup Error]', cleanupErr.message);
    }
    await pool.end();
  }

  console.log('----------------------------------------------------');
  console.log(`Track 4 Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runConnectionsMessagesTests();
