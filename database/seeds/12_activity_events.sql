-- seeds/12_activity_events.sql
-- 22 activity events covering all major system event types
-- metadata stored as JSON strings

INSERT INTO activity_events (event_id, user_id, business_id, event_type, metadata, created_at) VALUES

(1,  2,  1,  'BUSINESS_REGISTERED',     '{"status":"UNVERIFIED"}',                         '2026-01-05 11:00:00'),
(2,  2,  1,  'BUSINESS_VERIFIED',       '{"verified_by":"admin@bizlink.com"}',              '2026-01-06 09:00:00'),
(3,  3,  2,  'BUSINESS_REGISTERED',     '{"status":"UNVERIFIED"}',                         '2026-01-06 11:00:00'),
(4,  3,  2,  'BUSINESS_VERIFIED',       '{"verified_by":"admin@bizlink.com"}',              '2026-01-07 09:00:00'),
(5,  2,  1,  'CONNECTION_SENT',         '{"receiver_business_id":2}',                       '2026-02-05 09:00:00'),
(6,  3,  2,  'CONNECTION_ACCEPTED',     '{"requester_business_id":1}',                      '2026-02-05 12:00:00'),
(7,  2,  1,  'CONNECTION_SENT',         '{"receiver_business_id":3}',                       '2026-02-06 09:00:00'),
(8,  4,  3,  'CONNECTION_ACCEPTED',     '{"requester_business_id":1}',                      '2026-02-06 14:00:00'),
(9,  2,  1,  'COLLABORATION_INITIATED', '{"collaboration_id":1,"title":"Clinic HVAC"}',     '2026-02-10 10:00:00'),
(10, 3,  2,  'COLLABORATION_JOINED',    '{"collaboration_id":1,"role":"PARTNER"}',          '2026-02-10 10:05:00'),
(11, 6,  5,  'COLLABORATION_INITIATED', '{"collaboration_id":3,"title":"Green Leaf Eco"}',  '2026-03-05 10:00:00'),
(12, 5,  4,  'COLLABORATION_JOINED',    '{"collaboration_id":3,"role":"PARTNER"}',          '2026-03-05 10:05:00'),
(13, 2,  1,  'REVIEW_POSTED',           '{"review_id":1,"reviewed_business_id":2}',         '2026-08-11 10:00:00'),
(14, 3,  2,  'REVIEW_POSTED',           '{"review_id":2,"reviewed_business_id":1}',         '2026-08-12 10:00:00'),
(15, 4,  3,  'POST_CREATED',            '{"post_id":3}',                                   '2026-03-03 09:00:00'),
(16, 7,  6,  'POST_CREATED',            '{"post_id":5}',                                   '2026-03-05 09:00:00'),
(17, 16, 15, 'CONNECTION_SENT',         '{"receiver_business_id":4}',                       '2026-02-09 09:00:00'),
(18, 5,  4,  'CONNECTION_ACCEPTED',     '{"requester_business_id":15}',                     '2026-02-09 15:00:00'),
(19, 16, 15, 'CONNECTION_SENT',         '{"receiver_business_id":8}',                       '2026-02-10 09:00:00'),
(20, 9,  8,  'CONNECTION_ACCEPTED',     '{"requester_business_id":15}',                     '2026-02-10 15:00:00'),
(21, 1,  NULL,'REPORT_RESOLVED',        '{"report_id":1,"target_type":"BUSINESS"}',         '2026-03-15 14:00:00'),
(22, 15, 14, 'BUSINESS_SUSPENDED',      '{"reason":"Policy violation detected by admin"}',  '2026-01-25 10:00:00');
