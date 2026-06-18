CREATE TABLE IF NOT EXISTS parental_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  child_id INT NOT NULL,
  day_of_week TINYINT DEFAULT NULL COMMENT '0=Sun,1=Mon,... NULL=every day',
  start_time TIME DEFAULT NULL COMMENT 'HH:MM block start',
  end_time TIME DEFAULT NULL COMMENT 'HH:MM block end',
  max_daily_minutes INT DEFAULT NULL COMMENT 'total minutes allowed per day',
  activity VARCHAR(60) DEFAULT NULL COMMENT 'LESSON|ASSIGNMENT|QUIZ|GENERAL or NULL=all',
  action ENUM('allow','block') NOT NULL DEFAULT 'block',
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  activity VARCHAR(60) NOT NULL,
  usage_date DATE NOT NULL,
  minutes_used INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_child_activity_date (child_id, activity, usage_date),
  FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE
);
