import { CATEGORY_FROM_API } from "../constants/problemOptions.js";
import { request } from "./httpClient.js";

let dailyProblemsRequest = null;

function normalizeDailyProblem(problem) {
  const rawDifficulty = String(problem?.difficulty ?? "LV1").toUpperCase();
  const difficulty = /^[1-5]$/.test(rawDifficulty)
    ? `LV${rawDifficulty}`
    : rawDifficulty;
  const rawCategory = String(problem?.category ?? "").toUpperCase();

  return {
    id: String(problem?.problemId ?? problem?.problem_id ?? ""),
    difficulty,
    category:
      CATEGORY_FROM_API[rawCategory] ?? problem?.category ?? "기타",
    title:
      problem?.problemTitle ?? problem?.problem_title ?? "제목 없는 문제",
    description:
      problem?.problemContent ?? problem?.problem_content ?? "",
    examples: (problem?.examples ?? []).map((example) => ({
      input: example?.input ?? "",
      output: example?.output ?? "",
      description: example?.description ?? "",
      explanation: example?.description ?? "",
    })),
    constraints: [],
    categoryKnown: true,
  };
}

export function getDailyProblems() {
  if (!dailyProblemsRequest) {
    dailyProblemsRequest = request("/daily-problems")
      .then((payload) => {
        const response = payload?.data ?? payload ?? {};
        const dailyProblem =
          response.dailyProblem ?? response.daily_problem ?? [];

        return {
          recommendDate:
            response.recommendDate ?? response.recommend_date ?? null,
          problems: Array.isArray(dailyProblem)
            ? dailyProblem.map(normalizeDailyProblem)
            : [],
        };
      })
      .finally(() => {
        dailyProblemsRequest = null;
      });
  }

  return dailyProblemsRequest;
}
