-- views/01_reporting_views.sql

CREATE OR REPLACE VIEW vw_current_businesses AS
SELECT * FROM businesses WHERE status != 'SUSPENDED';

CREATE OR REPLACE VIEW vw_active_collaborations AS
SELECT * FROM collaborations WHERE status = 'ACTIVE';

CREATE OR REPLACE VIEW vw_verified_businesses AS
SELECT * FROM businesses WHERE status = 'VERIFIED';
