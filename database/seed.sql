USE ugscholar;

INSERT INTO learning_tiers (id, name, label, min_age, max_age) VALUES
(1, 'primary', 'Primary (P.1–P.7)', 6, 13),
(2, 'olevel', 'O-Level (S.1–S.4)', 14, 18),
(3, 'alevel', 'A-Level (S.5–S.6)', 17, 21),
(4, 'adult', 'Adult Literacy', 18, NULL);

INSERT INTO subjects (tier_id, name, code) VALUES
(1, 'Mathematics', 'math'), (1, 'English', 'english'), (1, 'Science', 'science'), (1, 'Social Studies', 'social_studies'),
(2, 'Mathematics', 'math'), (2, 'English', 'english'), (2, 'Biology', 'biology'), (2, 'Chemistry', 'chemistry'),
(2, 'Physics', 'physics'), (2, 'History', 'history'), (2, 'Geography', 'geography'),
(3, 'Mathematics', 'math'), (3, 'English Literature', 'english_lit'), (3, 'Biology', 'biology'),
(3, 'Chemistry', 'chemistry'), (3, 'Physics', 'physics'), (3, 'Economics', 'economics'), (3, 'History', 'history'),
(4, 'Literacy', 'literacy'), (4, 'Numeracy', 'numeracy'), (4, 'Life Skills', 'life_skills');
