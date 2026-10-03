-- seeds/09_collaborations.sql
-- 8 collaborations with participants — covers COMPLETED, ACTIVE, REQUESTED, DECLINED, CANCELLED statuses

INSERT INTO collaborations (collaboration_id, initiator_business_id, need_id, service_id, title, status, start_date, end_date) VALUES
(1, 1, 1, 5,  'Clinic HVAC Annual Contract 2026',               'COMPLETED',   '2026-02-10', '2026-08-10'),
(2, 1, 2, 7,  'Happy Paws Digital Marketing Campaign',           'ACTIVE',      '2026-03-01', '2026-09-01'),
(3, 5, 6, 11, 'Green Leaf Eco Packaging Partnership',            'ACTIVE',      '2026-03-05', '2026-12-31'),
(4, 5, 7, 22, 'Green Leaf Cold Chain Logistics Deal',            'COMPLETED',   '2026-02-15', '2026-07-15'),
(5, 15,10, 11,'MediCare Pharma Packaging Supply Agreement',      'ACTIVE',      '2026-03-10', '2026-12-31'),
(6, 6, 14, 27,'TechBridge Office Solar Installation',            'REQUESTED',   NULL,          NULL),
(7, 9, 20, 20,'Elegant Fabrics Export Logistics Arrangement',    'DECLINED',    NULL,          NULL),
(8, 13,  9,  7,'Fresh Bakery Brand Awareness Campaign',          'CANCELLED',   NULL,          NULL);

-- Participants (each collaboration has initiator + at least one partner)
INSERT INTO collaboration_participants (collaboration_id, business_id, participant_role, joined_at) VALUES
(1, 1,  'INITIATOR', '2026-02-10 10:00:00'),
(1, 2,  'PARTNER',   '2026-02-10 10:05:00'),
(2, 1,  'INITIATOR', '2026-03-01 10:00:00'),
(2, 3,  'PARTNER',   '2026-03-01 10:05:00'),
(3, 5,  'INITIATOR', '2026-03-05 10:00:00'),
(3, 4,  'PARTNER',   '2026-03-05 10:05:00'),
(4, 5,  'INITIATOR', '2026-02-15 10:00:00'),
(4, 8,  'PARTNER',   '2026-02-15 10:05:00'),
(5, 15, 'INITIATOR', '2026-03-10 10:00:00'),
(5, 4,  'PARTNER',   '2026-03-10 10:05:00'),
(6, 6,  'INITIATOR', '2026-02-11 10:00:00'),
(6, 11, 'PARTNER',   '2026-02-11 10:05:00'),
(7, 9,  'INITIATOR', '2026-02-08 10:00:00'),
(7, 8,  'PARTNER',   '2026-02-08 10:05:00'),
(8, 13, 'INITIATOR', '2026-03-03 10:00:00'),
(8, 3,  'PARTNER',   '2026-03-03 10:05:00');
