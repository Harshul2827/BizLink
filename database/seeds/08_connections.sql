-- seeds/08_connections.sql
-- 12 connections — covers all 5 statuses: PENDING, ACCEPTED, REJECTED, CANCELLED, BLOCKED

INSERT INTO connections (connection_id, requester_business_id, receiver_business_id, status, requested_at) VALUES

-- ACCEPTED connections (established partnerships)
(1,  1,  2, 'ACCEPTED',   '2026-02-05 09:00:00'),  -- Happy Paws → Bob Cool HVAC
(2,  1,  3, 'ACCEPTED',   '2026-02-06 09:00:00'),  -- Happy Paws → Alpha Agency
(3,  5,  4, 'ACCEPTED',   '2026-02-07 09:00:00'),  -- Green Leaf → Pack It Up
(4,  5,  8, 'ACCEPTED',   '2026-02-08 09:00:00'),  -- Green Leaf → Swift Logistics
(5,  15, 4, 'ACCEPTED',   '2026-02-09 09:00:00'),  -- MediCare → Pack It Up
(6,  15, 8, 'ACCEPTED',   '2026-02-10 09:00:00'),  -- MediCare → Swift Logistics
(7,  6,  11, 'ACCEPTED',  '2026-02-11 09:00:00'),  -- TechBridge → SolarEdge

-- PENDING connections (awaiting response)
(8,  7,  2, 'PENDING',    '2026-03-01 09:00:00'),  -- BrightSmile → Bob Cool HVAC
(9,  12, 2, 'PENDING',    '2026-03-02 09:00:00'),  -- Blueprint → Bob Cool HVAC
(10, 13, 3, 'PENDING',    '2026-03-03 09:00:00'),  -- Fresh Bakery → Alpha Agency

-- REJECTED connection
(11, 9,  3, 'REJECTED',   '2026-02-15 09:00:00'),  -- Elegant Fabrics → Alpha Agency

-- BLOCKED connection
(12, 14, 1, 'BLOCKED',    '2026-02-20 09:00:00');  -- MetalCraft → Happy Paws (suspended biz)
