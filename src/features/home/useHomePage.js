import { useState } from "react";
import { useNavigate } from "react-router";
import { getStoredUser } from "../../services/auth.js";
import { setCurrentProblem } from "../../store.js";

export function useHomePage({ getDailyProblems, getHeatmapData, solvedKey }) {
  const navigate = useNavigate();
  const problems = getDailyProblems();
  const heatmap = getHeatmapData();
  const user = getStoredUser() || {};
  const [solved] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(solvedKey) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [cardIndex, setCardIndex] = useState(0);
  const [heatTip, setHeatTip] = useState(null);
  const solvedCount = problems.filter((problem) => solved.has(problem.id)).length;
  const currentProblem = problems[cardIndex];
  const isSolved = solved.has(currentProblem.id);

  const handleSolve = () => {
    setCurrentProblem(currentProblem);
    navigate("/solve");
  };

  return {
    cardIndex,
    currentProblem,
    handleSolve,
    heatmap,
    heatTip,
    isSolved,
    problems,
    setCardIndex,
    setHeatTip,
    solved,
    solvedCount,
    user,
  };
}
