import assert from "node:assert/strict";
import test from "node:test";
import {
  getDailySolvedStorageKey,
  markDailyProblemSolved,
  readDailySolvedProblemIds,
} from "../src/features/home/dailyProgress.js";

function createStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
  };
}

test("daily solved ids use a local-date storage key", () => {
  assert.equal(
    getDailySolvedStorageKey(new Date(2026, 8, 29)),
    "cosmos_solved_20260929",
  );
});

test("marking a daily problem stores it once", () => {
  const storage = createStorage();
  const date = new Date(2026, 8, 29);

  assert.equal(markDailyProblemSolved(7, storage, date), true);
  assert.equal(markDailyProblemSolved("7", storage, date), false);
  assert.deepEqual([...readDailySolvedProblemIds(storage, date)], ["7"]);
});

test("invalid saved progress is treated as empty", () => {
  const storage = createStorage();
  const date = new Date(2026, 8, 29);
  storage.setItem(getDailySolvedStorageKey(date), "not-json");

  assert.deepEqual([...readDailySolvedProblemIds(storage, date)], []);
});
