import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getMyActivities } from "../../api/activityApi.js";
import { useAuth } from "../auth/authContext.js";
import { createActivityHeatmap } from "./activityHeatmap.js";
import { setCurrentProblem } from "../../store.js";

export function useHomePage({ getDailyProblems, solvedKey }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const problems = getDailyProblems();
  const [heatmap, setHeatmap] = useState(() => createActivityHeatmap());
  const user = currentUser || {};
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

  useEffect(() => {
    let active = true;

    getMyActivities()
      .then((activities) => {
        if (active) setHeatmap(createActivityHeatmap(activities));
      })
      .catch(() => {
        // 조회 실패 시에도 20주 레이아웃을 유지하고 빈 잔디를 표시합니다.
      });

    return () => {
      active = false;
    };
  }, []);

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
