-- seeds/03_businesses.sql
-- 15 businesses across multiple cities, categories, and statuses
-- Covers: verified, unverified, suspended states; multiple cities (PRD Section 34.2)

INSERT INTO businesses (business_id, owner_user_id, primary_category_id, name, slug, description, city, state, country, status, created_at) VALUES

(1,  2,  5, 'Happy Paws Veterinary Clinic',  'happy-paws-clinic',
    'Full-service veterinary clinic providing preventive care, surgery, and diagnostics for companion animals.',
    'Mumbai', 'Maharashtra', 'India', 'VERIFIED',   '2026-01-05 11:00:00'),

(2,  3,  6, 'Bob Cool HVAC Solutions',        'bob-cool-hvac',
    'Commercial and residential HVAC installation, repair, and maintenance across Mumbai and Pune.',
    'Mumbai', 'Maharashtra', 'India', 'VERIFIED',   '2026-01-06 11:00:00'),

(3,  4,  3, 'Alpha Digital Agency',           'alpha-digital-agency',
    'Full-service B2B digital marketing agency specialising in brand strategy and lead generation.',
    'Bengaluru', 'Karnataka', 'India', 'UNVERIFIED', '2026-01-07 11:00:00'),

(4,  5,  4, 'Pack It Up Supplies',            'pack-it-up-supplies',
    'Wholesale packaging materials supplier for food, pharma, and e-commerce industries.',
    'Delhi', 'Delhi', 'India', 'VERIFIED',   '2026-01-08 11:00:00'),

(5,  6,  1, 'Green Leaf Foods',               'green-leaf-foods',
    'Organic food products manufacturer with B2B distribution partnerships.',
    'Pune', 'Maharashtra', 'India', 'VERIFIED',   '2026-01-09 11:00:00'),

(6,  7,  3, 'TechBridge IT Solutions',        'techbridge-it-solutions',
    'Custom software development and IT consulting for SMBs.',
    'Hyderabad', 'Telangana', 'India', 'VERIFIED',   '2026-01-10 11:00:00'),

(7,  8,  1, 'BrightSmile Dental Care',        'brightsmile-dental',
    'Multi-chair dental clinic offering general and cosmetic dentistry.',
    'Chennai', 'Tamil Nadu', 'India', 'VERIFIED',   '2026-01-11 11:00:00'),

(8,  9,  4, 'Swift Logistics Partners',       'swift-logistics',
    'Last-mile delivery and warehousing solutions for B2B clients.',
    'Mumbai', 'Maharashtra', 'India', 'VERIFIED',   '2026-01-12 11:00:00'),

(9,  10, 4, 'Elegant Fabrics & Textiles',     'elegant-fabrics',
    'Premium fabric wholesaler supplying to apparel manufacturers across India.',
    'Surat', 'Gujarat', 'India', 'VERIFIED',   '2026-01-13 11:00:00'),

(10, 11, 3, 'CodeSprint Software Studio',     'codesprint-studio',
    'Agile software studio focused on SaaS product development and mobile apps.',
    'Bengaluru', 'Karnataka', 'India', 'UNVERIFIED', '2026-01-14 11:00:00'),

(11, 12, 2, 'SolarEdge Energy Systems',       'solaredge-energy',
    'Commercial solar panel installation and energy auditing services.',
    'Jaipur', 'Rajasthan', 'India', 'VERIFIED',   '2026-01-15 11:00:00'),

(12, 13, 2, 'Blueprint Architects',           'blueprint-architects',
    'Architecture and interior design firm for commercial and industrial projects.',
    'Delhi', 'Delhi', 'India', 'VERIFIED',   '2026-01-16 11:00:00'),

(13, 14, 1, 'Fresh Bakery Wholesale',         'fresh-bakery-wholesale',
    'Industrial bakery producing breads, pastries, and snacks for hotel and retail supply.',
    'Kolkata', 'West Bengal', 'India', 'VERIFIED',   '2026-01-17 11:00:00'),

(14, 15, 4, 'MetalCraft Industries',          'metalcraft-industries',
    'Custom metal fabrication and machining for industrial clients.',
    'Pune', 'Maharashtra', 'India', 'SUSPENDED',  '2026-01-18 11:00:00'),

(15, 16, 1, 'MediCare Pharma Distributors',  'medicare-pharma',
    'Licensed pharmaceutical distribution to hospitals and clinics.',
    'Ahmedabad', 'Gujarat', 'India', 'VERIFIED',   '2026-01-19 11:00:00');
