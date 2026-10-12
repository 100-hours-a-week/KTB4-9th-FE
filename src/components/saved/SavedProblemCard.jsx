import { useState } from "react";
import { fetchProblemDescription } from "../../api/savedProblemApi.js";
import { DIFFICULTY_BADGE_CLASSES } from "../../constants/problemOptions.js";

const FONT = { fontFamily: "'Outfit', sans-serif" };

// 제출 상태별 뱃지 문구와 색
const STATUS_BADGES = {
  NOT_SUBMITTED: { label: "미제출", className: "border-[#252342] bg-[#12121F] text-[#77739A]" },
  IN_PROGRESS: { label: "풀이 중", className: "border-orange-500/30 bg-orange-500/15 text-orange-400" },
  CORRECT: { label: "정답", className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" },
};

function Chevron({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 text-[#77739A]">
      <path d={open ? "M4.5 11l4.5-4.5L13.5 11" : "M4.5 7l4.5 4.5L13.5 7"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 저장 문제 카드. 접힌 상태는 요약, 펼치면 문제 설명·내 풀이·버튼이 나옴
export default function SavedProblemCard({ item, expanded, onToggle, onRetake, onDelete }) {
  // 문제 설명 불러오기 상태: idle → loading → done | error
  const [description, setDescription] = useState({ status: "idle", text: "" });

  function loadDescription() {
    setDescription({ status: "loading", text: "" });
    fetchProblemDescription(item)
      .then((text) => setDescription({ status: "done", text }))
      .catch(() => setDescription({ status: "error", text: "" }));
  }

  function handleToggle() {
    // 1. 처음 펼칠 때만 설명을 불러옴
    if (!expanded && description.status === "idle") loadDescription();
    onToggle();
  }

  const status = STATUS_BADGES[item.status] ?? STATUS_BADGES.NOT_SUBMITTED;

  return (
    <li className="rounded-2xl border border-[#252342] bg-[#0D0D1F]">
      <button type="button" onClick={handleToggle} aria-expanded={expanded} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${DIFFICULTY_BADGE_CLASSES[item.difficulty] || ""}`}>
              {item.difficulty}
            </span>
            {item.category && (
              <span className="truncate rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/20 px-2.5 py-0.5 font-semibold text-[#C084FC]">
                {item.category}
              </span>
            )}
          </div>
          <p className="mt-2 text-base font-semibold text-[#E2E0F0]" style={FONT}>{item.title}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#77739A]" style={FONT}>
            <span className={`rounded-full border px-2 py-0.5 ${status.className}`}>{status.label}</span>
            <span>저장일 {new Date(item.savedAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </div>
        <Chevron open={expanded} />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-[#252342] p-4" style={FONT}>
          <section>
            <h3 className="mb-2 text-xs font-semibold text-[#8B87A8]">문제 설명</h3>
            {description.status === "error" ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-[#252342] px-4 py-5 text-center">
                <p className="text-sm font-semibold text-[#E2E0F0]">문제 내용을 불러올 수 없습니다.</p>
                <p className="text-xs text-[#77739A]">문제 설명 영역만 다시 불러옵니다.</p>
                <button type="button" onClick={loadDescription} className="mt-1 rounded-lg border border-[#252342] px-4 py-1.5 text-xs font-semibold text-[#A89EC4]">
                  다시 시도
                </button>
              </div>
            ) : (
              <p className="whitespace-pre-line rounded-xl border border-[#252342] bg-[#05050F] px-3 py-3 text-sm leading-6 text-[#C9C5E0]">
                {description.status === "done" ? description.text : "불러오는 중..."}
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold text-[#8B87A8]">내 풀이</h3>
            {item.solution ? (
              <pre className="overflow-x-auto rounded-xl border border-[#252342] bg-[#05050F] px-3 py-3 text-xs leading-5 text-[#C9C5E0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {item.solution}
              </pre>
            ) : (
              <p className="rounded-xl border border-dashed border-[#252342] px-3 py-5 text-center text-xs text-[#77739A]">
                저장된 풀이가 없습니다.
              </p>
            )}
          </section>

          <div className="flex gap-2">
            <button type="button" onClick={onRetake} className="flex-1 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white active:bg-[#6D28D9]">
              다시 풀기
            </button>
            <button type="button" onClick={onDelete} className="rounded-xl border border-[#252342] px-5 py-3 text-sm font-semibold text-[#FB7185] active:bg-[#12121F]">
              삭제
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
