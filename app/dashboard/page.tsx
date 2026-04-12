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

  useEffect(() => {
    fetchTasks();
  }, []);
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
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? { ...task, completed: true } : task))
      );
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 DELETE TASK
  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.log(err);
    }
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
    High: "bg-pink-100 text-pink-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">

      {/* ── HEADER ── */}
<div className="mb-6 flex items-center justify-between">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-300 to-blue-300">
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Study Planner</h1>
      <p className="text-sm text-slate-500">Manage tasks & generate your study schedule</p>
    </div>
  </div>

  {/* 🔴 LOGOUT BUTTON */}
  <button
    onClick={handleLogout}
    className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200 transition"
  >
    Logout
  </button>

</div>

      {/* ── STATS ROW ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-pink-100 bg-white px-4 py-3">
          <p className="text-2xl font-semibold text-pink-500">{tasks.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total tasks</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white px-4 py-3">
          <p className="text-2xl font-semibold text-blue-500">{completedTasks}</p>
          <p className="text-xs text-slate-500 mt-0.5">Completed</p>
        </div>
        <div className="rounded-xl border border-pink-100 bg-white px-4 py-3">
          <p className="text-2xl font-semibold text-pink-400">{tasks.length - completedTasks}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pending</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white px-4 py-3">
          <p className="text-2xl font-semibold text-blue-400">{progressPct}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Progress</p>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="mb-6 rounded-xl border border-pink-100 bg-white px-4 py-3">
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>Overall progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-5">

          {/* INPUT CARD */}
          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-pink-400" />
              Add New Task
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
                <input
                  placeholder="e.g. Mathematics"
                  className="w-full rounded-lg border border-pink-100 bg-pink-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Study hours</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-lg border border-pink-100 bg-pink-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white"
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
                  <select
                    className="w-full rounded-lg border border-pink-100 bg-pink-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white"
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
                  <label className="mb-1 block text-xs font-medium text-slate-500">Study date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-pink-100 bg-pink-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white"
                    value={form.studyDate}
                    onChange={(e) => setForm({ ...form, studyDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Deadline</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-pink-100 bg-pink-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
                <textarea
                  placeholder="Any additional notes..."
                  className="w-full resize-y rounded-lg border border-pink-100 bg-pink-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-pink-400 to-pink-500 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                Add Task
              </button>
            </form>
          </div>

          {/* TASK LIST */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-pink-400" />
                Your Tasks
              </h2>
              {/* Filter tabs */}
              <div className="flex rounded-lg border border-pink-100 bg-white overflow-hidden text-xs font-medium">
                {["all", "pending", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 transition capitalize ${
                      filter === f
                        ? "bg-pink-400 text-white"
                        : "text-slate-500 hover:bg-pink-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {filteredTasks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-pink-200 bg-white py-10 text-center text-sm text-slate-400">
                  No tasks to show
                </div>
              )}
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                    task.completed
                      ? "border-blue-100 opacity-60"
                      : "border-pink-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`truncate text-sm font-semibold ${
                          task.completed ? "text-slate-400 line-through" : "text-slate-800"
                        }`}
                      >
                        {task.subject}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                          {task.hours} hrs
                        </span>
                        {task.priority && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority] || "bg-slate-100 text-slate-600"}`}>
                            {task.priority}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1.5">
                      {!task.completed && (
                        <button
                          onClick={() => markComplete(task._id)}
                          className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          Done
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="rounded-lg bg-pink-50 px-2.5 py-1.5 text-xs font-medium text-pink-500 transition hover:bg-pink-100"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">{task.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
              Study Schedule
            </h2>

            <button
              onClick={generateSchedule}
              className="mb-5 w-full rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              Generate Study Plan
            </button>

            {Object.keys(schedule).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">No plan generated yet.</p>
                <p className="mt-1 text-xs text-slate-300">Click the button above to build your schedule.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(schedule).map(([day, items]: any) => (
                  <div key={day} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {day}
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{item.subject}</span>
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {item.hours} hrs
                          </span>
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