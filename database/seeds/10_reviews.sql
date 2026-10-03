-- seeds/10_reviews.sql
-- 13 reviews for completed collaborations (collab 1 and collab 4)
-- Reviews can only be left after a COMPLETED collaboration (PRD constraint)
-- rating 1-5

INSERT INTO reviews (review_id, reviewer_business_id, reviewed_business_id, collaboration_id, author_user_id, rating, title, created_at) VALUES

-- Collab 1: Clinic ↔ HVAC — bidirectional reviews
(1,  1, 2, 1, 2, 5, 'Outstanding HVAC service, highly professional team',         '2026-08-11 10:00:00'),
(2,  2, 1, 1, 3, 4, 'Great client to work with, prompt communication',            '2026-08-12 10:00:00'),

-- Collab 4: Green Leaf ↔ Swift Logistics — bidirectional reviews
(3,  5, 8, 4, 6, 5, 'Swift delivered on time every single month, excellent',      '2026-07-16 10:00:00'),
(4,  8, 5, 4, 9, 5, 'Green Leaf team is well-organised and responsive',           '2026-07-17 10:00:00'),

-- Additional standalone reviews (not tied to completed collab — testing nullable FK)
(5,  3, 6, NULL, 4, 4, 'TechBridge built our campaign assets efficiently',         '2026-04-01 10:00:00'),
(6,  7, 2, NULL, 8, 5, 'Bob Cool fixed our AC system same day, excellent service', '2026-04-05 10:00:00'),
(7,  4, 5, NULL, 5, 4, 'Green Leaf supply quality is consistently good',          '2026-04-10 10:00:00'),
(8,  9, 8, NULL, 10, 3, 'Logistics were mostly good but had minor delays',         '2026-04-15 10:00:00'),
(9,  11, 6, NULL, 12, 5, 'TechBridge IT consulting was insightful and actionable', '2026-04-20 10:00:00'),
(10, 6, 11, NULL, 7, 5, 'SolarEdge energy audit saved us significant costs',      '2026-04-25 10:00:00'),
(11, 13, 4, NULL, 14, 4, 'Pack It Up delivered packaging on time and to spec',     '2026-05-01 10:00:00'),
(12, 15, 4, NULL, 16, 5, 'Pack It Up is our go-to pharma packaging partner',      '2026-05-05 10:00:00'),
(13, 15, 8, NULL, 16, 4, 'Swift Logistics handles our cold chain professionally',  '2026-05-10 10:00:00');
