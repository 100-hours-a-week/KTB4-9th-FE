import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getMyActivities } from "../../api/activityApi.js";
import { getDailyProblems } from "../../api/dailyProblemApi.js";
import { useAuth } from "../auth/authContext.js";
import { createActivityHeatmap } from "./activityHeatmap.js";
import { setCurrentProblem } from "../../store.js";

export function useHomePage({ solvedKey }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [problems, setProblems] = useState([]);
  const [recommendDate, setRecommendDate] = useState(null);
  const [dailyProblemsLoading, setDailyProblemsLoading] = useState(true);
  const [dailyProblemsError, setDailyProblemsError] = useState(false);
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
  const currentProblem = problems[cardIndex] ?? null;
  const isSolved = currentProblem ? solved.has(currentProblem.id) : false;

  useEffect(() => {
    let active = true;

    getDailyProblems()
      .then(({ problems: nextProblems, recommendDate: nextRecommendDate }) => {
        if (!active) return;
        setProblems(nextProblems);
        setRecommendDate(nextRecommendDate);
        setCardIndex(0);
        setDailyProblemsError(false);
      })
      .catch(() => {
        if (active) setDailyProblemsError(true);
      })
      .finally(() => {
        if (active) setDailyProblemsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
    if (!currentProblem) return;
    setCurrentProblem(currentProblem);
    navigate(`/problems/${currentProblem.id}`);
  };

  return {
    cardIndex,
    currentProblem,
    dailyProblemsError,
    dailyProblemsLoading,
    handleSolve,
    heatmap,
    heatTip,
    isSolved,
    problems,
    recommendDate,
    setCardIndex,
    setHeatTip,
    solved,
    solvedCount,
    user,
  };
}
