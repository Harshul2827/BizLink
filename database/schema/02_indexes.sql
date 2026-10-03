-- schema/02_indexes.sql
-- OLTP Indexes: derived from PRD Section 32 query patterns
-- Purpose documented per index per Section 32.1

-- ─── users ────────────────────────────────────────────────────────────────
-- Support admin moderation and role-based filtering
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role   ON users(role);

-- ─── categories ───────────────────────────────────────────────────────────
-- Support parent/child hierarchy traversal
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- ─── businesses ───────────────────────────────────────────────────────────
-- Support discovery filters: status, category, location (Section 32.2)
CREATE INDEX idx_businesses_owner_user_id       ON businesses(owner_user_id);
CREATE INDEX idx_businesses_primary_category_id ON businesses(primary_category_id);
CREATE INDEX idx_businesses_status              ON businesses(status);
CREATE INDEX idx_businesses_city                ON businesses(city);
CREATE INDEX idx_businesses_country             ON businesses(country);
-- Composite: most common discovery query (status + category together)
CREATE INDEX idx_businesses_status_category     ON businesses(status, primary_category_id);
-- Full-text search on business name and description
CREATE FULLTEXT INDEX idx_businesses_ft_search  ON businesses(name, description);

-- ─── business_members ─────────────────────────────────────────────────────
-- Lookup all businesses a given user belongs to (auth check path)
CREATE INDEX idx_business_members_user_id ON business_members(user_id);

-- ─── services ─────────────────────────────────────────────────────────────
-- Support discovery and matching (Section 32.3)
CREATE INDEX idx_services_business_id     ON services(business_id);
CREATE INDEX idx_services_category_id    ON services(category_id);
CREATE INDEX idx_services_status         ON services(status);
-- Composite: category+status is the primary service discovery filter
CREATE INDEX idx_services_category_status ON services(category_id, status);

-- ─── needs ────────────────────────────────────────────────────────────────
-- Support matching and deadline-based filtering (Section 32.3)
CREATE INDEX idx_needs_business_id        ON needs(business_id);
CREATE INDEX idx_needs_category_id       ON needs(category_id);
CREATE INDEX idx_needs_deadline          ON needs(deadline);
CREATE INDEX idx_needs_category_deadline ON needs(category_id, deadline);

-- ─── matches ──────────────────────────────────────────────────────────────
-- Retrieve matches by need with score ranking
CREATE INDEX idx_matches_need_id    ON matches(need_id);
CREATE INDEX idx_matches_service_id ON matches(service_id);
-- Composite: retrieve best matches for a need sorted by score
CREATE INDEX idx_matches_need_score ON matches(need_id, score);

-- ─── connections ──────────────────────────────────────────────────────────
-- Support connection state queries and duplicate detection (Section 32.4)
CREATE INDEX idx_connections_requester        ON connections(requester_business_id);
CREATE INDEX idx_connections_receiver         ON connections(receiver_business_id);
CREATE INDEX idx_connections_status           ON connections(status);
-- Composite: pending inbox/outbox queries
CREATE INDEX idx_connections_requester_status ON connections(requester_business_id, status);
CREATE INDEX idx_connections_receiver_status  ON connections(receiver_business_id, status);

-- ─── messages ─────────────────────────────────────────────────────────────
-- Support thread retrieval and chronological paging (Section 32.5)
CREATE INDEX idx_messages_connection_id      ON messages(connection_id);
CREATE INDEX idx_messages_sender_user_id     ON messages(sender_user_id);
-- Composite: paginated message thread (connection ordered by time)
CREATE INDEX idx_messages_connection_sent_at ON messages(connection_id, sent_at);

-- ─── collaborations ───────────────────────────────────────────────────────
-- Support lifecycle and business dashboard queries (Section 32.6)
CREATE INDEX idx_collaborations_initiator        ON collaborations(initiator_business_id);
CREATE INDEX idx_collaborations_status           ON collaborations(status);
CREATE INDEX idx_collaborations_start_date       ON collaborations(start_date);
-- Composite: active/filtered collaboration list
CREATE INDEX idx_collaborations_initiator_status ON collaborations(initiator_business_id, status);

-- ─── collaboration_participants ────────────────────────────────────────────
-- Lookup all collaborations a given business participates in (Section 32.6)
CREATE INDEX idx_collab_participants_business_id ON collaboration_participants(business_id);

-- ─── reviews ──────────────────────────────────────────────────────────────
-- Support profile trust display and eligibility checks (Section 32.7)
CREATE INDEX idx_reviews_reviewed_business   ON reviews(reviewed_business_id);
CREATE INDEX idx_reviews_reviewer_business   ON reviews(reviewer_business_id);
CREATE INDEX idx_reviews_collaboration_id    ON reviews(collaboration_id);
CREATE INDEX idx_reviews_created_at          ON reviews(created_at);
-- Composite: profile review feed (business ordered by date)
CREATE INDEX idx_reviews_reviewed_created    ON reviews(reviewed_business_id, created_at);

-- ─── posts ────────────────────────────────────────────────────────────────
-- Support business feed and chronological display
CREATE INDEX idx_posts_business_id      ON posts(business_id);
CREATE INDEX idx_posts_author_user_id   ON posts(author_user_id);
CREATE INDEX idx_posts_created_at       ON posts(created_at);
-- Composite: business feed ordered by time
CREATE INDEX idx_posts_business_created ON posts(business_id, created_at);

-- ─── post_interactions ────────────────────────────────────────────────────
-- Support like count and comment retrieval
CREATE INDEX idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX idx_post_interactions_user_id ON post_interactions(user_id);
-- Composite: filter interactions by type per post
CREATE INDEX idx_post_interactions_type   ON post_interactions(post_id, interaction_type);

-- ─── reports ──────────────────────────────────────────────────────────────
-- Support admin moderation dashboard
CREATE INDEX idx_reports_reporter   ON reports(reporter_user_id);
CREATE INDEX idx_reports_status     ON reports(status);
CREATE INDEX idx_reports_target     ON reports(target_type, target_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- ─── activity_events ──────────────────────────────────────────────────────
-- Support audit queries and analytics (Section 32.8)
CREATE INDEX idx_activity_user_id       ON activity_events(user_id);
CREATE INDEX idx_activity_business_id   ON activity_events(business_id);
CREATE INDEX idx_activity_event_type    ON activity_events(event_type);
CREATE INDEX idx_activity_created_at    ON activity_events(created_at);
-- Composite: user audit trail ordered by time
CREATE INDEX idx_activity_user_created  ON activity_events(user_id, created_at);
-- Composite: business-level event type filtering
CREATE INDEX idx_activity_business_type ON activity_events(business_id, event_type);
