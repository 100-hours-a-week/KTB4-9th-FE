function dateSeed(date) {
  return date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function getDailySolvedStorageKey(date = new Date()) {
  return `cosmos_solved_${dateSeed(date)}`;
}

export function readDailySolvedProblemIds(
  storage = globalThis.localStorage,
  date = new Date(),
) {
  if (!storage) return new Set();

  try {
    const saved = JSON.parse(storage.getItem(getDailySolvedStorageKey(date)) || "[]");
    return new Set(Array.isArray(saved) ? saved.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markDailyProblemSolved(
  problemId,
  storage = globalThis.localStorage,
  date = new Date(),
) {
  if (problemId == null || !storage) return false;

  const solved = readDailySolvedProblemIds(storage, date);
  const normalizedId = String(problemId);
  const isNew = !solved.has(normalizedId);

  if (isNew) {
    solved.add(normalizedId);
    storage.setItem(
      getDailySolvedStorageKey(date),
      JSON.stringify([...solved]),
    );
  }

  return isNew;
}
