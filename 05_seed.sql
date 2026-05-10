USE timetable_management;

INSERT IGNORE INTO department (dept_name) VALUES
('Computer Science'),
('Electrical Engineering'),
('Business Administration'),
('Mathematics'),
('Physics');

INSERT IGNORE INTO teacher (name, email, dept_id) VALUES
('Alice Johnson', 'alice.johnson@univ.edu', 1),
('Bob Smith', 'bob.smith@univ.edu', 1),
('Charlie Nguyen', 'charlie.nguyen@univ.edu', 1),
('Diana Patel', 'diana.patel@univ.edu', 2),
('Ethan Brown', 'ethan.brown@univ.edu', 2),
('Farah Khan', 'farah.khan@univ.edu', 2),
('Grace Lee', 'grace.lee@univ.edu', 3),
('Hassan Ali', 'hassan.ali@univ.edu', 3),
('Ivy Martin', 'ivy.martin@univ.edu', 3),
('Jack Wilson', 'jack.wilson@univ.edu', 4),
('Karen White', 'karen.white@univ.edu', 4),
('Leo Green', 'leo.green@univ.edu', 4),
('Mona Das', 'mona.das@univ.edu', 5),
('Nora Chen', 'nora.chen@univ.edu', 5),
('Omar Reed', 'omar.reed@univ.edu', 5);

INSERT IGNORE INTO course (course_name, credit_hours, dept_id) VALUES
('Database Systems', 3, 1),
('Data Structures', 3, 1),
('Operating Systems', 3, 1),
('Web Engineering', 3, 1),
('Machine Learning', 3, 1),
('Digital Logic', 3, 2),
('Signals and Systems', 3, 2),
('Circuit Analysis', 3, 2),
('Power Electronics', 3, 2),
('Control Systems', 3, 2),
('Marketing Principles', 3, 3),
('Financial Accounting', 3, 3),
('Organizational Behavior', 3, 3),
('Linear Algebra', 3, 4),
('Calculus II', 3, 4),
('Discrete Mathematics', 3, 4),
('Quantum Mechanics', 3, 5),
('Classical Mechanics', 3, 5),
('Thermodynamics', 3, 5),
('Electromagnetism', 3, 5);

INSERT IGNORE INTO teacher_course (teacher_id, course_id) VALUES
(1,1),(2,2),(3,3),(1,4),(2,5),
(4,6),(5,7),(6,8),(4,9),(5,10),
(7,11),(8,12),(9,13),
(10,14),(11,15),(12,16),
(13,17),(14,18),(15,19),(13,20);

INSERT IGNORE INTO room (room_number, capacity, room_type) VALUES
('A-101', 60, 'lecture'),
('A-102', 55, 'lecture'),
('B-201', 40, 'lab'),
('B-202', 40, 'lab'),
('C-301', 80, 'lecture'),
('C-302', 70, 'lecture'),
('D-401', 35, 'lab'),
('D-402', 35, 'lab'),
('E-501', 50, 'lecture'),
('E-502', 45, 'lecture');

INSERT IGNORE INTO time_slot (day, start_time, end_time) VALUES
('Mon','08:00:00','09:30:00'),
('Mon','10:00:00','11:30:00'),
('Tue','08:00:00','09:30:00'),
('Tue','10:00:00','11:30:00'),
('Wed','08:00:00','09:30:00'),
('Wed','10:00:00','11:30:00'),
('Thu','08:00:00','09:30:00'),
('Thu','10:00:00','11:30:00'),
('Fri','08:00:00','09:30:00'),
('Fri','10:00:00','11:30:00');

INSERT IGNORE INTO semester (semester_name, dept_id) VALUES
('Fall 2026 - CS', 1),
('Fall 2026 - EE', 2),
('Fall 2026 - BBA', 3),
('Fall 2026 - MATH', 4),
('Fall 2026 - PHY', 5);

INSERT IGNORE INTO timetable (course_id, teacher_id, room_id, slot_id, semester_id) VALUES
(1,1,1,1,1),
(2,2,3,2,1),
(3,3,5,3,1),
(4,1,2,4,1),
(6,4,6,5,2),
(7,5,4,6,2),
(11,7,9,7,3),
(12,8,10,8,3),
(14,10,1,9,4),
(17,13,5,10,5);
