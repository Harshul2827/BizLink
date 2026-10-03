-- seeds/13_dw_dimensions.sql
-- Seed the analytics star schema with current-state rows for all 15 businesses and 18 users
-- Populates dw_dim_date (spine), dw_dim_business, dw_dim_user, and 2 fact tables
-- All rows are is_current = TRUE (effective_to = NULL) — initial load, no SCD2 history yet

-- ─── dw_dim_date ─────────────────────────────────────────────────────────
-- Date spine covering the seed data window (Feb–Aug 2026)
INSERT INTO dw_dim_date (date_key, full_date, month, year) VALUES
(20260201, '2026-02-01', 2, 2026),
(20260210, '2026-02-10', 2, 2026),
(20260215, '2026-02-15', 2, 2026),
(20260301, '2026-03-01', 3, 2026),
(20260305, '2026-03-05', 3, 2026),
(20260711, '2026-07-11', 7, 2026),
(20260716, '2026-07-16', 7, 2026),
(20260811, '2026-08-11', 8, 2026);

-- ─── dw_dim_business ─────────────────────────────────────────────────────
INSERT INTO dw_dim_business (business_sk, business_id, name, effective_from, effective_to, is_current) VALUES
(1,  1,  'Happy Paws Veterinary Clinic', '2026-01-05 11:00:00', NULL, TRUE),
(2,  2,  'Bob Cool HVAC Solutions',      '2026-01-06 11:00:00', NULL, TRUE),
(3,  3,  'Alpha Digital Agency',         '2026-01-07 11:00:00', NULL, TRUE),
(4,  4,  'Pack It Up Supplies',          '2026-01-08 11:00:00', NULL, TRUE),
(5,  5,  'Green Leaf Foods',             '2026-01-09 11:00:00', NULL, TRUE),
(6,  6,  'TechBridge IT Solutions',      '2026-01-10 11:00:00', NULL, TRUE),
(7,  7,  'BrightSmile Dental Care',      '2026-01-11 11:00:00', NULL, TRUE),
(8,  8,  'Swift Logistics Partners',     '2026-01-12 11:00:00', NULL, TRUE),
(9,  9,  'Elegant Fabrics & Textiles',   '2026-01-13 11:00:00', NULL, TRUE),
(10, 10, 'CodeSprint Software Studio',   '2026-01-14 11:00:00', NULL, TRUE),
(11, 11, 'SolarEdge Energy Systems',     '2026-01-15 11:00:00', NULL, TRUE),
(12, 12, 'Blueprint Architects',         '2026-01-16 11:00:00', NULL, TRUE),
(13, 13, 'Fresh Bakery Wholesale',       '2026-01-17 11:00:00', NULL, TRUE),
(14, 14, 'MetalCraft Industries',        '2026-01-18 11:00:00', NULL, TRUE),
(15, 15, 'MediCare Pharma Distributors', '2026-01-19 11:00:00', NULL, TRUE);

-- ─── dw_dim_user ─────────────────────────────────────────────────────────
INSERT INTO dw_dim_user (user_sk, user_id, role, effective_from, effective_to, is_current) VALUES
(1,  1,  'ADMIN',   '2026-01-01 09:00:00', NULL, TRUE),
(2,  2,  'OWNER',   '2026-01-05 10:00:00', NULL, TRUE),
(3,  3,  'OWNER',   '2026-01-06 10:00:00', NULL, TRUE),
(4,  4,  'OWNER',   '2026-01-07 10:00:00', NULL, TRUE),
(5,  5,  'OWNER',   '2026-01-08 10:00:00', NULL, TRUE),
(6,  6,  'OWNER',   '2026-01-09 10:00:00', NULL, TRUE),
(7,  7,  'OWNER',   '2026-01-10 10:00:00', NULL, TRUE),
(8,  8,  'OWNER',   '2026-01-11 10:00:00', NULL, TRUE),
(9,  9,  'OWNER',   '2026-01-12 10:00:00', NULL, TRUE),
(10, 10, 'OWNER',   '2026-01-13 10:00:00', NULL, TRUE),
(11, 11, 'OWNER',   '2026-01-14 10:00:00', NULL, TRUE),
(12, 12, 'OWNER',   '2026-01-15 10:00:00', NULL, TRUE),
(13, 13, 'OWNER',   '2026-01-16 10:00:00', NULL, TRUE),
(14, 14, 'OWNER',   '2026-01-17 10:00:00', NULL, TRUE),
(15, 15, 'OWNER',   '2026-01-18 10:00:00', NULL, TRUE),
(16, 16, 'OWNER',   '2026-01-19 10:00:00', NULL, TRUE),
(17, 17, 'PARTNER', '2026-02-01 10:00:00', NULL, TRUE),
(18, 18, 'PARTNER', '2026-02-02 10:00:00', NULL, TRUE);

-- ─── dw_fact_collaboration ───────────────────────────────────────────────
-- One row per completed collaboration (collab 1 and collab 4)
INSERT INTO dw_fact_collaboration (fact_id, date_key, initiator_business_sk, partner_business_sk, duration_days, participant_count) VALUES
(1, 20260210, 1, 2, 181, 2),  -- Clinic HVAC: Feb 10 → Aug 10 = 181 days
(2, 20260215, 5, 8,  150, 2); -- Green Leaf Logistics: Feb 15 → Jul 15 = 150 days

-- ─── dw_fact_review ──────────────────────────────────────────────────────
-- One row per review (reviews 1–4 from completed collabs)
INSERT INTO dw_fact_review (fact_id, date_key, reviewed_business_sk, reviewer_business_sk, author_user_sk, rating) VALUES
(1, 20260811, 2,  1,  2,  5),  -- Clinic reviewed HVAC
(2, 20260811, 1,  2,  3,  4),  -- HVAC reviewed Clinic
(3, 20260716, 8,  5,  6,  5),  -- Green Leaf reviewed Swift
(4, 20260716, 5,  8,  9,  5);  -- Swift reviewed Green Leaf
