"use client";

import { useState, useRef } from "react";

interface Task {
  id: string;
  text: string;
  estimateMins?: number;
  done: boolean;
}

function parseTask(raw: string): { text: string; estimateMins?: number } {
  const match = raw.trim().match(/^(.+?)\s*\((\d+)m?\)\s*$/);
  if (match) return { text: match[1].trim(), estimateMins: parseInt(match[2]) };
  return { text: raw.trim() };
}

export function TinyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput]  = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const { text, estimateMins } = parseTask(trimmed);
    setTasks((prev) => [...prev, { id: Date.now().toString(), text, estimateMins, done: false }]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTask  = (id: string) => setTasks((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask  = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  const active = tasks.filter((t) => !t.done);
  const done   = tasks.filter((t) => t.done);

  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3">Tiny tasks</p>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task… (15m)"
          className="flex-1 text-sm px-3 py-2 rounded-xl border border-sky-100 bg-white/60 text-sky-700 placeholder-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
        />
        <button
          onClick={addTask}
          disabled={!input.trim()}
          className="px-3 py-2 text-sm rounded-xl bg-sky-100 text-sky-600 font-medium hover:bg-sky-200 disabled:opacity-30 transition"
        >
          Add
        </button>
      </div>

      {active.length === 0 && done.length === 0 && (
        <p className="text-sm text-sky-200 text-center py-2">Nothing yet — add something quick</p>
      )}

      <div className="space-y-1.5">
        {active.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5 group px-1 py-1 rounded-xl hover:bg-sky-50/60 transition">
            <button
              onClick={() => toggleTask(task.id)}
              className="w-4 h-4 rounded border border-sky-200 shrink-0 hover:border-sky-400 transition flex items-center justify-center bg-white/60"
            />
            <span className="flex-1 text-sm text-sky-700">{task.text}</span>
            {task.estimateMins && (
              <span className="text-xs text-sky-300 shrink-0">{task.estimateMins}m</span>
            )}
            <button
              onClick={() => removeTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-sky-200 hover:text-sky-400 text-xs transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div className="mt-3 pt-3 border-t border-sky-100/60 space-y-1.5">
          {done.map((task) => (
            <div key={task.id} className="flex items-center gap-2.5 group px-1 py-1 rounded-xl">
              <button
                onClick={() => toggleTask(task.id)}
                className="w-4 h-4 rounded border border-sky-300 bg-sky-300 shrink-0 flex items-center justify-center"
              >
                <span className="text-white text-[9px] leading-none">✓</span>
              </button>
              <span className="flex-1 text-sm text-sky-200 line-through">{task.text}</span>
              <button
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-sky-200 hover:text-sky-400 text-xs transition"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => setTasks((p) => p.filter((t) => !t.done))}
            className="text-xs text-sky-300 hover:text-sky-500 mt-1 transition"
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
}
