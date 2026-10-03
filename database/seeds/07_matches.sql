-- seeds/07_matches.sql
-- 16 rule-based matches — linking needs to relevant services by category
-- score 0.0000–1.0000 (DECIMAL 5,4)

INSERT INTO matches (match_id, need_id, service_id, score, generated_at) VALUES

-- Vet Clinic HVAC need (need 1) → Bob Cool HVAC service (service 5)
(1,  1,  5, 0.9500, '2026-02-01 08:00:00'),
-- Vet Clinic Marketing need (need 2) → Alpha Agency (service 7)
(2,  2,  7, 0.8800, '2026-02-01 08:01:00'),
-- Vet Clinic Marketing need (need 2) → CodeSprint Marketing (service 25)
(3,  2, 25, 0.7200, '2026-02-01 08:01:30'),
-- Vet Clinic Packaging need (need 3) → Pack It Up (service 12)
(4,  3, 12, 0.9100, '2026-02-01 08:02:00'),

-- Dental Clinic HVAC need (need 4) → Bob Cool HVAC (service 4)
(5,  4,  4, 0.9300, '2026-02-02 08:00:00'),
-- Dental Marketing need (need 5) → Alpha Agency (service 8)
(6,  5,  8, 0.8500, '2026-02-02 08:01:00'),

-- Green Leaf Packaging need (need 6) → Pack It Up Eco (service 11)
(7,  6, 11, 0.9200, '2026-02-03 08:00:00'),
-- Green Leaf Logistics need (need 7) → Swift Logistics (service 22)
(8,  7, 22, 0.8700, '2026-02-03 08:01:00'),

-- Bakery Packaging need (need 8) → Pack It Up (service 10)
(9,  8, 10, 0.8900, '2026-02-04 08:00:00'),
-- Bakery Marketing need (need 9) → Alpha Agency (service 7)
(10, 9,  7, 0.8000, '2026-02-04 08:01:00'),

-- MediCare Packaging need (need 10) → Pack It Up (service 11)
(11, 10, 11, 0.9400, '2026-02-05 08:00:00'),
-- MediCare Logistics need (need 11) → Swift Cold Chain (service 22)
(12, 11, 22, 0.9600, '2026-02-05 08:01:00'),

-- TechBridge Solar need (need 14) → SolarEdge (service 27)
(13, 14, 27, 0.9700, '2026-02-06 08:00:00'),
-- Blueprint HVAC need (need 18) → Bob Cool HVAC (service 5)
(14, 18,  5, 0.9100, '2026-02-07 08:00:00'),

-- Elegant Fabrics Logistics need (need 20) → Swift Logistics (service 20)
(15, 20, 20, 0.8600, '2026-02-08 08:00:00'),
-- MediCare Marketing need (need 12) → Alpha Agency (service 7)
(16, 12,  7, 0.8300, '2026-02-08 08:02:00');
