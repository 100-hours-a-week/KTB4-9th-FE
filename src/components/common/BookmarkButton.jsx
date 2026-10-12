import { useState } from "react";
import { readSavedFlag, setProblemSaved } from "../../api/savedProblemApi.js";

export default function BookmarkButton({ problem }) {
  const [saved, setSaved] = useState(() => readSavedFlag(problem.id, problem.saved));
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  // 문제 상세 조회 결과가 도착해 서버의 저장 여부가 바뀌면 아이콘도 맞춤
  const [serverSaved, setServerSaved] = useState(problem.saved);
  if (serverSaved !== problem.saved) {
    setServerSaved(problem.saved);
    setSaved(readSavedFlag(problem.id, problem.saved));
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 1500);
  }

  async function handleClick() {
    // 1. 요청 중에는 중복 탭을 막음
    if (busy) return;
    setBusy(true);

    // 2. 응답을 기다리지 않고 아이콘부터 바꿈
    const next = !saved;
    setSaved(next);

    try {
      // 3. 서버에 저장 또는 해제를 요청
      await setProblemSaved(problem, next);
      showToast(next ? "저장했어요" : "저장을 해제했어요");
    } catch {
      // 4. 실패하면 아이콘을 원래대로 되돌림
      setSaved(!next);
      showToast("저장에 실패했어요");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? "저장 해제" : "문제 저장"}
        aria-pressed={saved}
        className={`p-1.5 rounded-lg ${saved ? "text-[#A855F7]" : "text-[#6B6890]"}`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill={saved ? "currentColor" : "none"}>
          <path d="M5 3.5h10v13l-5-3.5-5 3.5v-13z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </button>
      {toast && (
        <div className="absolute right-0 top-full mt-1 whitespace-nowrap rounded-lg bg-[#1E1D35] px-3 py-1.5 text-xs text-[#E2E0F0] z-10">
          {toast}
        </div>
      )}
    </div>
  );
}
