-- seeds/06_needs.sql
-- 22 needs — covers PRD Section 34.3 demo scenarios:
-- Vet Clinic + HVAC, Marketing, Packaging/Supply, cross-domain

INSERT INTO needs (need_id, business_id, category_id, title, budget_min, budget_max, deadline) VALUES

-- Happy Paws Clinic needs (HVAC + Marketing + Packaging)
(1,  1, 6, 'Annual HVAC Maintenance Contract for Clinic',          15000.00,  60000.00, '2026-03-31'),
(2,  1, 3, 'Local Veterinary Marketing Campaign',                   20000.00,  80000.00, '2026-04-30'),
(3,  1, 4, 'Medical Supply Packaging Materials',                     5000.00,  30000.00, '2026-06-30'),

-- BrightSmile Dental needs
(4,  7, 6, 'Dental Clinic Air Purification System (HVAC)',          30000.00, 150000.00, '2026-05-31'),
(5,  7, 3, 'Healthcare Digital Marketing',                          15000.00,  60000.00, '2026-07-31'),

-- Green Leaf Foods needs
(6,  5, 4, 'Eco-Friendly Packaging for Organic Products',           10000.00, 100000.00, '2026-04-15'),
(7,  5, 4, 'Cold Chain Logistics for Organic Produce',              20000.00, 200000.00, '2026-05-15'),

-- Fresh Bakery needs
(8,  13, 4, 'Food-Grade Packaging for Bulk Bakery Orders',           8000.00,  80000.00, '2026-06-01'),
(9,  13, 3, 'Brand Awareness Campaign for Bakery Wholesale',        15000.00,  50000.00, '2026-08-31'),

-- MediCare Pharma needs
(10, 15, 4, 'Pharmaceutical Packaging Compliance Materials',        20000.00, 200000.00, '2026-05-01'),
(11, 15, 4, 'Cold Chain Logistics for Drug Distribution',           30000.00, 300000.00, '2026-06-01'),
(12, 15, 3, 'Healthcare B2B Marketing Services',                    25000.00, 100000.00, '2026-09-30'),

-- TechBridge IT needs
(13, 6, 2, 'Office Renovation and Interior Design',                 50000.00, 300000.00, '2026-07-01'),
(14, 6, 2, 'Solar Energy System for Office Campus',                100000.00, 800000.00, '2026-10-01'),

-- CodeSprint needs
(15, 10, 3, 'Startup Brand Identity and Marketing Strategy',        20000.00,  80000.00, '2026-05-01'),
(16, 10, 4, 'Office Supplies and Hardware Procurement',              5000.00,  50000.00, '2026-06-30'),

-- Blueprint Architects needs
(17, 12, 3, 'Digital Portfolio and Lead Generation Campaign',       15000.00,  60000.00, '2026-07-31'),
(18, 12, 2, 'HVAC Systems for New Office Project',                  50000.00, 300000.00, '2026-08-31'),

-- SolarEdge needs
(19, 11, 3, 'Industrial Marketing and Dealer Outreach Program',     20000.00, 100000.00, '2026-06-30'),

-- Elegant Fabrics needs
(20, 9, 4, 'Fabric Export Logistics Partner',                       15000.00, 150000.00, '2026-05-31'),
(21, 9, 3, 'B2B Trade Marketing for Apparel Manufacturers',         10000.00,  50000.00, '2026-08-31'),

-- Swift Logistics needs
(22, 8, 3, 'B2B Sales and Client Acquisition Campaign',             20000.00,  80000.00, '2026-09-30');
