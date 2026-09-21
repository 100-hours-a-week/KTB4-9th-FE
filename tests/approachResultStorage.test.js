import assert from "node:assert/strict";
import test from "node:test";
import {
  loadApproachResult,
  markApproachAnswerRevealed,
  saveApproachResult,
} from "../src/features/approach/approachResultStorage.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("answer reveal is remembered for only its problem", () => {
  const storage = createStorage();
  const result = {
    selectedCategory: "Array",
    categoryKnown: false,
    approach: "배열을 순회합니다.",
    evaluation: { status: "completed", keywords: [] },
    answerRevealed: false,
  };

  saveApproachResult("problem-1", result, storage);
  saveApproachResult("problem-2", result, storage);
  markApproachAnswerRevealed("problem-1", storage);

  assert.equal(loadApproachResult("problem-1", storage).answerRevealed, true);
  assert.equal(loadApproachResult("problem-1", storage).categoryKnown, false);
  assert.equal(loadApproachResult("problem-1", storage).approach, "배열을 순회합니다.");
  assert.equal(loadApproachResult("problem-2", storage).answerRevealed, false);
});

test("a new result for the same problem starts hidden again", () => {
  const storage = createStorage();
  const result = {
    selectedCategory: "Array",
    approach: "첫 제출",
    evaluation: { status: "completed", keywords: [] },
    answerRevealed: true,
  };

  saveApproachResult(1, result, storage);
  saveApproachResult(1, { ...result, approach: "재제출", answerRevealed: false }, storage);

  assert.equal(loadApproachResult(1, storage).answerRevealed, false);
  assert.equal(loadApproachResult(1, storage).approach, "재제출");
});

test("invalid stored data is ignored", () => {
  const storage = createStorage();
  storage.setItem("cosmos_approach_result_v1:1", "not JSON");
  assert.equal(loadApproachResult(1, storage), null);
});
