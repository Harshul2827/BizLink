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

  let userA = null;
  let userB = null;
  let bizA = null;
  let bizB = null;
  let connection = null;
  let message = null;

  try {
    // 1. Setup two test users and their respective businesses
    console.log('[Test 1] Setting up two test users and businesses...');
    const regA = await authService.register({
      email: `userA_${Date.now()}@conntest.com`,
      phone: `+1611${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Alice Founder',
      role: 'OWNER'
    });
    userA = regA.user;

    const regB = await authService.register({
      email: `userB_${Date.now()}@conntest.com`,
      phone: `+1622${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Bob Partner',
      role: 'OWNER'
    });
    userB = regB.user;

    bizA = await businessService.createBusiness(userA.userId, {
      name: `Alpha Corp ${Date.now()}`,
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

    // Verify activity event
    const [events] = await pool.query(
      `SELECT * FROM activity_events WHERE business_id = ? AND event_type = 'CONNECTION_REQUESTED'`,
      [bizA.business_id]
    );
    assert.strictEqual(events.length, 1, 'Activity event was not recorded for connection request');
    console.log(`  ✓ Pass: Connection request created in PENDING status (ID: ${connection.connection_id})`);
    passed++;

    // 4. Duplicate pending connection rejection
    console.log('[Test 4] Duplicate active connection rejection...');
    let duplicateError = false;
    try {
      await connectionService.createRequest(userA.userId, {
        requester_business_id: bizA.business_id,
        receiver_business_id: bizB.business_id
      });
    } catch (err) {
      if (err.statusCode === 409) duplicateError = true;
    }
    assert.strictEqual(duplicateError, true, 'Duplicate connection was not rejected with 409 Conflict');
    console.log('  ✓ Pass: Duplicate connection rejected with 409 Conflict');
    passed++;

    // 5. Unauthorized acceptance (Requester cannot accept their own request)
    console.log('[Test 5] Enforcing authorization on connection acceptance...');
    let forbiddenAccept = false;
    try {
      await connectionService.updateStatus(userA.userId, connection.connection_id, 'ACCEPTED');
    } catch (err) {
      if (err.statusCode === 403) forbiddenAccept = true;
    }
    assert.strictEqual(forbiddenAccept, true, 'Requester was incorrectly allowed to accept own request');
    console.log('  ✓ Pass: Requester cannot accept own request (403 Forbidden)');
    passed++;

    // 6. Valid acceptance by receiver admin (BizB)
    console.log('[Test 6] Recipient accepting connection request...');
    const accepted = await connectionService.updateStatus(userB.userId, connection.connection_id, 'ACCEPTED');
    assert.strictEqual(accepted.status, 'ACCEPTED');
    console.log('  ✓ Pass: Connection transitioned to ACCEPTED status');
    passed++;

    // 7. Messaging between connected businesses
    console.log('[Test 7] Sending message in accepted connection...');
    message = await messageService.sendMessage(userA.userId, connection.connection_id, {
      sender_business_id: bizA.business_id,
      body: 'Hello Bob! Excited to partner with Beta Logistics.'
    });
    assert(message.message_id, 'Message ID missing');
    assert.strictEqual(message.body, 'Hello Bob! Excited to partner with Beta Logistics.');
    assert.strictEqual(message.sender_user_id, userA.userId);
    console.log(`  ✓ Pass: Message sent successfully (ID: ${message.message_id})`);
    passed++;

    // 8. Bob replying to message
    console.log('[Test 8] Receiving reply message...');
    const reply = await messageService.sendMessage(userB.userId, connection.connection_id, {
      sender_business_id: bizB.business_id,
      body: 'Thanks Alice! Looking forward to working together.'
    });
    assert(reply.message_id, 'Reply message ID missing');
    console.log('  ✓ Pass: Reply message sent');
    passed++;

    // 9. Fetching conversation messages
    console.log('[Test 9] Fetching conversation messages...');
    const messageHistory = await messageService.getConversationMessages(userA.userId, connection.connection_id);
    assert.strictEqual(messageHistory.length, 2);
    assert.strictEqual(messageHistory[0].message_id, message.message_id);
    assert.strictEqual(messageHistory[1].message_id, reply.message_id);
    console.log('  ✓ Pass: Conversation history retrieved chronologically');
    passed++;

    // 10. Listing user conversations
    console.log('[Test 10] Listing recent conversation threads...');
    const conversations = await messageService.getUserConversations(userA.userId);
    assert(conversations.length >= 1, 'Expected at least 1 conversation in list');
    assert.strictEqual(conversations[0].connection_id, connection.connection_id);
    assert.strictEqual(conversations[0].last_message_body, 'Thanks Alice! Looking forward to working together.');
    console.log('  ✓ Pass: User conversations list verified with latest message preview');
    passed++;

  } catch (err) {
    console.error('  ✗ Test failure:', err);
    failed++;
  } finally {
    // Teardown test records
    try {
      if (connection) {
        await pool.query('DELETE FROM connections WHERE connection_id = ?', [connection.connection_id]);
      }
      if (bizA) {
        await pool.query('DELETE FROM businesses WHERE business_id = ?', [bizA.business_id]);
      }
      if (bizB) {
        await pool.query('DELETE FROM businesses WHERE business_id = ?', [bizB.business_id]);
      }
      if (userA) {
        await pool.query('DELETE FROM users WHERE user_id = ?', [userA.userId]);
      }
      if (userB) {
        await pool.query('DELETE FROM users WHERE user_id = ?', [userB.userId]);
      }
      console.log('[Cleanup] Test data cleaned up successfully.');
    } catch (cleanErr) {
      console.error('[Cleanup Error]', cleanErr.message);
    }
    await pool.end();
  }

  console.log('----------------------------------------------------');
  console.log(`Track 4 Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runConnectionsMessagesTests();
