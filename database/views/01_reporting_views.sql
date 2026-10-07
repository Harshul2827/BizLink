-- views/01_reporting_views.sql
-- Curated current-state reporting views for BizLink analytics and Power BI

-- 1. Current Active Businesses
CREATE OR REPLACE VIEW vw_current_businesses AS
SELECT 
  b.business_id,
  b.owner_user_id,
  b.primary_category_id,
  b.name,
  b.slug,
  b.city,
  b.state,
  b.country,
  b.status,
  b.created_at,
  c.name AS primary_category_name,
  c.slug AS primary_category_slug,
  u.full_name AS owner_name,
  u.email AS owner_email
FROM businesses b
LEFT JOIN categories c ON b.primary_category_id = c.category_id
LEFT JOIN users u ON b.owner_user_id = u.user_id
WHERE b.status != 'SUSPENDED';

-- 2. Verified Businesses
CREATE OR REPLACE VIEW vw_verified_businesses AS
SELECT * 
FROM vw_current_businesses 
WHERE status = 'VERIFIED';

-- 3. Current Active Users (Excluding sensitive password hashes)
CREATE OR REPLACE VIEW vw_current_users AS
SELECT 
  user_id,
  email,
  phone,
  full_name,
  avatar_url,
  role,
  status,
  last_login_at,
  created_at
FROM users
WHERE status = 'ACTIVE';

-- 4. Current Active Services
CREATE OR REPLACE VIEW vw_active_services AS
SELECT 
  s.service_id,
  s.business_id,
  s.category_id,
  s.title,
  s.price_min,
  s.price_max,
  s.status,
  b.name AS business_name,
  c.name AS category_name
FROM services s
JOIN businesses b ON s.business_id = b.business_id
LEFT JOIN categories c ON s.category_id = c.category_id
WHERE s.status = 'ACTIVE' AND b.status != 'SUSPENDED';

-- 5. Current Active Needs
CREATE OR REPLACE VIEW vw_active_needs AS
SELECT 
  n.need_id,
  n.business_id,
  n.category_id,
  n.title,
  n.budget_min,
  n.budget_max,
  n.deadline,
  b.name AS business_name,
  c.name AS category_name
FROM needs n
JOIN businesses b ON n.business_id = b.business_id
LEFT JOIN categories c ON n.category_id = c.category_id
WHERE b.status != 'SUSPENDED';

-- 6. Active Collaborations
CREATE OR REPLACE VIEW vw_active_collaborations AS
SELECT 
  c.collaboration_id,
  c.initiator_business_id,
  c.need_id,
  c.service_id,
  c.title,
  c.status,
  c.start_date,
  c.end_date,
  b.name AS initiator_business_name
FROM collaborations c
JOIN businesses b ON c.initiator_business_id = b.business_id
WHERE c.status = 'ACTIVE';

-- 7. Completed Collaborations
CREATE OR REPLACE VIEW vw_completed_collaborations AS
SELECT 
  c.collaboration_id,
  c.initiator_business_id,
  c.need_id,
  c.service_id,
  c.title,
  c.status,
  c.start_date,
  c.end_date,
  DATEDIFF(COALESCE(c.end_date, CURRENT_DATE), c.start_date) AS duration_days,
  b.name AS initiator_business_name
FROM collaborations c
JOIN businesses b ON c.initiator_business_id = b.business_id
WHERE c.status = 'COMPLETED';

-- 8. Business Review Summary
CREATE OR REPLACE VIEW vw_business_review_summary AS
SELECT 
  reviewed_business_id,
  COUNT(review_id) AS total_reviews,
  ROUND(AVG(rating), 2) AS average_rating,
  MIN(rating) AS min_rating,
  MAX(rating) AS max_rating
FROM reviews
GROUP BY reviewed_business_id;
