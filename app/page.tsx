"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [form, setForm] = useState({
    subject: "",
    hours: "",
    studyDate: "",
    deadline: "",
    priority: "",
    difficulty: "",
    notes: "",
  });

  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [schedule, setSchedule] = useState<any>({});

  // 🔥 FETCH TASKS
  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")!);
      const res = await fetch(`/api/tasks?email=${user.email}`, { cache: "no-store" });
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // 🔥 SAVE TASK
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user")!);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userEmail: user.email }),
    });
    setForm({ subject: "", hours: "", studyDate: "", deadline: "", priority: "", difficulty: "", notes: "" });
    fetchTasks();
  };

  // 🔥 MARK COMPLETE
  const markComplete = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "PUT" });
      setTasks((prev) => prev.map((task) => task._id === id ? { ...task, completed: true } : task));
    } catch (err) { console.log(err); }
  };

  // 🔥 DELETE TASK
  const deleteTask = async (id: string) => {
    console.log("Function called:", id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      console.log("Response:", res.status);
      const data = await res.json();
      console.log("Server says:", data);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) { console.log("ERROR:", err); }
  };

  // 🔥 SORT
  const sortedTasks = [...tasks].sort((a, b) => {
    const order: any = { High: 3, Medium: 2, Low: 1 };
    return (order[b.priority] || 0) - (order[a.priority] || 0);
  });

  // 🔥 FILTER
  const filteredTasks = sortedTasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  // 🔥 PROGRESS
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // 🔥 AUTO SCHEDULER
  const generateSchedule = () => {
    const today = new Date();
    let result: any = {};
    tasks.forEach((task) => {
      if (task.completed) return;
      const deadline = new Date(task.deadline);
      const days = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 0) return;
      const hoursPerDay = Math.ceil(Number(task.hours) / days);
      for (let i = 0; i < days; i++) {
        const day = new Date();
        day.setDate(today.getDate() + i);
        const key = day.toDateString();
        if (!result[key]) result[key] = [];
        result[key].push({ subject: task.subject, hours: hoursPerDay });
      }
    });
    setSchedule(result);
  };

  const priorityStyles: any = {
    High:   "bg-amber-100 text-amber-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low:    "bg-stone-200 text-stone-700",
  };

  // Tailwind-safe CSS vars for earthy palette
  const styles = {
    pageBg:        "min-h-screen bg-[#F5F0E8] p-4 md:p-6 lg:p-8",
    headerIcon:    "flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D4A1A]",
    logoutBtn:     "rounded-lg bg-[#5C3D1E] px-4 py-2 text-sm font-medium text-[#F5F0E8] hover:bg-[#3D2610] transition",
    statCard:      "rounded-xl border border-[#DDD0B8] bg-white px-4 py-3",
    progressBg:    "h-2 w-full overflow-hidden rounded-full bg-[#EDE5D4]",
    progressFill:  "h-2 rounded-full bg-[#6B7C3A] transition-all duration-500",
    card:          "rounded-2xl border border-[#DDD0B8] bg-white p-5 shadow-sm",
    sectionTitle:  "mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6B5A3E]",
    input:         "w-full rounded-lg border border-[#DDD0B8] bg-[#F5F0E8] px-3 py-2.5 text-sm text-[#2C2215] outline-none transition focus:border-[#6B7C3A] focus:bg-white",
    btnPrimary:    "w-full rounded-lg bg-[#3D4A1A] py-2.5 text-sm font-medium text-[#F5F0E8] transition hover:bg-[#2C3A0F] active:scale-[0.98]",
    btnSchedule:   "mb-5 w-full rounded-lg bg-[#5C3D1E] py-2.5 text-sm font-medium text-[#F5F0E8] transition hover:bg-[#3D2610] active:scale-[0.98]",
    taskCard:      "rounded-xl border border-[#DDD0B8] bg-[#F5F0E8] p-4 shadow-sm transition",
    taskDone:      "rounded-xl border border-[#C4A882] bg-[#EDE5D4] p-4 shadow-sm transition opacity-60",
    tagHours:      "rounded-full bg-[#DDE3C0] px-2 py-0.5 text-xs font-medium text-[#3D4A1A]",
    tagDeadline:   "rounded-full bg-[#E8D9C4] px-2 py-0.5 text-xs font-medium text-[#5C3D1E]",
    btnDone:       "rounded-lg bg-[#6B7C3A] px-2.5 py-1.5 text-xs font-medium text-[#F5F0E8] transition hover:bg-[#3D4A1A]",
    btnDelete:     "rounded-lg bg-[#EDE5D4] px-2.5 py-1.5 text-xs font-medium text-[#5C3D1E] transition hover:bg-[#DDD0B8]",
    schedDay:      "rounded-xl border border-[#DDD0B8] bg-[#F5F0E8] px-4 py-3",
    schedHrsTag:   "rounded-full bg-[#DDE3C0] px-2.5 py-0.5 text-xs font-medium text-[#3D4A1A]",
  };

  return (
    <div className={styles.pageBg}>

      {/* ── HEADER ── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={styles.headerIcon}>
            <svg className="h-5 w-5" fill="none" stroke="#F5F0E8" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#2C3A0F]">Study Planner</h1>
            <p className="text-sm text-[#6B5A3E]">Manage tasks &amp; generate your study schedule</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* ── STATS ROW ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={styles.statCard}>
          <p className="text-2xl font-semibold text-[#3D4A1A]">{tasks.length}</p>
          <p className="mt-0.5 text-xs text-[#9C8060]">Total tasks</p>
        </div>
        <div className={styles.statCard}>
          <p className="text-2xl font-semibold text-[#5C3D1E]">{completedTasks}</p>
          <p className="mt-0.5 text-xs text-[#9C8060]">Completed</p>
        </div>
        <div className={styles.statCard}>
          <p className="text-2xl font-semibold text-[#6B7C3A]">{tasks.length - completedTasks}</p>
          <p className="mt-0.5 text-xs text-[#9C8060]">Pending</p>
        </div>
        <div className={styles.statCard}>
          <p className="text-2xl font-semibold text-[#8B6343]">{progressPct}%</p>
          <p className="mt-0.5 text-xs text-[#9C8060]">Progress</p>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="mb-6 rounded-xl border border-[#DDD0B8] bg-white px-4 py-3">
        <div className="mb-1.5 flex justify-between text-xs text-[#9C8060]">
          <span>Overall progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className={styles.progressBg}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-5">

          {/* INPUT CARD */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>
              <span className="inline-block h-2 w-2 rounded-full bg-[#6B7C3A]" />
              Add New Task
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B5A3E]">Subject</label>
                <input
                  placeholder="e.g. Mathematics"
                  className={styles.input}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B5A3E]">Study hours</label>
                  <input
                    type="number" placeholder="0"
                    className={styles.input}
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B5A3E]">Priority</label>
                  <select
                    className={styles.input}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B5A3E]">Study date</label>
                  <input
                    type="date" className={styles.input}
                    value={form.studyDate}
                    onChange={(e) => setForm({ ...form, studyDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B5A3E]">Deadline</label>
                  <input
                    type="date" className={styles.input}
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B5A3E]">Notes</label>
                <textarea
                  placeholder="Any additional notes..."
                  className={styles.input}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button type="submit" className={styles.btnPrimary}>
                Add Task
              </button>
            </form>
          </div>

          {/* TASK LIST */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6B5A3E]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#6B7C3A]" />
                Your Tasks
              </h2>
              <div className="flex overflow-hidden rounded-lg border border-[#DDD0B8] bg-white text-xs font-medium">
                {["all", "pending", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 capitalize transition ${
                      filter === f
                        ? "bg-[#3D4A1A] text-[#F5F0E8]"
                        : "text-[#6B5A3E] hover:bg-[#F5F0E8]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {filteredTasks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#C4A882] bg-white py-10 text-center text-sm text-[#9C8060]">
                  No tasks to show
                </div>
              )}
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={task.completed ? styles.taskDone : styles.taskCard}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className={`truncate text-sm font-semibold ${
                        task.completed ? "text-[#9C8060] line-through" : "text-[#2C2215]"
                      }`}>
                        {task.subject}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className={styles.tagHours}>{task.hours} hrs</span>
                        {task.priority && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority] || "bg-stone-100 text-stone-600"}`}>
                            {task.priority}
                          </span>
                        )}
                        {task.deadline && (
                          <span className={styles.tagDeadline}>
                            {new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1.5">
                      {!task.completed && (
                        <button onClick={() => markComplete(task._id)} className={styles.btnDone}>
                          Done
                        </button>
                      )}
                      <button
                        onClick={() => { console.log("Clicked:", task._id); deleteTask(task._id); }}
                        className={styles.btnDelete}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="mt-2 line-clamp-2 text-xs text-[#9C8060]">{task.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-5">
          <div className={`${styles.card} border-[#C4A882]`}>
            <h2 className={styles.sectionTitle}>
              <span className="inline-block h-2 w-2 rounded-full bg-[#8B6343]" />
              Study Schedule
            </h2>

            <button onClick={generateSchedule} className={styles.btnSchedule}>
              Generate Study Plan
            </button>

            {Object.keys(schedule).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE5D4]">
                  <svg className="h-6 w-6 text-[#C4A882]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="text-sm text-[#9C8060]">No plan generated yet.</p>
                <p className="mt-1 text-xs text-[#C4A882]">Click the button above to build your schedule.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(schedule).map(([day, items]: any) => (
                  <div key={day} className={styles.schedDay}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#5C3D1E]">
                      {day}
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-[#2C2215]">{item.subject}</span>
                          <span className={styles.schedHrsTag}>{item.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}