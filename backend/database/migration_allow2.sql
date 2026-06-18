-- Allow2 Integration Migration
-- Adds parent role, parent-child linking, and Allow2 fields

ALTER TABLE users MODIFY COLUMN role ENUM('admin','teacher','student','parent') NOT NULL DEFAULT 'student';

CREATE TABLE IF NOT EXISTS parent_children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  child_id INT NOT NULL,
  allow2_child_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_parent_child (parent_id, child_id),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS allow2_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL UNIQUE,
  pair_token VARCHAR(255),
  allow2_user_id INT,
  timezone VARCHAR(60) DEFAULT 'UTC',
  mode ENUM('mock','live') NOT NULL DEFAULT 'mock',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS allow2_activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity VARCHAR(60) NOT NULL,
  allowed TINYINT(1) NOT NULL DEFAULT 1,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
