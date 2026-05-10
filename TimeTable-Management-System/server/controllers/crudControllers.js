const { makeCrudController } = require("./helpers");

const departments = makeCrudController("department", "dept_id", ["dept_name"]);
const teachers = makeCrudController("teacher", "teacher_id", ["name", "email", "dept_id"]);
const courses = makeCrudController("course", "course_id", ["course_name", "credit_hours", "dept_id"]);
const rooms = makeCrudController("room", "room_id", ["room_number", "capacity", "room_type"]);
const timeslots = makeCrudController("time_slot", "slot_id", ["day", "start_time", "end_time"]);
const semesters = makeCrudController("semester", "semester_id", ["semester_name", "dept_id"]);

module.exports = { departments, teachers, courses, rooms, timeslots, semesters };
