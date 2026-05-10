const express = require("express");
const createCrudRouter = require("./crudRouterFactory");
const { departments, teachers, courses, rooms, timeslots, semesters } = require("../controllers/crudControllers");
const timetableController = require("../controllers/timetableController");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.use("/departments", createCrudRouter(departments));
router.use("/teachers", createCrudRouter(teachers));
router.use("/courses", createCrudRouter(courses));
router.use("/rooms", createCrudRouter(rooms));
router.use("/timeslots", createCrudRouter(timeslots));
router.use("/semesters", createCrudRouter(semesters));

router.get("/timetable", timetableController.getAll);
router.post("/timetable", timetableController.create);
router.delete("/timetable/:id", timetableController.remove);
router.get("/timetable/semester/:id", timetableController.bySemester);
router.get("/timetable/teacher/:id", timetableController.byTeacher);

router.get("/rooms/free/:slot_id", timetableController.freeRooms);

router.get("/reports/workload", reportController.teacherWorkload);
router.get("/reports/room-utilization", reportController.roomUtilization);

router.get("/reports/conflicts", timetableController.conflicts);
router.get("/reports/unassigned-courses", timetableController.unassignedCourses);
router.get("/reports/max-workload-teacher", timetableController.maxWorkloadTeacher);
router.get("/reports/available-rooms", timetableController.availableRoomsByDayTime);
router.get("/reports/weekly-department/:dept_id", timetableController.weeklyByDepartment);

module.exports = router;
