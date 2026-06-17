USE ugscholar;
CREATE TABLE IF NOT EXISTS parent_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_parent_student (parent_id, student_id),
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);
