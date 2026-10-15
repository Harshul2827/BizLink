require('dotenv').config();
const pool = require('../db');

async function inspectAllDetails() {
  console.log('=== DETAILED TABLE CONTENT INSPECTION ===\n');

  // Categories
  const [categories] = await pool.query('SELECT * FROM categories');
  console.log('--- CATEGORIES ---', categories.length);
  console.table(categories);

  // Businesses
  const [businesses] = await pool.query('SELECT business_id, owner_user_id, name, city, status, created_at FROM businesses');
  console.log('--- BUSINESSES ---', businesses.length);
  console.table(businesses);

  // Business Members
  const [members] = await pool.query('SELECT * FROM business_members');
  console.log('--- BUSINESS MEMBERS ---', members.length);
  console.table(members);

  // Services
  const [services] = await pool.query('SELECT service_id, business_id, category_id, title, price_min, price_max, status FROM services');
  console.log('--- SERVICES ---', services.length);
  console.table(services.slice(0, 5));

  // Needs
  const [needs] = await pool.query('SELECT need_id, business_id, category_id, title, budget_min, budget_max, deadline FROM needs');
  console.log('--- NEEDS ---', needs.length);
  console.table(needs.slice(0, 5));

  // Matches
  const [matches] = await pool.query('SELECT * FROM matches');
  console.log('--- MATCHES ---', matches.length);
  console.table(matches.slice(0, 5));

  // Connections
  const [connections] = await pool.query('SELECT * FROM connections');
  console.log('--- CONNECTIONS ---', connections.length);
  console.table(connections);

  // Messages
  const [messages] = await pool.query('SELECT * FROM messages');
  console.log('--- MESSAGES ---', messages.length);
  console.table(messages);

  // Collaborations
  const [collaborations] = await pool.query('SELECT collaboration_id, initiator_business_id, title, status FROM collaborations');
  console.log('--- COLLABORATIONS ---', collaborations.length);
  console.table(collaborations);

  // Collaboration Participants
  const [collabParts] = await pool.query('SELECT * FROM collaboration_participants');
  console.log('--- COLLABORATION PARTICIPANTS ---', collabParts.length);
  console.table(collabParts);

  // Reviews
  const [reviews] = await pool.query('SELECT review_id, reviewer_business_id, reviewed_business_id, rating, title FROM reviews');
  console.log('--- REVIEWS ---', reviews.length);
  console.table(reviews);

  // Posts
  const [posts] = await pool.query('SELECT post_id, business_id, author_user_id, content FROM posts');
  console.log('--- POSTS ---', posts.length);
  console.table(posts);

  // Post Interactions
  const [interactions] = await pool.query('SELECT * FROM post_interactions');
  console.log('--- POST INTERACTIONS ---', interactions.length);
  console.table(interactions);

  // Reports
  const [reports] = await pool.query('SELECT * FROM reports');
  console.log('--- REPORTS ---', reports.length);
  console.table(reports);

  // Activity Events
  const [events] = await pool.query('SELECT event_id, user_id, business_id, event_type, created_at FROM activity_events');
  console.log('--- ACTIVITY EVENTS ---', events.length);
  console.table(events.slice(0, 5));

  // DW Fact Collaboration
  const [factCollab] = await pool.query('SELECT * FROM dw_fact_collaboration');
  console.log('--- DW FACT COLLABORATION ---', factCollab.length);
  console.table(factCollab);

  // DW Fact Review
  const [factReview] = await pool.query('SELECT * FROM dw_fact_review');
  console.log('--- DW FACT REVIEW ---', factReview.length);
  console.table(factReview);

  // DW Dim Date
  const [dimDate] = await pool.query('SELECT * FROM dw_dim_date');
  console.log('--- DW DIM DATE ---', dimDate.length);
  console.table(dimDate);

  process.exit(0);
}

inspectAllDetails().catch(err => {
  console.error(err);
  process.exit(1);
});
