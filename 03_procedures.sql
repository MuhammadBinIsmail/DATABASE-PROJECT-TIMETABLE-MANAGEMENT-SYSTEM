USE timetable_management;
DROP PROCEDURE IF EXISTS sp_get_timetable_by_semester;
DROP PROCEDURE IF EXISTS sp_get_free_rooms;
DROP PROCEDURE IF EXISTS sp_get_teacher_schedule;

DELIMITER $$

CREATE PROCEDURE sp_get_timetable_by_semester(IN p_semester_id INT)
BEGIN
  SELECT *
  FROM vw_full_timetable
  WHERE semester_id = p_semester_id
  ORDER BY FIELD(day, 'Mon','Tue','Wed','Thu','Fri'), start_time;
END $$

CREATE PROCEDURE sp_get_free_rooms(IN p_slot_id INT)
BEGIN
  SELECT r.*
  FROM room r
  WHERE r.room_id NOT IN (
    SELECT room_id
    FROM timetable
    WHERE slot_id = p_slot_id
  )
  ORDER BY r.room_number;
END $$

CREATE PROCEDURE sp_get_teacher_schedule(IN p_teacher_id INT)
BEGIN
  SELECT *
  FROM vw_full_timetable
  WHERE teacher_id = p_teacher_id
  ORDER BY FIELD(day, 'Mon','Tue','Wed','Thu','Fri'), start_time;
END $$

DELIMITER ;
