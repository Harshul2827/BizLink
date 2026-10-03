-- schema/03_dw_indexes.sql
-- Analytics Star Schema Indexes
-- Supports SCD2 current-row lookups and fact table join patterns

-- ─── dw_dim_business ──────────────────────────────────────────────────────
-- Lookup current version of a business by natural key
CREATE INDEX idx_dw_dim_business_natural ON dw_dim_business(business_id, is_current);
-- Filter current rows only (used heavily in fact joins)
CREATE INDEX idx_dw_dim_business_current ON dw_dim_business(is_current);

-- ─── dw_dim_user ──────────────────────────────────────────────────────────
-- Lookup current version of a user by natural key
CREATE INDEX idx_dw_dim_user_natural ON dw_dim_user(user_id, is_current);
-- Filter current rows only
CREATE INDEX idx_dw_dim_user_current ON dw_dim_user(is_current);

-- ─── dw_fact_collaboration ────────────────────────────────────────────────
-- Date-based slicing for time-series reports
CREATE INDEX idx_dw_fact_collab_date      ON dw_fact_collaboration(date_key);
-- Business-dimension joins
CREATE INDEX idx_dw_fact_collab_initiator ON dw_fact_collaboration(initiator_business_sk);
CREATE INDEX idx_dw_fact_collab_partner   ON dw_fact_collaboration(partner_business_sk);

-- ─── dw_fact_review ───────────────────────────────────────────────────────
-- Date-based slicing for rating trend reports
CREATE INDEX idx_dw_fact_review_date     ON dw_fact_review(date_key);
-- Business-dimension joins for reviewed / reviewer
CREATE INDEX idx_dw_fact_review_reviewed ON dw_fact_review(reviewed_business_sk);
CREATE INDEX idx_dw_fact_review_reviewer ON dw_fact_review(reviewer_business_sk);
-- User dimension join for author
CREATE INDEX idx_dw_fact_review_author   ON dw_fact_review(author_user_sk);
