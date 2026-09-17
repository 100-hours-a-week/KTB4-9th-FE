import { useState } from "react";
import { useNavigate } from "react-router";
import { createProblem, USE_MOCKS } from "../../api/problemApi.js";
import { setCurrentProblem } from "../../store.js";

export function useProblemGenerationPage({ categories, createMockProblem, mockCategories }) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("LV3");
  const [category, setCategory] = useState("랜덤");
  const [stage, setStage] = useState("config");
  const [dots, setDots] = useState(0);

  const handleGenerate = async () => {
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
      }

      setCurrentProblem(problem);
      setStage("done");
      setTimeout(() => {
        navigate(`/problems/${problem.id}`);
        setStage("config");
      }, 400);
    } catch (error) {
      console.error("문제 생성에 실패했습니다.", error);
      setStage("config");
    } finally {
      clearInterval(intervalId);
    }
  };

  return {
    category,
    categoryOptions: USE_MOCKS ? ["랜덤", ...mockCategories] : categories,
    difficulty,
    dots,
    handleGenerate,
    setCategory,
    setDifficulty,
    stage,
  };
}
