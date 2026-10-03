-- schema/01_schema.sql
-- Operational Schema (OLTP)

CREATE TABLE users (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  avatar_url VARCHAR(500),
  role ENUM('OWNER', 'PARTNER', 'ADMIN') NOT NULL,
  status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

CREATE TABLE businesses (
  business_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_user_id BIGINT NOT NULL,
  primary_category_id INT,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  description TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  status ENUM('ACTIVE', 'SUSPENDED', 'UNVERIFIED', 'VERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(user_id),
  FOREIGN KEY (primary_category_id) REFERENCES categories(category_id)
);

CREATE TABLE business_members (
  business_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  member_role ENUM('ADMIN', 'STAFF') NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (business_id, user_id),
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE services (
  service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id BIGINT NOT NULL,
  category_id INT,
  title VARCHAR(160) NOT NULL,
  price_min DECIMAL(12,2),
  price_max DECIMAL(12,2),
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE needs (
  need_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id BIGINT NOT NULL,
  category_id INT,
  title VARCHAR(160) NOT NULL,
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  deadline DATE,
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE matches (
  match_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  need_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  score DECIMAL(5,4),
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (need_id) REFERENCES needs(need_id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

CREATE TABLE connections (
  connection_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  requester_business_id BIGINT NOT NULL,
  receiver_business_id BIGINT NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  UNIQUE(requester_business_id, receiver_business_id)
);

CREATE TABLE messages (
  message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  connection_id BIGINT NOT NULL,
  sender_user_id BIGINT NOT NULL,
  sender_business_id BIGINT NOT NULL,
  body TEXT NOT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id) REFERENCES connections(connection_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id) REFERENCES users(user_id),
  FOREIGN KEY (sender_business_id) REFERENCES businesses(business_id)
);

CREATE TABLE collaborations (
  collaboration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  initiator_business_id BIGINT NOT NULL,
  need_id BIGINT,
  service_id BIGINT,
  title VARCHAR(160) NOT NULL,
  status ENUM('DRAFT', 'REQUESTED', 'NEGOTIATING', 'ACCEPTED', 'ACTIVE', 'COMPLETED', 'DECLINED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  start_date DATE,
  end_date DATE,
  FOREIGN KEY (initiator_business_id) REFERENCES businesses(business_id),
  FOREIGN KEY (need_id) REFERENCES needs(need_id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL
);

CREATE TABLE collaboration_participants (
  collaboration_id BIGINT NOT NULL,
  business_id BIGINT NOT NULL,
  participant_role ENUM('INITIATOR', 'PARTNER') NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collaboration_id, business_id),
  FOREIGN KEY (collaboration_id) REFERENCES collaborations(collaboration_id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(business_id)
);

CREATE TABLE reviews (
  review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reviewer_business_id BIGINT NOT NULL,
  reviewed_business_id BIGINT NOT NULL,
  collaboration_id BIGINT,
  author_user_id BIGINT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(160),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (collaboration_id) REFERENCES collaborations(collaboration_id) ON DELETE SET NULL,
  FOREIGN KEY (author_user_id) REFERENCES users(user_id)
);

CREATE TABLE posts (
  post_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  like_count INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(user_id)
);

CREATE TABLE post_interactions (
  interaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  interaction_type ENUM('LIKE', 'COMMENT') NOT NULL,
  body TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE reports (
  report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_user_id BIGINT NOT NULL,
  admin_user_id BIGINT,
  target_type ENUM('USER', 'BUSINESS', 'POST', 'REVIEW', 'MESSAGE') NOT NULL,
  target_id BIGINT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status ENUM('OPEN', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_user_id) REFERENCES users(user_id),
  FOREIGN KEY (admin_user_id) REFERENCES users(user_id)
);

CREATE TABLE activity_events (
  event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  business_id BIGINT,
  event_type VARCHAR(80) NOT NULL,
  metadata JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE SET NULL
);

-- Analytics Star Schema (DW)
CREATE TABLE dw_dim_date (
  date_key INT PRIMARY KEY,
  full_date DATE NOT NULL,
  month TINYINT NOT NULL,
  year SMALLINT NOT NULL
);

CREATE TABLE dw_dim_business (
  business_sk BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id BIGINT NOT NULL,
  name VARCHAR(160) NOT NULL,
  effective_from DATETIME NOT NULL,
  effective_to DATETIME,
  is_current BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE dw_dim_user (
  user_sk BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role VARCHAR(20) NOT NULL,
  effective_from DATETIME NOT NULL,
  effective_to DATETIME, -- Devation from ER diagram: Added effective_to per instruction
  is_current BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE dw_fact_collaboration (
  fact_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  date_key INT NOT NULL,
  initiator_business_sk BIGINT NOT NULL,
  partner_business_sk BIGINT NOT NULL,
  duration_days INT,
  participant_count INT,
  FOREIGN KEY (date_key) REFERENCES dw_dim_date(date_key),
  FOREIGN KEY (initiator_business_sk) REFERENCES dw_dim_business(business_sk),
  FOREIGN KEY (partner_business_sk) REFERENCES dw_dim_business(business_sk)
);

CREATE TABLE dw_fact_review (
  fact_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  date_key INT NOT NULL,
  reviewed_business_sk BIGINT NOT NULL,
  reviewer_business_sk BIGINT NOT NULL,
  author_user_sk BIGINT NOT NULL,
  rating TINYINT NOT NULL,
  FOREIGN KEY (date_key) REFERENCES dw_dim_date(date_key),
  FOREIGN KEY (reviewed_business_sk) REFERENCES dw_dim_business(business_sk),
  FOREIGN KEY (reviewer_business_sk) REFERENCES dw_dim_business(business_sk),
  FOREIGN KEY (author_user_sk) REFERENCES dw_dim_user(user_sk)
);
