const { asyncHandler, pool, mapSqlError } = require("./helpers");

const getAll = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_full_timetable ORDER BY day, start_time");
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const { course_id, teacher_id, room_id, slot_id, semester_id } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      "INSERT INTO timetable (course_id, teacher_id, room_id, slot_id, semester_id) VALUES (?, ?, ?, ?, ?)",
      [course_id, teacher_id, room_id, slot_id, semester_id]
    );
    await conn.commit();
    res.status(201).json({ entry_id: result.insertId, message: "Timetable entry created successfully" });
  } catch (error) {
    await conn.rollback();
    const mapped = mapSqlError(error);
    res.status(mapped.status).json({ message: mapped.message });
  } finally {
    conn.release();
  }
});

const remove = asyncHandler(async (req, res) => {
  const [result] = await pool.query("DELETE FROM timetable WHERE entry_id = ?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: "Timetable entry not found" });
  res.json({ message: "Timetable entry deleted successfully" });
});

const bySemester = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("CALL sp_get_timetable_by_semester(?)", [req.params.id]);
  res.json(rows[0] || []);
});

const byTeacher = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("CALL sp_get_teacher_schedule(?)", [req.params.id]);
  res.json(rows[0] || []);
});

const freeRooms = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("CALL sp_get_free_rooms(?)", [req.params.slot_id]);
  res.json(rows[0] || []);
});

const conflicts = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT t1.entry_id AS entry_one, t2.entry_id AS entry_two, t1.slot_id,
            t1.teacher_id AS teacher_one, t2.teacher_id AS teacher_two,
            t1.room_id AS room_one, t2.room_id AS room_two
     FROM timetable t1
     JOIN timetable t2 ON t1.entry_id < t2.entry_id AND t1.slot_id = t2.slot_id
     WHERE t1.teacher_id = t2.teacher_id OR t1.room_id = t2.room_id`
  );
  res.json(rows);
});

const unassignedCourses = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.* FROM course c
     LEFT JOIN timetable t ON c.course_id = t.course_id
     WHERE t.entry_id IS NULL`
  );
  res.json(rows);
});

const maxWorkloadTeacher = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT teacher_id, teacher_name, total_classes
     FROM vw_teacher_workload
     ORDER BY total_classes DESC
     LIMIT 1`
  );
  res.json(rows[0] || null);
});

const availableRoomsByDayTime = asyncHandler(async (req, res) => {
  const { day, start_time, end_time } = req.query;
  const [rows] = await pool.query(
    `SELECT r.* FROM room r
     WHERE r.room_id NOT IN (
       SELECT t.room_id
       FROM timetable t
       JOIN time_slot ts ON ts.slot_id = t.slot_id
       WHERE ts.day = ? AND ts.start_time = ? AND ts.end_time = ?
     )`,
    [day, start_time, end_time]
  );
  res.json(rows);
});

const weeklyByDepartment = asyncHandler(async (req, res) => {
  const deptId = req.params.dept_id;
  const [rows] = await pool.query(
    `SELECT * FROM vw_full_timetable
     WHERE dept_id = ?
     ORDER BY FIELD(day, 'Mon','Tue','Wed','Thu','Fri'), start_time`,
    [deptId]
  );
  res.json(rows);
});

module.exports = {
  getAll,
  create,
  remove,
  bySemester,
  byTeacher,
  freeRooms,
  conflicts,
  unassignedCourses,
  maxWorkloadTeacher,
  availableRoomsByDayTime,
  weeklyByDepartment
};
