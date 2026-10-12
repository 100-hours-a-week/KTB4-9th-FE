const STORAGE_KEY = "cosmos_saved_problems_v1";

// 저장된 문제 목록을 최근 저장순으로 꺼냄
export function loadSavedProblems(storage = globalThis.localStorage) {
  if (!storage) return [];

  try {
    const list = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function isProblemSaved(problemId, storage = globalThis.localStorage) {
  return loadSavedProblems(storage).some((item) => String(item.id) === String(problemId));
}

function writeSavedProblems(list, storage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 저장 공간이 비활성화되면 저장되지 않고 현재 상태만 유지됩니다.
  }
}

// 저장하거나 해제하고, 바뀐 뒤의 저장 여부를 돌려줌
export function toggleSavedProblem(problem, storage = globalThis.localStorage) {
  if (!problem?.id || !storage) return false;

  const list = loadSavedProblems(storage);
  const exists = list.some((item) => String(item.id) === String(problem.id));

  if (exists) {
    writeSavedProblems(list.filter((item) => String(item.id) !== String(problem.id)), storage);
    return false;
  }

  // 목록 카드에 필요한 정보만 저장 (본문은 문제를 열 때 다시 불러옴)
  const entry = {
    id: String(problem.id),
    title: problem.title,
    difficulty: problem.difficulty,
    category: problem.category,
    description: problem.description,
    savedAt: new Date().toISOString(),
  };
  writeSavedProblems([entry, ...list], storage);
  return true;
}
