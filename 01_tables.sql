CREATE DATABASE IF NOT EXISTS timetable_management;
USE timetable_management;

CREATE TABLE IF NOT EXISTS department (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teacher (
  teacher_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  dept_id INT NOT NULL,
  CONSTRAINT fk_teacher_department
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS course (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(160) NOT NULL,
  credit_hours TINYINT UNSIGNED NOT NULL CHECK (credit_hours BETWEEN 1 AND 6),
  dept_id INT NOT NULL,
  CONSTRAINT fk_course_department
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS teacher_course (
  teacher_id INT NOT NULL,
  course_id INT NOT NULL,
  PRIMARY KEY (teacher_id, course_id),
  CONSTRAINT fk_tc_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_tc_course
    FOREIGN KEY (course_id) REFERENCES course(course_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(40) NOT NULL UNIQUE,
  capacity INT NOT NULL CHECK (capacity > 0),
  room_type ENUM('lecture', 'lab') NOT NULL
);

CREATE TABLE IF NOT EXISTS time_slot (
  slot_id INT AUTO_INCREMENT PRIMARY KEY,
  day ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (end_time > start_time),
  UNIQUE KEY uq_slot (day, start_time, end_time)
);

CREATE TABLE IF NOT EXISTS semester (
  semester_id INT AUTO_INCREMENT PRIMARY KEY,
  semester_name VARCHAR(120) NOT NULL,
  dept_id INT NOT NULL,
  CONSTRAINT fk_semester_department
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS timetable (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  room_id INT NOT NULL,
  slot_id INT NOT NULL,
  semester_id INT NOT NULL,
  CONSTRAINT fk_tt_course
    FOREIGN KEY (course_id) REFERENCES course(course_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tt_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tt_room
    FOREIGN KEY (room_id) REFERENCES room(room_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tt_slot
    FOREIGN KEY (slot_id) REFERENCES time_slot(slot_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tt_semester
    FOREIGN KEY (semester_id) REFERENCES semester(semester_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_timetable_room_id (room_id),
  INDEX idx_timetable_slot_id (slot_id),
  INDEX idx_timetable_teacher_id (teacher_id),
  UNIQUE KEY uq_semester_course_slot (semester_id, course_id, slot_id)
);

CREATE TABLE IF NOT EXISTS timetable_audit (
  audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  action_type ENUM('INSERT', 'UPDATE') NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  old_data JSON NULL,
  new_data JSON NULL
);
