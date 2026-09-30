// 풀이를 제출하기 전에 화면을 나가려 할 때 뜨는 확인 모달
export default function LeaveConfirmModal({ onStay, onLeave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-5">
        <h3 className="mb-2 text-base font-bold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          아직 풀이를 제출하지 않았어요
        </h3>
        <p className="mb-1.5 text-sm leading-relaxed text-[#A89EC4]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          지금 나가면 오늘의 문제 생성 횟수는 돌아오지 않아요.
        </p>
        <p className="mb-5 text-xs leading-relaxed text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          제출하지 않은 문제는 안 푼 문제로 남아서, 나중에 다시 나올 수 있어요.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onLeave}
            className="flex-1 rounded-xl border border-[#1E1D35] px-4 py-3 text-sm font-semibold text-[#A89EC4] active:bg-[#12121F]"
          >
            나가기
          </button>
          <button
            type="button"
            onClick={onStay}
            className="flex-1 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white active:bg-[#6D28D9]"
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
