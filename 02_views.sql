USE timetable_management;

CREATE OR REPLACE VIEW vw_full_timetable AS
SELECT
  t.entry_id,
  d.dept_id,
  d.dept_name,
  s.semester_id,
  s.semester_name,
  c.course_id,
  c.course_name,
  c.credit_hours,
  te.teacher_id,
  te.name AS teacher_name,
  te.email AS teacher_email,
  r.room_id,
  r.room_number,
  r.room_type,
  ts.slot_id,
  ts.day,
  ts.start_time,
  ts.end_time
FROM timetable t
JOIN course c ON c.course_id = t.course_id
JOIN teacher te ON te.teacher_id = t.teacher_id
JOIN room r ON r.room_id = t.room_id
JOIN time_slot ts ON ts.slot_id = t.slot_id
JOIN semester s ON s.semester_id = t.semester_id
JOIN department d ON d.dept_id = s.dept_id;

CREATE OR REPLACE VIEW vw_teacher_workload AS
SELECT
  te.teacher_id,
  te.name AS teacher_name,
  te.email,
  d.dept_name,
  COUNT(t.entry_id) AS total_classes
FROM teacher te
LEFT JOIN timetable t ON t.teacher_id = te.teacher_id
LEFT JOIN department d ON d.dept_id = te.dept_id
GROUP BY te.teacher_id, te.name, te.email, d.dept_name;

CREATE OR REPLACE VIEW vw_room_utilization AS
SELECT
  r.room_id,
  r.room_number,
  r.room_type,
  COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ts.start_time, ts.end_time)) / 60, 0) AS total_hours_occupied
FROM room r
LEFT JOIN timetable t ON t.room_id = r.room_id
LEFT JOIN time_slot ts ON ts.slot_id = t.slot_id
GROUP BY r.room_id, r.room_number, r.room_type;
