const { asyncHandler, pool } = require("./helpers");

const teacherWorkload = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_teacher_workload ORDER BY total_classes DESC");
  res.json(rows);
});

const roomUtilization = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_room_utilization ORDER BY total_hours_occupied DESC");
  res.json(rows);
});

module.exports = { teacherWorkload, roomUtilization };
