'use client';

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

interface TaskItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  points: number;
  estimatedMinutes: number;
  description: string;
  tags: string;
  completed: boolean;
  score?: number;
}

export default function TasksClient({ tasks }: { tasks: TaskItem[] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const categories = ["ALL", "AI & ML", "Frontend", "Backend", "Data Science", "DevOps", "DSA"];

  const filtered = tasks.filter((t) => {
    const matchesCat =
      activeCategory === "ALL" ||
      t.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      search === "" ||
      (t.title + " " + t.description + " " + t.tags)
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalPointsEarned = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (t.score || t.points), 0);
  const totalTasksCompleted = tasks.filter((t) => t.completed).length;

  return (
    <div>
      {/* Overview Stats */}
      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat">
          <small>Practical Tasks</small>
          <div className="num">{tasks.length}</div>
          <small>Unlocked & available</small>
        </div>
        <div className="stat">
          <small>Completed Tasks</small>
          <div className="num" style={{ color: "#34d399" }}>{totalTasksCompleted}</div>
          <small>{Math.round((totalTasksCompleted / (tasks.length || 1)) * 100)}% progress</small>
        </div>
        <div className="stat">
          <small>Earned Points</small>
          <div className="num" style={{ color: "#a78bfa" }}>{totalPointsEarned} pts</div>
          <small>Practical skills score</small>
        </div>
        <div className="stat">
          <small>Workbench Status</small>
          <div className="num" style={{ color: "#38bdf8" }}>Active</div>
          <small>Instant automated tester</small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 24, padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: activeCategory === cat ? "1px solid #7c5cff" : "1px solid #243a55",
                  background: "#e9dcc4",
                  color: "#40504b",
                  transition: "all 0.2s ease"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ minWidth: 240, flex: "1 1 200px", maxWidth: 360 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, stacks, tags..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                background: "#f8f1e5",
                border: "1px solid #243a55",
                color: "#fff",
                fontSize: 13
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {filtered.map((task) => {
          const diffColor =
            task.difficulty === "Easy"
              ? { bg: "#e5d7c0", text: "#287a63", border: "#9fc8b8" }
              : task.difficulty === "Medium"
              ? { bg: "#e5d7c0", text: "#806326", border: "#d2b875" }
              : { bg: "#e5d7c0", text: "#8a4b4b", border: "#d0a9a9" };

          return (
            <Reveal key={task.id} delay={(filtered.indexOf(task) % 6) * 90}>
            <div
              key={task.id}
              className="card task-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderColor: task.completed ? "#10b981" : "#1d3048",
                position: "relative",
                background: task.completed ? "#eee3d0" : undefined
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="tag" style={{ background: "#e5d7c0", color: "#40504b" }}>
                    {task.category}
                  </span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background: diffColor.bg,
                        color: diffColor.text,
                        border: `1px solid ${diffColor.border}`
                      }}
                    >
                      {task.difficulty}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8" }}>
                      +{task.points} pts
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: 17, margin: "0 0 10px", lineHeight: 1.4 }}>
                  {task.title}
                </h3>

                <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                  {task.description}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
                  {task.tags.split(",").map((tag) => (
                    <span key={tag} className="tag" style={{ fontSize: 10, padding: "2px 6px" }}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid #1c2d45" }}>
                <span className="muted" style={{ fontSize: 12 }}>
                  ⏱ ~{task.estimatedMinutes} mins
                </span>

                {task.completed ? (
                  <Link
                    href={`/tasks/${task.slug}`}
                    className="btn secondary"
                    style={{
                      fontSize: 12,
                      padding: "8px 14px",
                      borderColor: "#10b981",
                      color: "#34d399",
                      background: "#e5d7c0"
                    }}
                  >
                    ✓ Completed ({task.score || task.points} pts)
                  </Link>
                ) : (
                  <Link
                    href={`/tasks/${task.slug}`}
                    className="btn primary"
                    style={{ fontSize: 12, padding: "8px 14px" }}
                  >
                    Open Task ⚡
                  </Link>
                )}
              </div>
            </div>
            </Reveal>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card empty" style={{ marginTop: 20 }}>
          No tasks found matching your filter or search query.
        </div>
      )}
    </div>
  );
}
