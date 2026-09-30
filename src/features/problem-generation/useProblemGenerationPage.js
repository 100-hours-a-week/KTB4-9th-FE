import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { createProblem, getApiErrorMessage, getDailyUsage, USE_MOCKS } from "../../api/problemApi.js";
import { setCurrentProblem } from "../../store.js";

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

  // 화면에 들어오면 오늘 사용 현황을 조회 (실패해도 화면은 그대로 사용)
  useEffect(() => {
    if (USE_MOCKS) return undefined;

    let active = true;
    getDailyUsage()
      .then((usage) => {
        if (active) setDailyUsage(usage);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

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
    dailyLimit: dailyUsage?.limit ?? 3,
    limitReached: !!dailyUsage && dailyUsage.remainingCount <= 0,
    limitNotice: dailyUsage && dailyUsage.remainingCount <= 0
      ? `오늘 생성 횟수를 모두 사용했어요 · ${formatResetIn(dailyUsage.resetAt)}`
      : null,
    usageCount: dailyUsage ? `${dailyUsage.usedCount}/${dailyUsage.limit}` : null,
    difficulty,
    dots,
    errorMessage,
    handleGenerate,
    setCategory,
    setDifficulty,
    stage,
  };
}
