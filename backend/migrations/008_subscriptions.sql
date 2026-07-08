USE learnhub_db;

-- ── Subscription plans ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'free | starter | plus | teacher_pro | institution',
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  `interval` ENUM('month','year','once') NOT NULL DEFAULT 'month',
  stripe_price_id VARCHAR(100) DEFAULT NULL,
  features JSON NOT NULL COMMENT '{"key": true/false} — which features this plan unlocks',
  max_courses INT NOT NULL DEFAULT -1 COMMENT '-1 = unlimited',
  max_enrollments INT NOT NULL DEFAULT -1 COMMENT '-1 = unlimited',
  max_parental_rules INT NOT NULL DEFAULT -1 COMMENT '-1 = unlimited',
  tier_level TINYINT NOT NULL DEFAULT 0 COMMENT '0=free,1=starter,2=plus,3=teacher_pro,4=institution',
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_public TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── User subscriptions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  stripe_subscription_id VARCHAR(100) DEFAULT NULL,
  stripe_customer_id VARCHAR(100) DEFAULT NULL,
  status ENUM('active','trialing','past_due','canceled','expired','incomplete') NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP NULL,
  current_period_end TIMESTAMP NULL,
  canceled_at TIMESTAMP NULL,
  trial_ends_at TIMESTAMP NULL,
  auto_renew TINYINT(1) NOT NULL DEFAULT 1,
  payment_provider VARCHAR(20) DEFAULT 'manual' COMMENT 'stripe | flutterwave | manual',
  payment_provider_subscription_id VARCHAR(100) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- ── Payment / invoice history ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_id INT DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_provider VARCHAR(20) NOT NULL DEFAULT 'manual',
  provider_payment_id VARCHAR(100) DEFAULT NULL,
  provider_invoice_id VARCHAR(100) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL
);

-- ── Insert default plans ─────────────────────────────────────────────────────
INSERT IGNORE INTO subscription_plans (code, name, description, price, currency, `interval`, features, max_courses, max_enrollments, max_parental_rules, tier_level, sort_order) VALUES
('free', 'Free', 'Get started with basic access to courses and features.', 0, 'USD', 'month',
 '{"advanced_analytics":false,"certificates":false,"data_export":false,"course_reviews":false,"bulk_enrollment":false,"api_access":false,"priority_support":false,"white_label":false,"custom_branding":false,"unlimited_enrollments":false,"unlimited_courses":false,"email_reports":false}',
 3, 3, 2, 0, 1),

('starter', 'Starter', 'Ideal for individuals who need more room to grow — more courses, enrollments, and certificates.', 1.50, 'USD', 'month',
 '{"advanced_analytics":false,"certificates":true,"data_export":false,"course_reviews":true,"bulk_enrollment":false,"api_access":false,"priority_support":false,"white_label":false,"custom_branding":false,"unlimited_enrollments":false,"unlimited_courses":false,"email_reports":false}',
 10, 10, 5, 1, 2),

('plus', 'Plus', 'Unlimited enrollments, advanced analytics, data export, and priority support.', 5.00, 'USD', 'month',
 '{"advanced_analytics":true,"certificates":true,"data_export":true,"course_reviews":true,"bulk_enrollment":false,"api_access":false,"priority_support":true,"white_label":false,"custom_branding":false,"unlimited_enrollments":true,"unlimited_courses":false,"email_reports":true}',
 20, -1, -1, 2, 3),

('teacher_pro', 'Teacher Pro', 'Create unlimited courses, access analytics, API, and bulk enrollment.', 9.99, 'USD', 'month',
 '{"advanced_analytics":true,"certificates":true,"data_export":true,"course_reviews":true,"bulk_enrollment":true,"api_access":true,"priority_support":true,"white_label":false,"custom_branding":false,"unlimited_enrollments":true,"unlimited_courses":true,"email_reports":true}',
 -1, -1, -1, 3, 4),

('institution', 'Institution', 'White-label platform with dedicated support and custom integrations.', 99.99, 'USD', 'month',
 '{"advanced_analytics":true,"certificates":true,"data_export":true,"course_reviews":true,"bulk_enrollment":true,"api_access":true,"priority_support":true,"white_label":true,"custom_branding":true,"unlimited_enrollments":true,"unlimited_courses":true,"email_reports":true}',
 -1, -1, -1, 3, 4);
