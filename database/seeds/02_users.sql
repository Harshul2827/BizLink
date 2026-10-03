-- seeds/02_users.sql
-- 18 users: 1 admin + 15 business owners + 2 business partners/staff
-- Passwords are bcrypt hashes of 'Password@123' (placeholder — real hash applied at runtime)

INSERT INTO users (user_id, email, phone, password_hash, full_name, role, status, created_at) VALUES

-- Admin
(1,  'admin@bizlink.com',          '+911000000001', '$2b$10$placeholder_hash_admin',  'Riya Sharma',       'ADMIN',   'ACTIVE', '2026-01-01 09:00:00'),

-- Business Owners
(2,  'dr.mehta@happypaws.in',      '+911000000002', '$2b$10$placeholder_hash_u02',   'Dr. Anil Mehta',    'OWNER',   'ACTIVE', '2026-01-05 10:00:00'),
(3,  'bob@bobcoolhvac.in',         '+911000000003', '$2b$10$placeholder_hash_u03',   'Bob D''souza',      'OWNER',   'ACTIVE', '2026-01-06 10:00:00'),
(4,  'alice@alphaagency.in',       '+911000000004', '$2b$10$placeholder_hash_u04',   'Alice Fernandes',   'OWNER',   'ACTIVE', '2026-01-07 10:00:00'),
(5,  'charlie@packitup.in',        '+911000000005', '$2b$10$placeholder_hash_u05',   'Charlie Nair',      'OWNER',   'ACTIVE', '2026-01-08 10:00:00'),
(6,  'priya@greenleaffoods.in',    '+911000000006', '$2b$10$placeholder_hash_u06',   'Priya Verma',       'OWNER',   'ACTIVE', '2026-01-09 10:00:00'),
(7,  'rajesh@techbridge.in',       '+911000000007', '$2b$10$placeholder_hash_u07',   'Rajesh Kumar',      'OWNER',   'ACTIVE', '2026-01-10 10:00:00'),
(8,  'meena@brightsmile.in',       '+911000000008', '$2b$10$placeholder_hash_u08',   'Meena Iyer',        'OWNER',   'ACTIVE', '2026-01-11 10:00:00'),
(9,  'suresh@swiftlogistics.in',   '+911000000009', '$2b$10$placeholder_hash_u09',   'Suresh Pillai',     'OWNER',   'ACTIVE', '2026-01-12 10:00:00'),
(10, 'fatima@elegantfabrics.in',   '+911000000010', '$2b$10$placeholder_hash_u10',   'Fatima Sheikh',     'OWNER',   'ACTIVE', '2026-01-13 10:00:00'),
(11, 'arjun@codesprint.in',        '+911000000011', '$2b$10$placeholder_hash_u11',   'Arjun Patel',       'OWNER',   'ACTIVE', '2026-01-14 10:00:00'),
(12, 'kavya@solarenergy.in',       '+911000000012', '$2b$10$placeholder_hash_u12',   'Kavya Reddy',       'OWNER',   'ACTIVE', '2026-01-15 10:00:00'),
(13, 'manish@blueprintarch.in',    '+911000000013', '$2b$10$placeholder_hash_u13',   'Manish Joshi',      'OWNER',   'ACTIVE', '2026-01-16 10:00:00'),
(14, 'sandhya@freshbakery.in',     '+911000000014', '$2b$10$placeholder_hash_u14',   'Sandhya Kulkarni',  'OWNER',   'ACTIVE', '2026-01-17 10:00:00'),
(15, 'vikram@metalcraft.in',       '+911000000015', '$2b$10$placeholder_hash_u15',   'Vikram Bose',       'OWNER',   'SUSPENDED', '2026-01-18 10:00:00'),
(16, 'anita@medicarepharma.in',    '+911000000016', '$2b$10$placeholder_hash_u16',   'Anita Ghosh',       'OWNER',   'ACTIVE', '2026-01-19 10:00:00'),

-- Business Partners (staff members)
(17, 'staff1@happypaws.in',        '+911000000017', '$2b$10$placeholder_hash_u17',   'Rohit Mehta',       'PARTNER', 'ACTIVE', '2026-02-01 10:00:00'),
(18, 'staff1@alphaagency.in',      '+911000000018', '$2b$10$placeholder_hash_u18',   'Sneha D''souza',    'PARTNER', 'ACTIVE', '2026-02-02 10:00:00');
