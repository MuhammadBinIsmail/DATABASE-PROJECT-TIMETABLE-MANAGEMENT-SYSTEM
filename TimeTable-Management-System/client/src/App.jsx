import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const pages = [
  "Dashboard",
  "Timetable View",
  "Add Timetable Entry",
  "Manage Data",
  "Reports",
  "Conflict Checker"
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function Card({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [data, setData] = useState({
    teachers: [], courses: [], rooms: [], entries: [],
    departments: [], semesters: [], slots: []
  });
  const [reports, setReports] = useState({ workload: [], utilization: [], conflicts: [] });
  const [form, setForm] = useState({ course_id: "", teacher_id: "", room_id: "", slot_id: "", semester_id: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Manage Data tab state
  const [activeTab, setActiveTab] = useState("teachers");
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", dept_id: "" });
  const [courseForm, setCourseForm] = useState({ course_name: "", credit_hours: "3", dept_id: "" });
  const [roomForm, setRoomForm] = useState({ room_number: "", capacity: "", room_type: "lecture" });
  const [slotForm, setSlotForm] = useState({ day: "Mon", start_time: "", end_time: "" });

  const loadCoreData = async () => {
    try {
      const [teachers, courses, rooms, entries, departments, semesters, slots] = await Promise.all([
        api.get("/teachers"), api.get("/courses"), api.get("/rooms"),
        api.get("/timetable"), api.get("/departments"),
        api.get("/semesters"), api.get("/timeslots")
      ]);
      setData({ teachers, courses, rooms, entries, departments, semesters, slots });
    } catch (e) {
      setError(`Failed to load data: ${e.message}`);
    }
  };

  const loadReports = async () => {
    try {
      const [workload, utilization, conflicts] = await Promise.all([
        api.get("/reports/workload"),
        api.get("/reports/room-utilization"),
        api.get("/reports/conflicts")
      ]);
      setReports({ workload, utilization, conflicts });
    } catch (e) {
      setError(`Failed to load reports: ${e.message}`);
    }
  };

  useEffect(() => { loadCoreData(); loadReports(); }, []);

  const showMsg = (msg) => { setMessage(msg); setError(""); setTimeout(() => setMessage(""), 3000); };
  const showErr = (msg) => { setError(msg); setMessage(""); };

  const conflictsForDraft = useMemo(() => {
    if (!form.slot_id || (!form.teacher_id && !form.room_id)) return [];
    return data.entries.filter(
      (e) => String(e.slot_id) === String(form.slot_id) &&
        (String(e.teacher_id) === String(form.teacher_id) || String(e.room_id) === String(form.room_id))
    );
  }, [form, data.entries]);

  const weeklyGrid = useMemo(() => {
    const bySlot = {};
    data.entries.forEach((entry) => { bySlot[`${entry.day}-${entry.start_time}`] = entry; });
    return bySlot;
  }, [data.entries]);

  // Timetable submit
  const submitEntry = async (e) => {
    e.preventDefault(); setError(""); setMessage("");
    try {
      await api.post("/timetable", {
        course_id: Number(form.course_id), teacher_id: Number(form.teacher_id),
        room_id: Number(form.room_id), slot_id: Number(form.slot_id),
        semester_id: Number(form.semester_id)
      });
      showMsg("Timetable entry added successfully.");
      setForm({ course_id: "", teacher_id: "", room_id: "", slot_id: "", semester_id: "" });
      await loadCoreData(); await loadReports();
    } catch (err) { showErr(err.message); }
  };

  // Delete timetable entry
  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this timetable entry?")) return;
    try {
      await api.del(`/timetable/${id}`);
      showMsg("Timetable entry deleted successfully.");
      await loadCoreData(); await loadReports();
    } catch (err) { showErr(err.message); }
  };

  // --- Manage Data handlers ---

  // Teacher
  const addTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post("/teachers", { name: teacherForm.name, email: teacherForm.email, dept_id: Number(teacherForm.dept_id) });
      showMsg("Teacher added successfully.");
      setTeacherForm({ name: "", email: "", dept_id: "" });
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };
  const deleteTeacher = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      await api.del(`/teachers/${id}`);
      showMsg("Teacher deleted.");
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };

  // Course
  const addCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post("/courses", { course_name: courseForm.course_name, credit_hours: Number(courseForm.credit_hours), dept_id: Number(courseForm.dept_id) });
      showMsg("Course added successfully.");
      setCourseForm({ course_name: "", credit_hours: "3", dept_id: "" });
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };
  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await api.del(`/courses/${id}`);
      showMsg("Course deleted.");
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };

  // Room
  const addRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post("/rooms", { room_number: roomForm.room_number, capacity: Number(roomForm.capacity), room_type: roomForm.room_type });
      showMsg("Room added successfully.");
      setRoomForm({ room_number: "", capacity: "", room_type: "lecture" });
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };
  const deleteRoom = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await api.del(`/rooms/${id}`);
      showMsg("Room deleted.");
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };

  // Time Slot
  const addSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post("/timeslots", { day: slotForm.day, start_time: slotForm.start_time, end_time: slotForm.end_time });
      showMsg("Time slot added successfully.");
      setSlotForm({ day: "Mon", start_time: "", end_time: "" });
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };
  const deleteSlot = async (id) => {
    if (!window.confirm("Delete this time slot?")) return;
    try {
      await api.del(`/timeslots/${id}`);
      showMsg("Time slot deleted.");
      await loadCoreData();
    } catch (err) { showErr(err.message); }
  };

  const inputCls = "rounded border border-slate-300 p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400";
  const btnAdd = "rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700";
  const btnDel = "rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600";
  const tabCls = (t) => `px-4 py-2 text-sm font-semibold rounded-t border-b-2 ${activeTab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-slate-900 p-4 text-white">
        <h1 className="text-2xl font-bold">Timetable Management System</h1>
      </header>
      <div className="mx-auto flex w-full max-w-7xl gap-4 p-4">
        <aside className="w-60 rounded-xl bg-white p-3 shadow">
          {pages.map((p) => (
            <button key={p} onClick={() => { setPage(p); setMessage(""); setError(""); }}
              className={`mb-2 w-full rounded px-3 py-2 text-left ${page === p ? "bg-blue-600 text-white" : "bg-slate-100"}`}>
              {p}
            </button>
          ))}
        </aside>
        <main className="flex-1 rounded-xl bg-white p-5 shadow">
          {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
          {message && <div className="mb-4 rounded bg-green-100 p-3 text-green-700">{message}</div>}

          {/* DASHBOARD */}
          {page === "Dashboard" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card label="Total Teachers" value={data.teachers.length} />
              <Card label="Total Courses" value={data.courses.length} />
              <Card label="Total Rooms" value={data.rooms.length} />
              <Card label="Timetable Entries" value={data.entries.length} />
            </div>
          )}

          {/* TIMETABLE VIEW */}
          {page === "Timetable View" && (
            <div className="overflow-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border p-2">Time / Day</th>
                    {days.map((d) => <th key={d} className="border p-2">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.slots.map((slot) => (
                    <tr key={slot.slot_id}>
                      <td className="border p-2 font-medium text-slate-600">{slot.start_time} - {slot.end_time}</td>
                      {days.map((d) => {
                        const entry = weeklyGrid[`${d}-${slot.start_time}`];
                        return (
                          <td key={d} className="border p-2 align-top">
                            {entry && entry.day === d ? (
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold text-slate-800">{entry.course_name}</p>
                                <p className="text-slate-600">{entry.teacher_name}</p>
                                <p className="text-slate-500">{entry.room_number}</p>
                                <button onClick={() => deleteEntry(entry.entry_id)}
                                  className={btnDel}>
                                  Delete
                                </button>
                              </div>
                            ) : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ADD TIMETABLE ENTRY */}
          {page === "Add Timetable Entry" && (
            <form onSubmit={submitEntry} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { field: "course_id", label: "Course", items: data.courses, key: "course_id", display: (i) => i.course_name },
                { field: "teacher_id", label: "Teacher", items: data.teachers, key: "teacher_id", display: (i) => i.name },
                { field: "room_id", label: "Room", items: data.rooms, key: "room_id", display: (i) => i.room_number },
                { field: "slot_id", label: "Time Slot", items: data.slots, key: "slot_id", display: (i) => `${i.day} ${i.start_time}` },
                { field: "semester_id", label: "Semester", items: data.semesters, key: "semester_id", display: (i) => i.semester_name },
              ].map(({ field, label, items, key, display }) => (
                <select key={field} value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className={inputCls} required>
                  <option value="">Select {label}</option>
                  {items.map((item) => (
                    <option key={item[key]} value={item[key]}>{display(item)}</option>
                  ))}
                </select>
              ))}
              <button type="submit" className={btnAdd}>Add Entry</button>
              {conflictsForDraft.length > 0 && (
                <p className="md:col-span-2 rounded bg-yellow-100 p-2 text-yellow-800">
                  ⚠️ Warning: Potential conflict detected for selected room/teacher and slot.
                </p>
              )}
            </form>
          )}

          {/* MANAGE DATA */}
          {page === "Manage Data" && (
            <div>
              {/* Tabs */}
              <div className="flex gap-1 border-b mb-4">
                {["teachers", "courses", "rooms", "timeslots"].map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)} className={tabCls(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* TEACHERS TAB */}
              {activeTab === "teachers" && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700">Add New Teacher</p>
                  <form onSubmit={addTeacher} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input className={inputCls} placeholder="Full Name" value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} required />
                    <input className={inputCls} placeholder="Email" type="email" value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} required />
                    <select className={inputCls} value={teacherForm.dept_id}
                      onChange={(e) => setTeacherForm({ ...teacherForm, dept_id: e.target.value })} required>
                      <option value="">Select Department</option>
                      {data.departments.map((d) => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
                    </select>
                    <button type="submit" className={btnAdd + " md:col-span-3"}>Add Teacher</button>
                  </form>
                  <p className="font-semibold text-slate-700 mt-4">All Teachers ({data.teachers.length})</p>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse border text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="border p-2 text-left">Name</th>
                          <th className="border p-2 text-left">Email</th>
                          <th className="border p-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.teachers.map((t) => (
                          <tr key={t.teacher_id} className="hover:bg-slate-50">
                            <td className="border p-2">{t.name}</td>
                            <td className="border p-2">{t.email}</td>
                            <td className="border p-2">
                              <button onClick={() => deleteTeacher(t.teacher_id)} className={btnDel}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* COURSES TAB */}
              {activeTab === "courses" && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700">Add New Course</p>
                  <form onSubmit={addCourse} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input className={inputCls} placeholder="Course Name" value={courseForm.course_name}
                      onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })} required />
                    <input className={inputCls} placeholder="Credit Hours (1-6)" type="number" min="1" max="6"
                      value={courseForm.credit_hours}
                      onChange={(e) => setCourseForm({ ...courseForm, credit_hours: e.target.value })} required />
                    <select className={inputCls} value={courseForm.dept_id}
                      onChange={(e) => setCourseForm({ ...courseForm, dept_id: e.target.value })} required>
                      <option value="">Select Department</option>
                      {data.departments.map((d) => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
                    </select>
                    <button type="submit" className={btnAdd + " md:col-span-3"}>Add Course</button>
                  </form>
                  <p className="font-semibold text-slate-700 mt-4">All Courses ({data.courses.length})</p>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse border text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="border p-2 text-left">Course Name</th>
                          <th className="border p-2 text-left">Credits</th>
                          <th className="border p-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.courses.map((c) => (
                          <tr key={c.course_id} className="hover:bg-slate-50">
                            <td className="border p-2">{c.course_name}</td>
                            <td className="border p-2">{c.credit_hours}</td>
                            <td className="border p-2">
                              <button onClick={() => deleteCourse(c.course_id)} className={btnDel}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ROOMS TAB */}
              {activeTab === "rooms" && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700">Add New Room</p>
                  <form onSubmit={addRoom} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input className={inputCls} placeholder="Room Number (e.g. F-101)" value={roomForm.room_number}
                      onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })} required />
                    <input className={inputCls} placeholder="Capacity" type="number" min="1" value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} required />
                    <select className={inputCls} value={roomForm.room_type}
                      onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}>
                      <option value="lecture">Lecture</option>
                      <option value="lab">Lab</option>
                    </select>
                    <button type="submit" className={btnAdd + " md:col-span-3"}>Add Room</button>
                  </form>
                  <p className="font-semibold text-slate-700 mt-4">All Rooms ({data.rooms.length})</p>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse border text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="border p-2 text-left">Room Number</th>
                          <th className="border p-2 text-left">Capacity</th>
                          <th className="border p-2 text-left">Type</th>
                          <th className="border p-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rooms.map((r) => (
                          <tr key={r.room_id} className="hover:bg-slate-50">
                            <td className="border p-2">{r.room_number}</td>
                            <td className="border p-2">{r.capacity}</td>
                            <td className="border p-2">{r.room_type}</td>
                            <td className="border p-2">
                              <button onClick={() => deleteRoom(r.room_id)} className={btnDel}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TIME SLOTS TAB */}
              {activeTab === "timeslots" && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700">Add New Time Slot</p>
                  <form onSubmit={addSlot} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <select className={inputCls} value={slotForm.day}
                      onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}>
                      {["Mon","Tue","Wed","Thu","Fri"].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input className={inputCls} type="time" value={slotForm.start_time}
                      onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} required />
                    <input className={inputCls} type="time" value={slotForm.end_time}
                      onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} required />
                    <button type="submit" className={btnAdd}>Add Slot</button>
                  </form>
                  <p className="font-semibold text-slate-700 mt-4">All Time Slots ({data.slots.length})</p>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse border text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="border p-2 text-left">Day</th>
                          <th className="border p-2 text-left">Start</th>
                          <th className="border p-2 text-left">End</th>
                          <th className="border p-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.slots.map((s) => (
                          <tr key={s.slot_id} className="hover:bg-slate-50">
                            <td className="border p-2">{s.day}</td>
                            <td className="border p-2">{s.start_time}</td>
                            <td className="border p-2">{s.end_time}</td>
                            <td className="border p-2">
                              <button onClick={() => deleteSlot(s.slot_id)} className={btnDel}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORTS */}
          {page === "Reports" && (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Teacher Workload</h3>
                {reports.workload.map((r) => (
                  <div key={r.teacher_id} className="mb-1 rounded border p-2 text-sm">
                    {r.teacher_name} — <span className="font-semibold">{r.total_classes} classes</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Room Utilization (hours/week)</h3>
                {reports.utilization.map((r) => (
                  <div key={r.room_id} className="mb-1 rounded border p-2 text-sm">
                    {r.room_number} ({r.room_type}) — <span className="font-semibold">{Number(r.total_hours_occupied).toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFLICT CHECKER */}
          {page === "Conflict Checker" && (
            <div>
              <h3 className="mb-2 font-semibold">Detected Conflicts</h3>
              {reports.conflicts.length === 0 ? (
                <div className="rounded bg-green-50 p-4 text-green-700 font-medium">
                  ✅ No conflicts found. Your timetable is clean!
                </div>
              ) : (
                reports.conflicts.map((c, idx) => (
                  <div key={idx} className="mb-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                    ⚠️ Entries {c.entry_one} and {c.entry_two} conflict on slot {c.slot_id}.
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
