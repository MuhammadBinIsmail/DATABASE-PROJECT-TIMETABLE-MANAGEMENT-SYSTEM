USE timetable_management;
DROP TRIGGER IF EXISTS trg_prevent_room_conflict;
DROP TRIGGER IF EXISTS trg_prevent_teacher_conflict;
DROP TRIGGER IF EXISTS trg_log_timetable_changes_insert;
DROP TRIGGER IF EXISTS trg_log_timetable_changes_update;

DELIMITER $$

CREATE TRIGGER trg_prevent_room_conflict
BEFORE INSERT ON timetable
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM timetable t
    WHERE t.room_id = NEW.room_id
      AND t.slot_id = NEW.slot_id
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Room is already booked for this slot';
  END IF;
END $$

CREATE TRIGGER trg_prevent_teacher_conflict
BEFORE INSERT ON timetable
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM timetable t
    WHERE t.teacher_id = NEW.teacher_id
      AND t.slot_id = NEW.slot_id
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Teacher already has a class in this slot';
  END IF;
END $$

CREATE TRIGGER trg_log_timetable_changes_insert
AFTER INSERT ON timetable
FOR EACH ROW
BEGIN
  INSERT INTO timetable_audit (entry_id, action_type, old_data, new_data)
  VALUES (
    NEW.entry_id,
    'INSERT',
    NULL,
    JSON_OBJECT(
      'course_id', NEW.course_id,
      'teacher_id', NEW.teacher_id,
      'room_id', NEW.room_id,
      'slot_id', NEW.slot_id,
      'semester_id', NEW.semester_id
    )
  );
END $$

CREATE TRIGGER trg_log_timetable_changes_update
AFTER UPDATE ON timetable
FOR EACH ROW
BEGIN
  INSERT INTO timetable_audit (entry_id, action_type, old_data, new_data)
  VALUES (
    NEW.entry_id,
    'UPDATE',
    JSON_OBJECT(
      'course_id', OLD.course_id,
      'teacher_id', OLD.teacher_id,
      'room_id', OLD.room_id,
      'slot_id', OLD.slot_id,
      'semester_id', OLD.semester_id
    ),
    JSON_OBJECT(
      'course_id', NEW.course_id,
      'teacher_id', NEW.teacher_id,
      'room_id', NEW.room_id,
      'slot_id', NEW.slot_id,
      'semester_id', NEW.semester_id
    )
  );
END $$

DELIMITER ;
