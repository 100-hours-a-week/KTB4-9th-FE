import assert from "node:assert/strict";
import test from "node:test";
import {
  createMockApproachEvaluation,
  isActiveTaskStatus,
  normalizeApproachEvaluation,
  normalizeEvaluationTask,
  toUsage,
} from "../src/features/approach/approachEvaluation.js";

const problem = { category: "Greedy", categoryKnown: false };
const usage = { limit: 5, usedCount: 0, remainingCount: 5 };

test("active evaluation task statuses are shown as pending with their step and usage", () => {
  for (const status of ["PENDING", "PROCESSING", "RETRY_WAIT"]) {
    assert.deepEqual(normalizeEvaluationTask({ status, submissionUsage: usage }, problem), {
      status: "pending",
      taskStatus: status,
      usage,
    });
  }
});

test("accepted submission without usage still becomes pending", () => {
  assert.deepEqual(normalizeEvaluationTask({ status: "PENDING" }, problem), {
    status: "pending",
    taskStatus: "PENDING",
    usage: null,
  });
});

test("failed evaluation task is shown as failed", () => {
  assert.deepEqual(normalizeEvaluationTask({ status: "FAILED", failure: { code: "AI_SERVER_UNAVAILABLE" } }, problem), {
    status: "failed",
  });
});

test("succeeded evaluation task becomes a completed result with its usage", () => {
  const evaluation = normalizeEvaluationTask({
    status: "SUCCEEDED",
    result: {
      isCorrect: true,
      approachScore: 80,
      keywords: [{ keyword: "점화식", isIncluded: true }],
      aiFeedback: "좋은 접근이에요",
      correctCategory: "GREEDY",
    },
    submissionUsage: { limit: 5, usedCount: 1, remainingCount: 4 },
  }, problem);

  assert.equal(evaluation.status, "completed");
  assert.equal(evaluation.approachScore, 80);
  assert.equal(evaluation.aiFeedback, "좋은 접근이에요");
  assert.deepEqual(evaluation.keywords, [{ keyword: "점화식", matched: true }]);
  assert.deepEqual(evaluation.usage, { limit: 5, usedCount: 1, remainingCount: 4 });
});

test("succeeded task without a result is not shown as a completed result", () => {
  assert.equal(normalizeEvaluationTask({ status: "SUCCEEDED", result: null }, problem).status, "pending");
});

test("only waiting, processing and retry-wait are active task statuses", () => {
  assert.equal(isActiveTaskStatus("PROCESSING"), true);
  assert.equal(isActiveTaskStatus("SUCCEEDED"), false);
  assert.equal(isActiveTaskStatus("FAILED"), false);
  assert.equal(isActiveTaskStatus(undefined), false);
});

test("usage is derived only from valid numbers", () => {
  assert.deepEqual(toUsage({ limit: 5, usedCount: 2 }), { limit: 5, usedCount: 2, remainingCount: 3 });
  assert.equal(toUsage(null), null);
  assert.equal(toUsage({ limit: "5" }), null);
});

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
