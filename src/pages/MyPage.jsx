import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import UserMenu from "../components/common/UserMenu.jsx";
import { getStoredUser } from "../services/auth.js";
import { clearCurrentProblem, getCurrentProblem } from "../store.js";

const LEVELS = ["LV1", "LV2", "LV3", "LV4", "LV5"];

const LEVEL_COLORS = {
  LV1: "#22D3EE",
  LV2: "#2DD4BF",
  LV3: "#FACC15",
  LV4: "#FB923C",
  LV5: "#FB7185",
};

const DEFAULT_CODE = `def solution(nums):
    # 여기에 코드를 작성하세요
    pass`;

function getProblemDate(problem) {
  const generatedTimestamp = String(problem.id || "").includes("_")
    ? Number(String(problem.id).split("_")[0])
    : null;
  const date = new Date(problem.createdAt || generatedTimestamp || Date.now());
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

export default function MyPage() {
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const [problems, setProblems] = useState(() => {
    const currentProblem = getCurrentProblem();
    return currentProblem ? [currentProblem] : [];
  });
  const [filter, setFilter] = useState("전체");
  const [expandedId, setExpandedId] = useState(null);

  const counts = useMemo(() => Object.fromEntries([
    ["전체", problems.length],
    ...LEVELS.map((level) => [level, problems.filter((problem) => problem.difficulty === level).length]),
  ]), [problems]);

  const filteredProblems = filter === "전체"
    ? problems
    : problems.filter((problem) => problem.difficulty === filter);

  const continueProblem = (problem) => {
    const destination = problem.id
      ? `/problems/${problem.id}`
      : "/solve";
    navigate(destination);
  };

  const deleteProblem = (problemId) => {
    clearCurrentProblem();
    setProblems((items) => items.filter((problem) => problem.id !== problemId));
    setExpandedId(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#05050F] px-5 pb-8">
      <header className="flex items-center gap-4 pb-7 pt-8">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#7C3AED]/70 bg-[#24103F] text-xl font-bold text-[#C084FC]">
          {(user.name || "?")[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-[#E2E0F0]">
            {user.name || "사용자"}
          </p>
          <p className="mt-1 truncate text-sm text-[#77739A]">
            {user.email || "로그인 계정"}
          </p>
        </div>
        <UserMenu menuIcon rounded="rounded-2xl" />
      </header>

      <main className="space-y-5">
        <section className="grid grid-cols-3 gap-2.5">
          {["전체", ...LEVELS].map((level) => (
            <div key={level} className="flex min-h-[86px] flex-col items-center justify-center rounded-2xl border border-[#252342] bg-[#0D0D1F]">
              <strong
                className="text-2xl font-semibold"
                style={{
                  color: level === "전체" ? "#C084FC" : LEVEL_COLORS[level],
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {counts[level]}
              </strong>
              <span className="mt-1 text-xs text-[#77739A]">{level}</span>
            </div>
          ))}
        </section>

        <section className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["전체", ...LEVELS].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFilter(level)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                filter === level
                  ? "border-[#7C3AED] bg-[#351060] text-[#D8B4FE]"
                  : "border-[#252342] bg-[#0D0D1F] text-[#77739A]"
              }`}
            >
              {level}
            </button>
          ))}
        </section>

        <section className="space-y-3">
          {filteredProblems.map((problem) => {
            const expanded = expandedId === problem.id;
            return (
              <article
                key={problem.id || problem.title}
                className={`overflow-hidden rounded-2xl border bg-[#0D0D1F] transition-colors ${
                  expanded ? "border-[#3C2368]" : "border-[#252342]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : problem.id)}
                  className="flex w-full items-center gap-3 p-5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: LEVEL_COLORS[problem.difficulty] || "#C084FC", fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {problem.difficulty || "LV"}
                      </span>
                      {problem.category && (
                        <span className="rounded-full bg-[#49152F] px-2.5 py-1 text-[11px] font-medium text-[#F9A8C0]">
                          {problem.category}
                        </span>
                      )}
                    </div>
                    <h2 className="truncate text-base font-semibold text-[#E2E0F0]">
                      {problem.title || "진행 중인 문제"}
                    </h2>
                    <p className="mt-1 text-xs text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {getProblemDate(problem)}
                    </p>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                    <path d={expanded ? "M4 11.5 9 6.5l5 5" : "m4 6.5 5 5 5-5"} stroke="#77739A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {expanded && (
                  <div className="border-t border-[#252342] px-5 pb-5 pt-4 animate-fadeIn">
                    <p className="text-sm leading-7 text-[#A89EC4]">
                      {problem.description || "문제 설명이 없습니다."}
                    </p>
                    <div className="mt-4 rounded-2xl border border-[#252342] bg-[#06060E] p-4">
                      <p className="mb-3 text-xs text-[#77739A]">내 풀이</p>
                      <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-[#C8B8F8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {problem.sourceCode || problem.code || DEFAULT_CODE}
                      </pre>
                    </div>
                    <div className="mt-4 flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => continueProblem(problem)}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
                      >
                        다시 풀기
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProblem(problem.id)}
                        className="rounded-2xl border border-[#7F1D3D] bg-[#31101F] px-5 py-3.5 text-sm font-semibold text-[#FB7185] active:scale-[0.98]"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {filteredProblems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#252342] py-12 text-center">
              <p className="text-sm text-[#6B6890]">해당 난이도의 문제가 없어요.</p>
              {problems.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/problems/new")}
                  className="mt-4 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white"
                >
                  문제 생성하기
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
