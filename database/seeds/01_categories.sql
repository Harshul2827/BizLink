-- seeds/01_categories.sql
-- 6 categories: 4 top-level parents + 2 children
-- Covers all demo scenario domains from PRD Section 34.3

INSERT INTO categories (category_id, parent_id, name, slug) VALUES
(1, NULL, 'Healthcare',   'healthcare'),
(2, NULL, 'Maintenance',  'maintenance'),
(3, NULL, 'Marketing',    'marketing'),
(4, NULL, 'Supply Chain', 'supply-chain'),
(5,    1, 'Veterinary',   'veterinary'),
(6,    2, 'HVAC Services','hvac-services');
