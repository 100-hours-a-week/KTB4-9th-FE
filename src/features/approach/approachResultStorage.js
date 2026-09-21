const STORAGE_PREFIX = "cosmos_approach_result_v1:";

function storageKey(problemId) {
  return `${STORAGE_PREFIX}${problemId}`;
}

export function loadApproachResult(problemId, storage = globalThis.localStorage) {
  if (problemId == null || !storage) return null;

  try {
    const saved = JSON.parse(storage.getItem(storageKey(problemId)) || "null");
    if (!saved || !["pending", "failed", "completed"].includes(saved.evaluation?.status)) {
      return null;
    }
    if (saved.evaluation.status === "completed" && !Array.isArray(saved.evaluation.keywords)) {
      return null;
    }

    return {
      selectedCategory: typeof saved.selectedCategory === "string" ? saved.selectedCategory : null,
      categoryKnown: typeof saved.categoryKnown === "boolean" ? saved.categoryKnown : null,
      approach: typeof saved.approach === "string" ? saved.approach : "",
      evaluation: saved.evaluation,
      answerRevealed: saved.answerRevealed === true,
    };
  } catch {
    return null;
  }
}

export function saveApproachResult(problemId, result, storage = globalThis.localStorage) {
  if (problemId == null || !storage) return;

  try {
    storage.setItem(storageKey(problemId), JSON.stringify(result));
  } catch {
    // 저장 공간이 비활성화돼도 현재 화면의 제출 결과는 그대로 보여줍니다.
  }
}

export function markApproachAnswerRevealed(problemId, storage = globalThis.localStorage) {
  const saved = loadApproachResult(problemId, storage);
  if (saved) {
    saveApproachResult(problemId, { ...saved, answerRevealed: true }, storage);
  }
}
