import { useEffect, useRef, useState } from "react";

export function useBattlePage({ getBattleWindow, getDailyProblem, getMockBoard }) {
  const [problem] = useState(() => getDailyProblem());
  const [battleWindow] = useState(() => getBattleWindow());
  const { start } = battleWindow;
  const [state, setState] = useState("active");
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [answers, setAnswers] = useState(problem.testCases.map(() => ""));
  const [userTime, setUserTime] = useState(null);
  const [board, setBoard] = useState([]);
  const [gradingDots, setGradingDots] = useState(0);
  const [pendingLeft, setPendingLeft] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (state !== "waiting") return undefined;
    const updateCountdown = () => {
      const left = start.getTime() - Date.now();
      if (left <= 0) {
        sessionStorage.removeItem("battle_preview");
        setState("active");
        setCountdown(0);
      } else {
        setCountdown(left);
      }
    };
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [state, start]);

  useEffect(() => {
    if (state !== "active") return undefined;
    const base = Date.now();
    const intervalId = setInterval(() => {
      const nextElapsed = Math.floor((Date.now() - base) / 1000);
      elapsedRef.current = nextElapsed;
      setElapsed(nextElapsed);
      if (nextElapsed >= 600) {
        clearInterval(intervalId);
        setUserTime(nextElapsed);
        setBoard(getMockBoard(nextElapsed));
        setPendingLeft(0);
        setState("ended");
        sessionStorage.removeItem("battle_preview");
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [getMockBoard, state]);

  useEffect(() => {
    if (state !== "submitted") return undefined;
    let nextDots = 0;
    const intervalId = setInterval(() => {
      nextDots = (nextDots + 1) % 4;
      setGradingDots(nextDots);
    }, 350);
    return () => clearInterval(intervalId);
  }, [state]);

  useEffect(() => {
    if (state !== "pending") return undefined;
    const intervalId = setInterval(() => {
      setPendingLeft((seconds) => {
        if (seconds <= 1) {
          clearInterval(intervalId);
          setState("ended");
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [state]);

  const finishBattle = (time) => {
    const remaining = Math.max(0, 600 - time);
    setUserTime(time);
    setBoard(getMockBoard(time));
    setPendingLeft(remaining);
    setState(remaining > 0 ? "pending" : "ended");
    sessionStorage.removeItem("battle_preview");
  };

  const handleAnswerChange = (index, value) => {
    if (state === "submitted") return;
    setAnswers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (state !== "active") return;
    setState("submitted");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    finishBattle(elapsedRef.current);
  };

  const handleForfeit = () => {
    if (state !== "active") return;
    finishBattle(elapsedRef.current);
  };

  return {
    answers,
    board,
    countdown,
    elapsed,
    gradingDots,
    handleAnswerChange,
    handleForfeit,
    handleSubmit,
    pendingLeft,
    problem,
    start,
    state,
    userTime,
  };
}
