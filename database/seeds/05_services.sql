-- seeds/05_services.sql
-- 32 services — minimum 2 per business, covering all 6 categories
-- Prices in INR (DECIMAL 12,2)

INSERT INTO services (service_id, business_id, category_id, title, price_min, price_max, status) VALUES

-- Happy Paws Veterinary Clinic (business 1, category 5)
(1,  1, 5, 'General Veterinary Consultation',        500.00,   1500.00,  'ACTIVE'),
(2,  1, 5, 'Surgical Procedures & Post-Op Care',   5000.00,  50000.00,  'ACTIVE'),
(3,  1, 5, 'Vaccination & Preventive Care Packages', 800.00,   3000.00,  'ACTIVE'),

-- Bob Cool HVAC Solutions (business 2, category 6)
(4,  2, 6, 'Commercial HVAC System Installation',  80000.00, 500000.00, 'ACTIVE'),
(5,  2, 6, 'HVAC Maintenance & Annual Service Contract', 15000.00, 60000.00, 'ACTIVE'),
(6,  2, 6, 'Emergency HVAC Repair',                3000.00,  20000.00,  'ACTIVE'),

-- Alpha Digital Agency (business 3, category 3)
(7,  3, 3, 'B2B Digital Marketing Strategy',       30000.00, 150000.00, 'ACTIVE'),
(8,  3, 3, 'SEO & Content Marketing',              15000.00,  60000.00, 'ACTIVE'),
(9,  3, 3, 'Social Media Management',              10000.00,  40000.00, 'ACTIVE'),

-- Pack It Up Supplies (business 4, category 4)
(10, 4, 4, 'Custom Corrugated Box Manufacturing',   5000.00,  200000.00, 'ACTIVE'),
(11, 4, 4, 'Eco-Friendly Packaging Solutions',      8000.00,  150000.00, 'ACTIVE'),
(12, 4, 4, 'Bulk Packaging Material Supply',        2000.00,   80000.00, 'ACTIVE'),

-- Green Leaf Foods (business 5, category 1)
(13, 5, 1, 'Organic Produce B2B Supply',           10000.00,  500000.00, 'ACTIVE'),
(14, 5, 1, 'Private Label Food Manufacturing',     50000.00,  800000.00, 'ACTIVE'),

-- TechBridge IT Solutions (business 6, category 3)
(15, 6, 3, 'Custom Software Development',          50000.00,  500000.00, 'ACTIVE'),
(16, 6, 3, 'IT Infrastructure Consulting',         20000.00,  100000.00, 'ACTIVE'),
(17, 6, 3, 'SaaS Product Development',             80000.00,  600000.00, 'INACTIVE'),

-- BrightSmile Dental Care (business 7, category 1)
(18, 7, 1, 'Corporate Dental Health Checkup Camps', 5000.00,   30000.00, 'ACTIVE'),
(19, 7, 1, 'Dental Equipment Maintenance Contracts', 10000.00,  50000.00, 'ACTIVE'),

-- Swift Logistics Partners (business 8, category 4)
(20, 8, 4, 'Last-Mile B2B Delivery Services',      10000.00,  200000.00, 'ACTIVE'),
(21, 8, 4, 'Warehouse Storage & Fulfilment',        15000.00,  300000.00, 'ACTIVE'),
(22, 8, 4, 'Cold Chain Logistics',                  20000.00,  400000.00, 'ACTIVE'),

-- Elegant Fabrics & Textiles (business 9, category 4)
(23, 9, 4, 'Premium Cotton Fabric Wholesale',       5000.00,  500000.00, 'ACTIVE'),
(24, 9, 4, 'Custom Fabric Dyeing & Printing',      20000.00,  200000.00, 'ACTIVE'),

-- CodeSprint Software Studio (business 10, category 3)
(25, 10, 3, 'Mobile App Development (Android/iOS)', 60000.00, 400000.00, 'ACTIVE'),
(26, 10, 3, 'UI/UX Design Services',               25000.00,  150000.00, 'ACTIVE'),

-- SolarEdge Energy Systems (business 11, category 2)
(27, 11, 2, 'Commercial Solar Panel Installation', 100000.00, 2000000.00,'ACTIVE'),
(28, 11, 2, 'Energy Audit & Efficiency Consulting', 15000.00,   80000.00, 'ACTIVE'),

-- Blueprint Architects (business 12, category 2)
(29, 12, 2, 'Commercial Architecture & Design',    100000.00, 5000000.00,'ACTIVE'),
(30, 12, 2, 'Interior Design for Office Spaces',    50000.00,  500000.00, 'ACTIVE'),

-- Fresh Bakery Wholesale (business 13, category 1)
(31, 13, 1, 'Bulk Bakery Supply for Hotels & Retail', 5000.00, 200000.00, 'ACTIVE'),
(32, 13, 1, 'Custom Branded Baked Goods (Private Label)', 10000.00, 100000.00, 'ACTIVE');

-- MetalCraft (business 14) is SUSPENDED — no active services added intentionally
-- MediCare Pharma (business 15, category 1)
-- (services added via needs-only for matching demo variety)
