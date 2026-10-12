// 저장된 문제를 삭제하기 전에 확인하는 모달. error가 있으면 실패 안내와 "다시 삭제"를 보여줌
export default function DeleteSavedProblemModal({ error, deleting, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-5 text-center">
        <h3 className="text-base font-bold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          저장된 문제를 삭제할까요?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#8B87A8]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          삭제한 문제와 풀이 기록은
          <br />
          복구할 수 없습니다.
        </p>
        {error && (
          <div role="alert" className="mt-4 rounded-xl border border-[#FB7185]/40 bg-[#FB7185]/10 px-3 py-2.5 text-left text-xs leading-relaxed text-[#FDA4AF]">
            <p className="font-semibold">문제를 삭제하지 못했습니다.</p>
            <p>다시 시도해 주세요.</p>
          </div>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-[#1E1D35] px-4 py-3 text-sm font-semibold text-[#A89EC4] active:bg-[#12121F] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white active:bg-[#6D28D9] disabled:opacity-50"
          >
            {deleting ? "삭제 중..." : error ? "다시 삭제" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
