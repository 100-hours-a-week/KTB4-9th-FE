import assert from "node:assert/strict";
import test from "node:test";
import {
  createMockApproachEvaluation,
  normalizeApproachEvaluation,
} from "../src/features/approach/approachEvaluation.js";

const problem = { category: "Greedy", categoryKnown: false };

test("completed API evaluation keeps each keyword's own match result", () => {
  const evaluation = normalizeApproachEvaluation({
    evaluationStatus: "COMPLETED",
    result: {
      isCorrect: false,
      correctCategory: "GREEDY",
      categorySelectReason: "매 단계에서 최선의 선택을 합니다.",
      totalScore: 50,
      keywords: [
        { keyword: "정렬", isIncluded: true },
        { keyword: "선택 기준", isIncluded: false },
      ],
    },
  }, problem);

  assert.equal(evaluation.categoryCorrect, false);
  assert.equal(evaluation.correctCategory, "Greedy");
  assert.equal(evaluation.categoryReason, "매 단계에서 최선의 선택을 합니다.");
  assert.equal(evaluation.approachScore, 50);
  assert.deepEqual(evaluation.keywords, [
    { keyword: "정렬", matched: true },
    { keyword: "선택 기준", matched: false },
  ]);
});

test("pending API evaluation does not invent AI results", () => {
  assert.deepEqual(normalizeApproachEvaluation({
    evaluationStatus: "PENDING",
    result: { isCorrect: false },
  }, problem), { status: "pending" });
});

test("failed API evaluation is not shown as a permanent pending state", () => {
  assert.deepEqual(normalizeApproachEvaluation({
    evaluationStatus: "FAILED",
  }, problem), { status: "failed" });
});

test("mock evaluation is separate from real API normalization", () => {
  const evaluation = createMockApproachEvaluation(
    problem,
    "Binary Search",
    "정렬한 뒤 선택 기준을 정합니다.",
    ["정렬", "선택 기준", "반례"],
  );

  assert.equal(evaluation.categoryCorrect, false);
  assert.deepEqual(evaluation.keywords.map((item) => item.matched), [true, true, false]);
  assert.equal(evaluation.approachScore, 67);
});
