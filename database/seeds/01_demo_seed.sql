-- seeds/01_demo_seed.sql
-- Deterministic seed data

INSERT INTO users (user_id, email, password_hash, full_name, role) VALUES 
(1, 'admin@bizlink.com', 'hashed_pass', 'System Admin', 'ADMIN'),
(2, 'owner1@vetclinic.com', 'hashed_pass', 'Dr. Vet', 'OWNER'),
(3, 'owner2@hvac.com', 'hashed_pass', 'Bob HVAC', 'OWNER'),
(4, 'owner3@marketing.com', 'hashed_pass', 'Alice Marketer', 'OWNER'),
(5, 'owner4@packaging.com', 'hashed_pass', 'Charlie Pack', 'OWNER');
-- Additional 10-15 users would be inserted similarly

INSERT INTO categories (category_id, parent_id, name, slug) VALUES 
(1, NULL, 'Healthcare', 'healthcare'),
(2, NULL, 'Maintenance', 'maintenance'),
(3, NULL, 'Marketing', 'marketing'),
(4, NULL, 'Supply Chain', 'supply-chain'),
(5, 1, 'Veterinary', 'veterinary'),
(6, 2, 'HVAC Services', 'hvac-services');

INSERT INTO businesses (business_id, owner_user_id, primary_category_id, name, slug, city, status) VALUES 
(1, 2, 5, 'Happy Paws Clinic', 'happy-paws', 'New York', 'VERIFIED'),
(2, 3, 6, 'Bob Cool HVAC', 'bob-cool', 'New York', 'VERIFIED'),
(3, 4, 3, 'Alpha Agency', 'alpha-agency', 'Los Angeles', 'UNVERIFIED'),
(4, 5, 4, 'Pack It Up', 'pack-it-up', 'Chicago', 'VERIFIED');
-- Additional businesses would be inserted similarly (up to 15)

INSERT INTO business_members (business_id, user_id, member_role) VALUES 
(1, 2, 'ADMIN'),
(2, 3, 'ADMIN'),
(3, 4, 'ADMIN'),
(4, 5, 'ADMIN');

INSERT INTO services (service_id, business_id, category_id, title) VALUES 
(1, 2, 6, 'Commercial HVAC Installation and Repair'),
(2, 3, 3, 'B2B Digital Marketing'),
(3, 4, 4, 'Bulk Packaging Materials');

INSERT INTO needs (need_id, business_id, category_id, title) VALUES 
(1, 1, 6, 'Clinic HVAC System Maintenance'),
(2, 1, 3, 'Local Marketing Campaign'),
(3, 4, 3, 'National Branding Strategy');

INSERT INTO matches (match_id, need_id, service_id, score) VALUES 
(1, 1, 1, 0.95),
(2, 2, 2, 0.85);

INSERT INTO connections (connection_id, requester_business_id, receiver_business_id, status) VALUES 
(1, 1, 2, 'ACCEPTED'),
(2, 1, 3, 'PENDING');

INSERT INTO collaborations (collaboration_id, initiator_business_id, need_id, service_id, title, status) VALUES 
(1, 1, 1, 1, 'HVAC Annual Maintenance Contract', 'ACTIVE');

INSERT INTO collaboration_participants (collaboration_id, business_id, participant_role) VALUES 
(1, 1, 'INITIATOR'),
(1, 2, 'PARTNER');

INSERT INTO reviews (review_id, reviewer_business_id, reviewed_business_id, collaboration_id, author_user_id, rating, title) VALUES 
(1, 1, 2, 1, 2, 5, 'Great HVAC Service');

INSERT INTO posts (post_id, business_id, author_user_id, content) VALUES 
(1, 1, 2, 'Looking for reliable marketing partners.');

INSERT INTO activity_events (event_id, user_id, business_id, event_type, metadata) VALUES 
(1, 2, 1, 'USER_LOGIN', '{"ip": "192.168.1.1"}');

-- DW Star Schema minimal seed
INSERT INTO dw_dim_date (date_key, full_date, month, year) VALUES 
(20261001, '2026-10-01', 10, 2026);

INSERT INTO dw_dim_business (business_sk, business_id, name, effective_from, is_current) VALUES 
(1, 1, 'Happy Paws Clinic', '2026-01-01', TRUE),
(2, 2, 'Bob Cool HVAC', '2026-01-01', TRUE);

INSERT INTO dw_dim_user (user_sk, user_id, role, effective_from, is_current) VALUES 
(1, 2, 'OWNER', '2026-01-01', TRUE),
(2, 3, 'OWNER', '2026-01-01', TRUE);
