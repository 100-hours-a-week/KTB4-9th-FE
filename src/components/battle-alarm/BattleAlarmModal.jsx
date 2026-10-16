import { useEffect } from "react";

const FONT = { fontFamily: "'Outfit', sans-serif" };

// 배틀 알림 모달. 다른 모달 위에도 보이도록 z-index를 높게 둔다.
export default function BattleAlarmModal({ view, busy, onChallenge, onDismiss }) {
  // 모달이 떠 있는 동안 뒤 화면이 스크롤되지 않게 막는다.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const isOpen = view === "open";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-5">
        <h3 className="mb-2 whitespace-pre-line text-center text-xl font-bold text-[#E2E0F0]" style={FONT}>
          {isOpen ? "PM 12:00!\n오늘의 배틀이 열렸습니다." : "오늘의 배틀 참여가\n마감되었습니다."}
        </h3>
        <p className="mb-5 text-center text-sm leading-relaxed text-[#A89EC4]" style={FONT}>
          {isOpen ? "오늘의 TOP5에 도전하세요!" : "내일 낮 12시에 다시 도전해 주세요."}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-xl border border-[#1E1D35] px-4 py-3 text-sm font-semibold text-[#A89EC4] active:bg-[#12121F]"
          >
            닫기
          </button>
          {isOpen ? (
            <button
              type="button"
              onClick={onChallenge}
              disabled={busy}
              className="flex-1 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white active:bg-[#6D28D9] disabled:opacity-60"
            >
              도전하기
            </button>
          ) : (
            <button type="button" disabled className="flex-1 rounded-xl bg-[#1E1D35] px-4 py-3 text-sm font-semibold text-[#6B6890]">
              도전 마감
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
