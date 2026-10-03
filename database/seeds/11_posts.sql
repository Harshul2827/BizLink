-- seeds/11_posts.sql
-- 11 posts + 14 interactions (likes and comments)
-- Posts cover: business updates, opportunities posted, service highlights

INSERT INTO posts (post_id, business_id, author_user_id, content, like_count, created_at) VALUES

(1,  1,  2,  'Happy Paws is now offering corporate pet wellness packages for company events. DM us for bulk rates!', 5, '2026-03-01 09:00:00'),
(2,  2,  3,  'Offering seasonal HVAC inspection discounts for commercial clients in Mumbai and Pune. Book now!',      8, '2026-03-02 09:00:00'),
(3,  3,  4,  'Alpha Agency is looking for B2B healthcare clients to help grow their digital presence. Reach out!',   4, '2026-03-03 09:00:00'),
(4,  5,  6,  'Green Leaf Foods is seeking reliable cold chain logistics partners for pan-India distribution.',         7, '2026-03-04 09:00:00'),
(5,  6,  7,  'TechBridge IT is now accepting project RFPs for custom ERP development. Slots limited!',               3, '2026-03-05 09:00:00'),
(6,  8,  9,  'Swift Logistics announces expanded cold chain services across 10 new cities from April 2026.',          6, '2026-03-06 09:00:00'),
(7,  11, 12, 'SolarEdge has completed 50+ commercial solar installations. Our portfolio is available on request.',    9, '2026-03-07 09:00:00'),
(8,  15, 16, 'MediCare Pharma Distributors is looking for last-mile delivery partners in Tier-2 cities.',             2, '2026-03-08 09:00:00'),
(9,  4,  5,  'Pack It Up now stocks FSC-certified corrugated boxes for eco-conscious brands. Ask about MOQ.',         4, '2026-03-09 09:00:00'),
(10, 12, 13, 'Blueprint Architects sharing case study: our latest industrial design project in Noida.',               5, '2026-03-10 09:00:00'),
(11, 13, 14, 'Fresh Bakery Wholesale has openings for new hotel and catering supply contracts for Q2 2026.',          3, '2026-03-11 09:00:00');

-- Post interactions: likes and comments
INSERT INTO post_interactions (interaction_id, post_id, user_id, interaction_type, body, created_at) VALUES
(1,  1,  3,  'LIKE',    NULL,                                                      '2026-03-01 12:00:00'),
(2,  1,  7,  'COMMENT', 'Great initiative! We would love to explore this.',        '2026-03-01 13:00:00'),
(3,  2,  2,  'LIKE',    NULL,                                                      '2026-03-02 10:00:00'),
(4,  2,  8,  'COMMENT', 'What is the rate for a 10-ton commercial unit?',          '2026-03-02 11:00:00'),
(5,  4,  9,  'LIKE',    NULL,                                                      '2026-03-04 10:00:00'),
(6,  4,  16, 'COMMENT', 'We are very interested, will send a connection request.', '2026-03-04 11:00:00'),
(7,  6,  16, 'LIKE',    NULL,                                                      '2026-03-06 10:00:00'),
(8,  7,  7,  'LIKE',    NULL,                                                      '2026-03-07 10:00:00'),
(9,  7,  6,  'COMMENT', 'Impressive track record! Reached out via connections.',   '2026-03-07 11:00:00'),
(10, 8,  9,  'LIKE',    NULL,                                                      '2026-03-08 10:00:00'),
(11, 8,  5,  'COMMENT', 'We can help with Pune and Nashik regions.',               '2026-03-08 11:00:00'),
(12, 9,  6,  'LIKE',    NULL,                                                      '2026-03-09 10:00:00'),
(13, 10, 7,  'COMMENT', 'Would love to see the Noida case study. Can you share?', '2026-03-10 10:00:00'),
(14, 11, 9,  'LIKE',    NULL,                                                      '2026-03-11 10:00:00');
