import { CATEGORY_FROM_API } from "../../constants/problemOptions.js";

const CATEGORY_REASONS = {
  Array: "배열의 원소와 인덱스를 순회하며 필요한 값을 찾는 문제입니다.",
  String: "문자 단위의 비교와 문자열 처리가 핵심인 문제입니다.",
  DP: "작은 문제의 결과를 저장하고 재사용해 전체 문제를 해결합니다.",
  Graph: "정점과 간선의 관계를 탐색하는 접근이 핵심입니다.",
  Tree: "부모와 자식으로 이어진 계층 구조를 탐색해야 합니다.",
  "Stack/Queue": "데이터를 넣고 꺼내는 순서가 풀이의 핵심입니다.",
  "Binary Search": "가능한 범위를 절반씩 줄이며 정답을 찾을 수 있습니다.",
  Greedy: "매 단계에서의 선택 기준을 적용해 답을 구성합니다.",
  Backtracking: "가능한 선택을 탐색하고 조건에 맞지 않으면 되돌아갑니다.",
  "Two Pointer": "두 위치를 이동시키며 조건을 만족하는 값을 찾습니다.",
  Hash: "값을 키로 저장해 빠르게 조회하거나 빈도를 셉니다.",
  Heap: "최솟값이나 최댓값을 반복해서 꺼내는 과정이 중요합니다.",
  Sorting: "정렬 기준에 따라 데이터를 배치한 뒤 처리합니다.",
  구현: "주어진 규칙과 순서를 정확하게 시뮬레이션합니다.",
  완전탐색: "가능한 경우를 빠짐없이 살펴 조건을 검증합니다.",
  Math: "수의 성질과 계산 규칙을 이용하는 문제입니다.",
};

// 화면은 이 형식만 사용합니다. 백엔드 응답 필드가 확정되면 여기만 조정하면 됩니다.
export function normalizeApproachEvaluation(submission, problem) {
  const result = submission?.result;
  if (submission?.evaluationStatus === "FAILED") {
    return { status: "failed" };
  }
  if (submission?.evaluationStatus !== "COMPLETED" || !result) {
    return { status: "pending" };
  }

  const rawKeywords = Array.isArray(result.keywords) ? result.keywords : [];
  const keywords = rawKeywords
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const label = item.keyword ?? item.text;
      if (typeof label !== "string" || !label.trim()) return null;
      return {
        keyword: label,
        matched: item.isIncluded === true || item.matched === true,
      };
    })
    .filter(Boolean);

  const rawCategory = result.correctCategory ?? problem.category;

  return {
    status: "completed",
    categoryCorrect: problem.categoryKnown ? true : result.isCorrect === true,
    correctCategory: CATEGORY_FROM_API[rawCategory] ?? rawCategory,
    categoryReason: result.categoryReason ?? result.categorySelectionReason ?? result.categorySelectReason ?? null,
    approachScore: Number.isFinite(result.approachScore ?? result.totalScore)
      ? result.approachScore ?? result.totalScore
      : null,
    keywords,
    aiFeedback: result.aiFeedback ?? null,
  };
}

export function createMockApproachEvaluation(problem, selectedCategory, approach, keywords) {
  const text = approach.toLocaleLowerCase();
  const evaluatedKeywords = keywords.map((keyword) => ({
    keyword,
    matched: text.includes(keyword.toLocaleLowerCase()),
  }));
  const matchedCount = evaluatedKeywords.filter((item) => item.matched).length;

  return {
    status: "completed",
    categoryCorrect: problem.categoryKnown || selectedCategory === problem.category,
    correctCategory: problem.category,
    categoryReason: CATEGORY_REASONS[problem.category] ?? "이 문제의 자료 구조와 해결 과정을 기준으로 분류했습니다.",
    approachScore: keywords.length ? Math.round((matchedCount / keywords.length) * 100) : 0,
    keywords: evaluatedKeywords,
    aiFeedback: matchedCount
      ? "맞게 짚은 핵심 요소를 바탕으로, 빠진 조건과 예외 상황도 다시 확인해 보세요."
      : "문제의 입력과 목표를 다시 살펴보고 사용할 자료 구조와 처리 순서를 적어 보세요.",
  };
}
