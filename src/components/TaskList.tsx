"use client";

import { useState, useEffect, useRef } from "react";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = "dashboard-tasks";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setTasks(JSON.parse(stored));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTasks([...tasks, { id: crypto.randomUUID(), text, done: false }]);
    setInput("");
    inputRef.current?.focus();
  }

  function toggleTask(id: string) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  if (!loaded) return <div className="glass rounded-2xl p-8 h-72" />;

  return (
    <div className="glass glass-glow animate-fade-up delay-2 rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-muted text-xs font-semibold uppercase tracking-widest">
            Tasks
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-muted text-xs tabular-nums">
              {done}/{total}
            </span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-3 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={addTask} className="mb-5 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="input-glow flex-1 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/30 focus:outline-none transition-all duration-300"
        />
        <button
          type="submit"
          className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          Add
        </button>
      </form>

      {/* Task list */}
      {total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="text-3xl opacity-20">✦</div>
          <p className="text-muted/40 text-sm">
            Your slate is clean. Add a task to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map((task, i) => (
            <li
              key={task.id}
              className="animate-slide-in group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/[0.03]"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                  task.done
                    ? "border-accent/50 bg-gradient-to-br from-accent to-accent-2 shadow-[0_0_10px_rgba(129,140,248,0.3)]"
                    : "border-white/10 hover:border-accent/40 hover:shadow-[0_0_8px_rgba(129,140,248,0.15)]"
                }`}
              >
                {task.done && (
                  <svg className="h-3 w-3 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm transition-all duration-300 ${
                  task.done ? "text-muted/40 line-through" : "text-foreground/90"
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => removeTask(task.id)}
                className="text-muted/30 hover:text-danger opacity-0 transition-all duration-200 group-hover:opacity-100 text-sm"
                aria-label="Remove task"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
