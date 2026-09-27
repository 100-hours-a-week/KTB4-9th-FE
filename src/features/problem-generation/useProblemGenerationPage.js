import { useState } from "react";
import { useNavigate } from "react-router";
import { createProblem, getApiErrorMessage, USE_MOCKS } from "../../api/problemApi.js";
import { setCurrentProblem } from "../../store.js";

// 오늘 생성 사용 현황(dailyUsage)을 화면에 보여줄 한 줄 문구로 변환
function formatDailyUsageLabel(dailyUsage) {
  // 1. 아직 시도한 적 없으면 고정 안내 문구
  if (!dailyUsage) {
    return "하루에 3번 생성할 수 있어요";
  }
  const { limit, usedCount, remainingCount, resetAt } = dailyUsage;
  // 2. 남은 횟수가 있으면 사용 현황
  if (remainingCount > 0) {
    return `오늘 ${usedCount}/${limit} 사용 · ${remainingCount}회 남음`;
  }
  // 3. 다 썼으면 초기화까지 남은 시간
  return `오늘 생성 횟수를 모두 사용했어요 · ${formatResetIn(resetAt)}`;
}

// resetAt(초기화 시각)까지 남은 시간을 "약 N시간 뒤" 문구로 변환
function formatResetIn(resetAt) {
  if (!resetAt) return "내일 초기화돼요";
  const hours = Math.round((new Date(resetAt).getTime() - Date.now()) / (60 * 60 * 1000));
  return hours > 0 ? `약 ${hours}시간 뒤에 초기화돼요` : "곧 초기화돼요";
}

export function useProblemGenerationPage({ categories, createMockProblem, mockCategories }) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("LV3");
  const [category, setCategory] = useState("랜덤");
  const [stage, setStage] = useState("config");
  const [dots, setDots] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [dailyUsage, setDailyUsage] = useState(null);

  const handleGenerate = async () => {
    setErrorMessage("");
    setStage("loading");
    let nextDots = 0;
    const intervalId = setInterval(() => {
      nextDots = (nextDots + 1) % 4;
      setDots(nextDots);
    }, 400);

    try {
      let problem;
      if (USE_MOCKS) {
        await new Promise((resolve) => setTimeout(resolve, 2600));
        problem = createMockProblem(difficulty, category);
      } else {
        const result = await createProblem({ difficulty, category });
        problem = result.problem;
        setDailyUsage(result.dailyUsage);
      }

      setCurrentProblem(problem);
      setStage("done");
      setTimeout(() => {
        navigate(`/problems/${problem.id}`);
        setStage("config");
      }, 400);
    } catch (error) {
      console.error("문제 생성에 실패했습니다.", error);
      setErrorMessage(getApiErrorMessage(error));
      // 한도 초과 응답에도 사용 현황이 들어 있어서, 그걸로 표시를 갱신
      if (error.code === "daily_problem_limit_exceeded" && error.data) {
        setDailyUsage(error.data);
      }
      setStage("config");
    } finally {
      clearInterval(intervalId);
    }
  };

  return {
    category,
    categoryOptions: USE_MOCKS ? ["랜덤", ...mockCategories] : categories,
    dailyUsageLabel: formatDailyUsageLabel(dailyUsage),
    difficulty,
    dots,
    errorMessage,
    handleGenerate,
    setCategory,
    setDifficulty,
    stage,
  };
}
