USE ugscholar;

-- Additional courses (safe to re-run)
INSERT IGNORE INTO courses (id, teacher_id, tier_id, subject_id, title, description, level, duration, language_code, status) VALUES
(100, 1, 1, 1, 'Primary Mathematics P.1', 'Learn counting, addition, subtraction, and basic shapes for Primary One.', 'Beginner', '8 weeks', 'en', 'active'),
(101, 1, 1, 2, 'English for Beginners', 'Alphabet, phonics, simple reading and writing for primary learners.', 'Beginner', '8 weeks', 'en', 'active'),
(102, 1, 1, 3, 'Introduction to Science', 'Explore living things, weather, and the environment around us.', 'Beginner', '6 weeks', 'en', 'active'),
(103, 1, 2, 5, 'O-Level Mathematics S.1', 'Sets, number bases, algebra fundamentals for Senior One.', 'Beginner', '12 weeks', 'en', 'active'),
(104, 1, 2, 7, 'Biology: Cells & Organisms', 'Cell structure, classification of living things, and ecosystems.', 'Intermediate', '10 weeks', 'en', 'active'),
(105, 1, 3, 12, 'A-Level Pure Mathematics', 'Calculus, trigonometry, vectors, and complex numbers.', 'Advanced', '16 weeks', 'en', 'active'),
(106, 1, 4, 20, 'Adult Numeracy', 'Basic arithmetic, money management, and measurements for daily life.', 'Beginner', '6 weeks', 'en', 'active');

-- Additional lessons
INSERT IGNORE INTO lessons (id, course_id, title, content, lesson_order, status) VALUES
(100, 100, 'Counting 1 to 100', 'Numbers are everywhere! Let us learn to count from 1 to 100. Practice saying each number out loud.', 1, 'active'),
(101, 100, 'Addition Basics', 'Adding means putting things together. If you have 2 apples and get 3 more, you have 5 apples. 2 + 3 = 5', 2, 'active'),
(102, 100, 'Introduction to Shapes', 'A circle is round like a ball. A square has 4 equal sides. A triangle has 3 sides.', 3, 'active'),
(103, 101, 'The Alphabet', 'There are 26 letters in the English alphabet. A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 1, 'active'),
(104, 101, 'Simple Words', 'Cat, Dog, Sun, Run, Eat, Play. Try reading each word and saying it out loud.', 2, 'active'),
(105, 103, 'Introduction to Sets', 'A set is a collection of objects. Example: {1, 2, 3} is a set of numbers.', 1, 'active'),
(106, 103, 'Number Bases', 'We use base 10 in everyday life. Computers use base 2 (binary). Learn how to convert between bases.', 2, 'active'),
(107, 104, 'The Cell', 'The cell is the basic unit of life. All living things are made of cells. Plant cells have cell walls, animal cells do not.', 1, 'active'),
(108, 104, 'Classification of Organisms', 'Living things are classified into kingdoms: Animalia, Plantae, Fungi, Protista, and Monera.', 2, 'active'),
(109, 105, 'Limits and Continuity', 'A limit describes the value a function approaches as the input approaches some value.', 1, 'active'),
(110, 105, 'Differentiation', 'The derivative measures how a function changes as its input changes. f''(x) = lim(h→0) [f(x+h)-f(x)]/h', 2, 'active'),
(111, 106, 'Basic Addition & Subtraction', 'Adding and subtracting are fundamental skills for managing money and measurements.', 1, 'active'),
(112, 106, 'Managing Money', 'Learn to budget, track expenses, and save for the future.', 2, 'active');
