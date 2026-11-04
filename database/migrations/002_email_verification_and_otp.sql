-- migrations/002_email_verification_and_otp.sql
-- BizLink Enterprise Authentication Upgrade: Email Verification & OTP-based Password Reset

-- 1. Add email verification status columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER status,
  ADD COLUMN IF NOT EXISTS email_verified_at DATETIME NULL AFTER email_verified;

-- Grandfather existing accounts as verified
UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE email_verified = FALSE;

-- 2. Create user_otps table for secure hashed OTP storage
CREATE TABLE IF NOT EXISTS user_otps (
  otp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  email VARCHAR(190) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_otps_email_purpose (email, purpose),
  INDEX idx_user_otps_expires (expires_at)
);
