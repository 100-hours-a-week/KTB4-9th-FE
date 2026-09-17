const CURRENT_PROBLEM_KEY = "cosmos_current_problem";

export function setCurrentProblem(problem) {
  localStorage.setItem(CURRENT_PROBLEM_KEY, JSON.stringify(problem));
}

export function getCurrentProblem() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_PROBLEM_KEY) || "null");
  } catch {
    return null;
  }
}
