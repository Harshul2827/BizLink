-- migrations/001_initial_setup.sql
-- Runnable SQL migration — creates all tables + indexes from scratch.
-- Tables are ordered strictly by FK dependency so this runs top-to-bottom
-- on a fresh MySQL database without constraint errors.
-- Run with: mysql -u <user> -p <database> < 001_initial_setup.sql

SET FOREIGN_KEY_CHECKS = 0;

-- ═══════════════════════════════════════════════════════════════
-- OLTP — Operational Schema (16 tables)
-- ═══════════════════════════════════════════════════════════════

-- 1. users (no foreign-key dependencies)
CREATE TABLE IF NOT EXISTS users (
  user_id       BIGINT       AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) UNIQUE NOT NULL,
  phone         VARCHAR(20)  UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  avatar_url    VARCHAR(500),
  role          ENUM('OWNER','PARTNER','ADMIN') NOT NULL,
  status        ENUM('ACTIVE','SUSPENDED')      NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. categories (self-referencing FK — safe with FOREIGN_KEY_CHECKS=0)
CREATE TABLE IF NOT EXISTS categories (
  category_id INT  AUTO_INCREMENT PRIMARY KEY,
  parent_id   INT,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) UNIQUE NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- 3. businesses (depends on users, categories)
CREATE TABLE IF NOT EXISTS businesses (
  business_id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
  owner_user_id       BIGINT       NOT NULL,
  primary_category_id INT,
  name                VARCHAR(160) NOT NULL,
  slug                VARCHAR(180) UNIQUE NOT NULL,
  description         TEXT,
  city                VARCHAR(100),
  state               VARCHAR(100),
  country             VARCHAR(100),
  status              ENUM('ACTIVE','SUSPENDED','UNVERIFIED','VERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id)       REFERENCES users(user_id),
  FOREIGN KEY (primary_category_id) REFERENCES categories(category_id)
);

-- 4. business_members (depends on businesses, users)
CREATE TABLE IF NOT EXISTS business_members (
  business_id BIGINT NOT NULL,
  user_id     BIGINT NOT NULL,
  member_role ENUM('ADMIN','STAFF') NOT NULL,
  joined_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (business_id, user_id),
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)     REFERENCES users(user_id)          ON DELETE CASCADE
);

-- 5. services (depends on businesses, categories)
CREATE TABLE IF NOT EXISTS services (
  service_id  BIGINT         AUTO_INCREMENT PRIMARY KEY,
  business_id BIGINT         NOT NULL,
  category_id INT,
  title       VARCHAR(160)   NOT NULL,
  price_min   DECIMAL(12,2),
  price_max   DECIMAL(12,2),
  status      ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 6. needs (depends on businesses, categories)
CREATE TABLE IF NOT EXISTS needs (
  need_id     BIGINT       AUTO_INCREMENT PRIMARY KEY,
  business_id BIGINT       NOT NULL,
  category_id INT,
  title       VARCHAR(160) NOT NULL,
  budget_min  DECIMAL(12,2),
  budget_max  DECIMAL(12,2),
  deadline    DATE,
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 7. matches (depends on needs, services)
CREATE TABLE IF NOT EXISTS matches (
  match_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
  need_id      BIGINT NOT NULL,
  service_id   BIGINT NOT NULL,
  score        DECIMAL(5,4),
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (need_id)    REFERENCES needs(need_id)       ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- 8. connections (depends on businesses)
CREATE TABLE IF NOT EXISTS connections (
  connection_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  requester_business_id BIGINT NOT NULL,
  receiver_business_id  BIGINT NOT NULL,
  status               ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED','BLOCKED') NOT NULL DEFAULT 'PENDING',
  requested_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_business_id)  REFERENCES businesses(business_id) ON DELETE CASCADE,
  UNIQUE (requester_business_id, receiver_business_id)
);

-- 9. messages (depends on connections, users, businesses)
CREATE TABLE IF NOT EXISTS messages (
  message_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  connection_id      BIGINT NOT NULL,
  sender_user_id     BIGINT NOT NULL,
  sender_business_id BIGINT NOT NULL,
  body               TEXT   NOT NULL,
  sent_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id)      REFERENCES connections(connection_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id)     REFERENCES users(user_id),
  FOREIGN KEY (sender_business_id) REFERENCES businesses(business_id)
);

-- 10. collaborations (depends on businesses, needs, services)
CREATE TABLE IF NOT EXISTS collaborations (
  collaboration_id      BIGINT       AUTO_INCREMENT PRIMARY KEY,
  initiator_business_id BIGINT       NOT NULL,
  need_id               BIGINT,
  service_id            BIGINT,
  title                 VARCHAR(160) NOT NULL,
  status                ENUM('DRAFT','REQUESTED','NEGOTIATING','ACCEPTED','ACTIVE','COMPLETED','DECLINED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  start_date            DATE,
  end_date              DATE,
  FOREIGN KEY (initiator_business_id) REFERENCES businesses(business_id),
  FOREIGN KEY (need_id)               REFERENCES needs(need_id)           ON DELETE SET NULL,
  FOREIGN KEY (service_id)            REFERENCES services(service_id)     ON DELETE SET NULL
);

-- 11. collaboration_participants (depends on collaborations, businesses)
CREATE TABLE IF NOT EXISTS collaboration_participants (
  collaboration_id BIGINT NOT NULL,
  business_id      BIGINT NOT NULL,
  participant_role ENUM('INITIATOR','PARTNER') NOT NULL,
  joined_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collaboration_id, business_id),
  FOREIGN KEY (collaboration_id) REFERENCES collaborations(collaboration_id) ON DELETE CASCADE,
  FOREIGN KEY (business_id)      REFERENCES businesses(business_id)
);

-- 12. reviews (depends on businesses, collaborations, users)
CREATE TABLE IF NOT EXISTS reviews (
  review_id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  reviewer_business_id  BIGINT   NOT NULL,
  reviewed_business_id  BIGINT   NOT NULL,
  collaboration_id      BIGINT,
  author_user_id        BIGINT   NOT NULL,
  rating                TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title                 VARCHAR(160),
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_business_id) REFERENCES businesses(business_id)    ON DELETE CASCADE,
  FOREIGN KEY (reviewed_business_id) REFERENCES businesses(business_id)    ON DELETE CASCADE,
  FOREIGN KEY (collaboration_id)     REFERENCES collaborations(collaboration_id) ON DELETE SET NULL,
  FOREIGN KEY (author_user_id)       REFERENCES users(user_id)
);

-- 13. posts (depends on businesses, users)
CREATE TABLE IF NOT EXISTS posts (
  post_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id    BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  content        TEXT   NOT NULL,
  like_count     INT    DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id)    REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(user_id)
);

-- 14. post_interactions (depends on posts, users)
CREATE TABLE IF NOT EXISTS post_interactions (
  interaction_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id          BIGINT NOT NULL,
  user_id          BIGINT NOT NULL,
  interaction_type ENUM('LIKE','COMMENT') NOT NULL,
  body             TEXT,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id)  REFERENCES posts(post_id)   ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE
);

-- 15. reports (depends on users)
CREATE TABLE IF NOT EXISTS reports (
  report_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_user_id BIGINT       NOT NULL,
  admin_user_id    BIGINT,
  target_type      ENUM('USER','BUSINESS','POST','REVIEW','MESSAGE') NOT NULL,
  target_id        BIGINT       NOT NULL,
  reason           VARCHAR(255) NOT NULL,
  status           ENUM('OPEN','RESOLVED') NOT NULL DEFAULT 'OPEN',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_user_id) REFERENCES users(user_id),
  FOREIGN KEY (admin_user_id)    REFERENCES users(user_id)
);

-- 16. activity_events (depends on users, businesses)
CREATE TABLE IF NOT EXISTS activity_events (
  event_id    BIGINT       AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT,
  business_id BIGINT,
  event_type  VARCHAR(80)  NOT NULL,
  metadata    JSON,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(user_id)          ON DELETE SET NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE SET NULL
);

-- ═══════════════════════════════════════════════════════════════
-- Analytics — Star Schema (5 tables)
-- ═══════════════════════════════════════════════════════════════

-- 17. dw_dim_date (no dependencies — date spine)
CREATE TABLE IF NOT EXISTS dw_dim_date (
  date_key  INT      PRIMARY KEY,   -- format: YYYYMMDD
  full_date DATE     NOT NULL,
  month     TINYINT  NOT NULL,
  year      SMALLINT NOT NULL
);

-- 18. dw_dim_business — SCD Type 2
CREATE TABLE IF NOT EXISTS dw_dim_business (
  business_sk    BIGINT       AUTO_INCREMENT PRIMARY KEY,
  business_id    BIGINT       NOT NULL,
  name           VARCHAR(160) NOT NULL,
  effective_from DATETIME     NOT NULL,
  effective_to   DATETIME,                         -- NULL = current row
  is_current     BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 19. dw_dim_user — SCD Type 2
-- NOTE: effective_to added to align with dw_dim_business (deviation from ER diagram)
CREATE TABLE IF NOT EXISTS dw_dim_user (
  user_sk        BIGINT      AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT      NOT NULL,
  role           VARCHAR(20) NOT NULL,
  effective_from DATETIME    NOT NULL,
  effective_to   DATETIME,                         -- NULL = current row
  is_current     BOOLEAN     NOT NULL DEFAULT TRUE
);

-- 20. dw_fact_collaboration (depends on dw_dim_date, dw_dim_business)
CREATE TABLE IF NOT EXISTS dw_fact_collaboration (
  fact_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  date_key             INT    NOT NULL,
  initiator_business_sk BIGINT NOT NULL,
  partner_business_sk   BIGINT NOT NULL,
  duration_days        INT,
  participant_count    INT,
  FOREIGN KEY (date_key)              REFERENCES dw_dim_date(date_key),
  FOREIGN KEY (initiator_business_sk) REFERENCES dw_dim_business(business_sk),
  FOREIGN KEY (partner_business_sk)   REFERENCES dw_dim_business(business_sk)
);

-- 21. dw_fact_review (depends on dw_dim_date, dw_dim_business, dw_dim_user)
CREATE TABLE IF NOT EXISTS dw_fact_review (
  fact_id              BIGINT  AUTO_INCREMENT PRIMARY KEY,
  date_key             INT     NOT NULL,
  reviewed_business_sk BIGINT  NOT NULL,
  reviewer_business_sk BIGINT  NOT NULL,
  author_user_sk       BIGINT  NOT NULL,
  rating               TINYINT NOT NULL,
  FOREIGN KEY (date_key)             REFERENCES dw_dim_date(date_key),
  FOREIGN KEY (reviewed_business_sk) REFERENCES dw_dim_business(business_sk),
  FOREIGN KEY (reviewer_business_sk) REFERENCES dw_dim_business(business_sk),
  FOREIGN KEY (author_user_sk)       REFERENCES dw_dim_user(user_sk)
);

-- ═══════════════════════════════════════════════════════════════
-- OLTP Indexes (Section 32)
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_users_status              ON users(status);
CREATE INDEX idx_users_role                ON users(role);
CREATE INDEX idx_categories_parent_id      ON categories(parent_id);
CREATE INDEX idx_businesses_owner_user_id       ON businesses(owner_user_id);
CREATE INDEX idx_businesses_primary_category_id ON businesses(primary_category_id);
CREATE INDEX idx_businesses_status              ON businesses(status);
CREATE INDEX idx_businesses_city                ON businesses(city);
CREATE INDEX idx_businesses_country             ON businesses(country);
CREATE INDEX idx_businesses_status_category     ON businesses(status, primary_category_id);
CREATE FULLTEXT INDEX idx_businesses_ft_search  ON businesses(name, description);
CREATE INDEX idx_business_members_user_id  ON business_members(user_id);
CREATE INDEX idx_services_business_id      ON services(business_id);
CREATE INDEX idx_services_category_id     ON services(category_id);
CREATE INDEX idx_services_status          ON services(status);
CREATE INDEX idx_services_category_status ON services(category_id, status);
CREATE INDEX idx_needs_business_id        ON needs(business_id);
CREATE INDEX idx_needs_category_id       ON needs(category_id);
CREATE INDEX idx_needs_deadline          ON needs(deadline);
CREATE INDEX idx_needs_category_deadline ON needs(category_id, deadline);
CREATE INDEX idx_matches_need_id         ON matches(need_id);
CREATE INDEX idx_matches_service_id      ON matches(service_id);
CREATE INDEX idx_matches_need_score      ON matches(need_id, score);
CREATE INDEX idx_connections_requester        ON connections(requester_business_id);
CREATE INDEX idx_connections_receiver         ON connections(receiver_business_id);
CREATE INDEX idx_connections_status           ON connections(status);
CREATE INDEX idx_connections_requester_status ON connections(requester_business_id, status);
CREATE INDEX idx_connections_receiver_status  ON connections(receiver_business_id, status);
CREATE INDEX idx_messages_connection_id      ON messages(connection_id);
CREATE INDEX idx_messages_sender_user_id     ON messages(sender_user_id);
CREATE INDEX idx_messages_connection_sent_at ON messages(connection_id, sent_at);
CREATE INDEX idx_collaborations_initiator        ON collaborations(initiator_business_id);
CREATE INDEX idx_collaborations_status           ON collaborations(status);
CREATE INDEX idx_collaborations_start_date       ON collaborations(start_date);
CREATE INDEX idx_collaborations_initiator_status ON collaborations(initiator_business_id, status);
CREATE INDEX idx_collab_participants_business_id ON collaboration_participants(business_id);
CREATE INDEX idx_reviews_reviewed_business ON reviews(reviewed_business_id);
CREATE INDEX idx_reviews_reviewer_business ON reviews(reviewer_business_id);
CREATE INDEX idx_reviews_collaboration_id  ON reviews(collaboration_id);
CREATE INDEX idx_reviews_created_at        ON reviews(created_at);
CREATE INDEX idx_reviews_reviewed_created  ON reviews(reviewed_business_id, created_at);
CREATE INDEX idx_posts_business_id         ON posts(business_id);
CREATE INDEX idx_posts_author_user_id      ON posts(author_user_id);
CREATE INDEX idx_posts_created_at          ON posts(created_at);
CREATE INDEX idx_posts_business_created    ON posts(business_id, created_at);
CREATE INDEX idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX idx_post_interactions_type    ON post_interactions(post_id, interaction_type);
CREATE INDEX idx_reports_reporter          ON reports(reporter_user_id);
CREATE INDEX idx_reports_status            ON reports(status);
CREATE INDEX idx_reports_target            ON reports(target_type, target_id);
CREATE INDEX idx_reports_created_at        ON reports(created_at);
CREATE INDEX idx_activity_user_id          ON activity_events(user_id);
CREATE INDEX idx_activity_business_id      ON activity_events(business_id);
CREATE INDEX idx_activity_event_type       ON activity_events(event_type);
CREATE INDEX idx_activity_created_at       ON activity_events(created_at);
CREATE INDEX idx_activity_user_created     ON activity_events(user_id, created_at);
CREATE INDEX idx_activity_business_type    ON activity_events(business_id, event_type);

-- ═══════════════════════════════════════════════════════════════
-- DW Indexes
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_dw_dim_business_natural ON dw_dim_business(business_id, is_current);
CREATE INDEX idx_dw_dim_business_current ON dw_dim_business(is_current);
CREATE INDEX idx_dw_dim_user_natural     ON dw_dim_user(user_id, is_current);
CREATE INDEX idx_dw_dim_user_current     ON dw_dim_user(is_current);
CREATE INDEX idx_dw_fact_collab_date      ON dw_fact_collaboration(date_key);
CREATE INDEX idx_dw_fact_collab_initiator ON dw_fact_collaboration(initiator_business_sk);
CREATE INDEX idx_dw_fact_collab_partner   ON dw_fact_collaboration(partner_business_sk);
CREATE INDEX idx_dw_fact_review_date      ON dw_fact_review(date_key);
CREATE INDEX idx_dw_fact_review_reviewed  ON dw_fact_review(reviewed_business_sk);
CREATE INDEX idx_dw_fact_review_reviewer  ON dw_fact_review(reviewer_business_sk);
CREATE INDEX idx_dw_fact_review_author    ON dw_fact_review(author_user_sk);

SET FOREIGN_KEY_CHECKS = 1;

