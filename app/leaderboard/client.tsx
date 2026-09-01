'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

interface LeaderboardStudent {
  id: string;
  name: string;
  college: string;
  branch: string;
  avgScore: number;
  testCount: number;
  taskCount: number;
  taskPts: number;
  certCount: number;
  overallRating: number;
}

interface LeaderboardClientProps {
  board: LeaderboardStudent[];
  userId: string;
}

export default function LeaderboardClient({ board, userId }: LeaderboardClientProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("hirelytix-theme");
    const prefersDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    
    // Listen for theme changes
    const handleThemeChange = () => {
      const newTheme = document.documentElement.dataset.theme;
      setIsDark(newTheme === "dark");
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Campus & Skill Leaderboard 🏆</h1>
          <p className="muted">
            Rankings synthesized from verified MCQ skill tests, completed practical projects, and digital credentials.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/assessment" className="btn secondary">Take a Test</Link>
          <Link href="/tasks" className="btn primary">Solve Tasks ⚡</Link>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      {board.length >= 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {/* Rank 2 */}
          <Reveal delay={0}><div className="card" style={{ textAlign: "center", borderColor: "#94a3b8", background: "#eee3d0" }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🥈</div>
            <span className="tag" style={{ background: "#e5d7c0", color: "#52605b" }}>Rank #2</span>
            <h3 style={{ margin: "10px 0 4px", fontSize: 17 }}>{board[1].name}</h3>
            <p className="muted" style={{ fontSize: 12, margin: "0 0 10px" }}>{board[1].branch}</p>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#94a3b8" }}>{board[1].overallRating} rating</div>
            <small className="muted">{board[1].avgScore}% avg • {board[1].taskCount} tasks</small>
          </div></Reveal>

          {/* Rank 1 */}
          <Reveal delay={100}><div className="card" style={{ textAlign: "center", borderColor: "#fbbf24", background: "#eee3d0", transform: "translateY(-6px)" }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>👑 🥇</div>
            <span className="tag" style={{ background: "#e5d7c0", color: "#806326", fontWeight: 700 }}>Rank #1 Champion</span>
            <h3 style={{ margin: "10px 0 4px", fontSize: 19 }}>{board[0].name}</h3>
            <p className="muted" style={{ fontSize: 12, margin: "0 0 10px" }}>{board[0].branch}</p>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24" }}>{board[0].overallRating} rating</div>
            <small className="muted">{board[0].avgScore}% avg • {board[0].taskPts} task pts</small>
          </div></Reveal>

          {/* Rank 3 */}
          <Reveal delay={200}><div className="card" style={{ textAlign: "center", borderColor: "#b45309", background: "#eee3d0" }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🥉</div>
            <span className="tag" style={{ background: "#e5d7c0", color: "#8a5e38" }}>Rank #3</span>
            <h3 style={{ margin: "10px 0 4px", fontSize: 17 }}>{board[2].name}</h3>
            <p className="muted" style={{ fontSize: 12, margin: "0 0 10px" }}>{board[2].branch}</p>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fdba74" }}>{board[2].overallRating} rating</div>
            <small className="muted">{board[2].avgScore}% avg • {board[2].taskCount} tasks</small>
          </div></Reveal>
        </div>
      )}

      {/* Leaderboard Table */}
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 2fr 1.2fr 1fr 1fr 120px", padding: "14px 20px", background: "#eee3d0", borderBottom: "1px solid #d8cbb6", fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
          <span>Rank</span>
          <span>Student</span>
          <span>College & Branch</span>
          <span>Avg Score</span>
          <span>Tasks & Pts</span>
          <span style={{ textAlign: "right" }}>Rating Score</span>
        </div>

        {board.map((student, i) => {
          const isCurrent = student.id === userId;
          // Theme-aware text color for student names
          const nameColor = isCurrent ? "#7c5cff" : (isDark ? "#fff" : "#24322f");
          
          return (
            <div
              key={student.id}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 2fr 1.2fr 1fr 1fr 120px",
                padding: "16px 20px",
                alignItems: "center",
                borderBottom: isDark ? "1px solid #142236" : "1px solid #d8cbb6",
                background: isCurrent ? "rgba(124, 92, 255, 0.08)" : undefined
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#fdba74" : "#64748b" }}>
                #{i + 1}
              </div>

              <div>
                <b style={{ fontSize: 15, color: nameColor }}>
                  {student.name} {isCurrent && <span className="tag" style={{ fontSize: 10 }}>You</span>}
                </b>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {student.certCount} certificate(s) unlocked
                </div>
              </div>

              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                <div>{student.college}</div>
                <small style={{ color: "#64748b" }}>{student.branch}</small>
              </div>

              <div>
                <strong style={{ fontSize: 16, color: student.avgScore >= 80 ? "#34d399" : "#60a5fa" }}>
                  {student.avgScore}%
                </strong>
                <div style={{ fontSize: 11, color: "#64748b" }}>{student.testCount} test(s)</div>
              </div>

              <div>
                <strong style={{ fontSize: 14, color: "#a78bfa" }}>
                  {student.taskCount} tasks
                </strong>
                <div style={{ fontSize: 11, color: "#38bdf8" }}>+{student.taskPts} pts</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8" }}>
                  {student.overallRating}
                </div>
                <div className="bar" style={{ height: 4, marginTop: 4 }}>
                  <i style={{ width: `${Math.min(student.overallRating, 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
