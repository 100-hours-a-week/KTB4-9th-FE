import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  dropOutDailyBattle,
  getCurrentDailyBattle,
  getDailyBattleResult,
  participateDailyBattle,
  submitDailyBattle,
} from "../../api/dailyBattleApi.js";

const RESULT_POLL_MS = 1000;
const MAX_RESULT_FAILURES = 3;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const joinRequests = new Map();

function getBattleOpenTime(serverTime) {
  const koreanTime = new Date(serverTime.getTime() + KST_OFFSET_MS);
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const date = String(koreanTime.getUTCDate()).padStart(2, "0");
  return new Date(`${year}-${month}-${date}T12:50:00+09:00`);
}

function getBattleCountdownStartTime(serverTime) {
  const koreanTime = new Date(serverTime.getTime() + KST_OFFSET_MS);
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const date = String(koreanTime.getUTCDate()).padStart(2, "0");
  return new Date(`${year}-${month}-${date}T12:30:00+09:00`);
}

function getSubmissionDeadline(serverTime) {
  const koreanTime = new Date(serverTime.getTime() + KST_OFFSET_MS);
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const date = String(koreanTime.getUTCDate()).padStart(2, "0");
  return new Date(`${year}-${month}-${date}T12:59:59+09:00`);
}

function getResultAvailableAt(serverTime) {
  const koreanTime = new Date(serverTime.getTime() + KST_OFFSET_MS);
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const date = String(koreanTime.getUTCDate()).padStart(2, "0");
  return new Date(`${year}-${month}-${date}T13:00:00+09:00`);
}

function getRemainingSeconds(deadline, clockOffset) {
  if (!(deadline instanceof Date) || Number.isNaN(deadline.getTime())) return 0;
  const serverNow = Date.now() + clockOffset;
  return Math.max(0, Math.ceil((deadline.getTime() - serverNow) / 1000));
}

function getInitialPhase() {
  const resultAvailableAt = getResultAvailableAt(new Date());
  return getRemainingSeconds(resultAvailableAt, 0) === 0 ? "result-loading" : "loading";
}

function joinOnce(battleId) {
  if (!joinRequests.has(battleId)) {
    // 동시에 발생한 참여 요청만 합치고, 완료된 응답은 캐시하지 않는다.
    // 그래야 재진입 시 서버의 최신 참여 상태를 다시 확인할 수 있다.
    const request = participateDailyBattle(battleId)
      .finally(() => joinRequests.delete(battleId));
    joinRequests.set(battleId, request);
  }
  return joinRequests.get(battleId);
}

function messageForError(error) {
  if (error?.status === 403) return "배틀에 접근할 수 없습니다.";
  if (error?.status === 404) return "오늘의 배틀 또는 참여 기록을 찾을 수 없습니다.";
  if (error?.status === 409) return "이미 제출한 배틀입니다. 결과를 확인하고 있어요.";
  if (error?.status >= 500) return "배틀 서버가 잠시 불안정합니다. 잠시 후 다시 시도해 주세요.";
  return "배틀 정보를 불러오지 못했습니다.";
}

function accessIssueForError(error) {
  if (error?.status === 400) {
    return {
      title: "올바르지 않은 배틀 주소입니다",
      description: "주소를 다시 확인하거나 배틀 메뉴에서 오늘의 배틀을 확인해 주세요.",
    };
  }
  if (error?.status === 403) {
    return {
      title: "배틀 참여 시간이 아닙니다",
      description: "데일리 배틀은 매일 낮 12시 50분부터 12시 59분 59초까지 참여할 수 있어요.",
    };
  }
  if (error?.status === 404) {
    return {
      title: "참여할 수 없는 배틀입니다",
      description: "존재하지 않거나 이미 종료된 배틀이에요. 오늘의 배틀 일정을 확인해 주세요.",
    };
  }
  return null;
}

export function formatBattleTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  if (days > 0) return `${days}일 ${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (safe >= 3600) return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useDailyBattlePage() {
  const [phase, setPhase] = useState(getInitialPhase);
  const [battle, setBattle] = useState(null);
  const [battleId, setBattleId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [untilOpenSeconds, setUntilOpenSeconds] = useState(0);
  const [nextOpenAt, setNextOpenAt] = useState(null);
  const [viewingPreviousResult, setViewingPreviousResult] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [accessIssue, setAccessIssue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [droppingOut, setDroppingOut] = useState(false);
  const pollTimerRef = useRef(null);
  const pollFailuresRef = useRef(0);
  const mountedRef = useRef(true);
  const clockOffsetRef = useRef(0);
  const submissionDeadlineRef = useRef(null);
  const resultAvailableAtRef = useRef(null);

  const stopPolling = useCallback(() => {
    clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }, []);

  const pollResult = useCallback(async function poll(id) {
    stopPolling();

    // 제출은 12:59:59에 닫지만 결과는 13:00부터 조회한다.
    const secondsUntilResult = getRemainingSeconds(resultAvailableAtRef.current, clockOffsetRef.current);
    if (secondsUntilResult > 0) {
      setRemainingSeconds(secondsUntilResult);
      setPhase("result-pending");
      return;
    }

    try {
      const response = await getDailyBattleResult(id);
      if (!mountedRef.current) return;

      if (response.pending) {
        pollFailuresRef.current = 0;
        // 결과 공개 시각 이후에는 참여 확인/채점 화면으로 되돌아가지 않고
        // 하나의 결과 로딩 화면을 유지한다.
        setPhase("result-loading");
        pollTimerRef.current = setTimeout(() => poll(id), RESULT_POLL_MS);
        return;
      }

      setResult(response.result);
      setPhase("result");
      setErrorMessage("");
    } catch (error) {
      if (!mountedRef.current) return;
      pollFailuresRef.current += 1;
      if (error?.status >= 500 && pollFailuresRef.current < MAX_RESULT_FAILURES) {
        pollTimerRef.current = setTimeout(() => poll(id), RESULT_POLL_MS);
        return;
      }
      setErrorMessage(messageForError(error));
      setPhase("result-error");
    }
  }, [stopPolling]);

  const waitUntilDeadlineOrPoll = useCallback((id) => {
    const seconds = getRemainingSeconds(resultAvailableAtRef.current, clockOffsetRef.current);
    setRemainingSeconds(seconds);

    // 마감 전에는 참여 상태만으로 대기 화면을 보여주고 결과 API를 호출하지 않는다.
    if (seconds > 0) {
      setPhase("result-pending");
      return;
    }

    setPhase("result-loading");
    pollResult(id);
  }, [pollResult]);

  const enterBattle = useCallback(async (id) => {
    setBattleId(id);
    setErrorMessage("");
    setAccessIssue(null);
    try {
      const participation = await joinOnce(id);
      if (!mountedRef.current) return;
      setBattle(participation);
      if (!submissionDeadlineRef.current && participation.battleDate) {
        submissionDeadlineRef.current = new Date(`${participation.battleDate}T12:59:59+09:00`);
      }
      if (!resultAvailableAtRef.current && participation.battleDate) {
        resultAvailableAtRef.current = new Date(`${participation.battleDate}T13:00:00+09:00`);
      }
      const submissionSeconds = getRemainingSeconds(submissionDeadlineRef.current, clockOffsetRef.current);
      setRemainingSeconds(submissionSeconds);
      setAnswers(Object.fromEntries(participation.cases.map((item) => [item.displayOrder, ""])));

      if (participation.participationStatus === "IN_PROGRESS" && submissionSeconds > 0) {
        setPhase("in-progress");
      } else {
        waitUntilDeadlineOrPoll(id);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      if (error?.status === 409) {
        waitUntilDeadlineOrPoll(id);
        return;
      }
      const issue = accessIssueForError(error);
      if (issue) {
        setAccessIssue(issue);
        setPhase("access-denied");
        return;
      }
      setErrorMessage(messageForError(error));
      setPhase("error");
    }
  }, [waitUntilDeadlineOrPoll]);

  const load = useCallback(async () => {
    stopPolling();
    setPhase(getInitialPhase());
    setErrorMessage("");
    setAccessIssue(null);
    try {
      const current = await getCurrentDailyBattle();
      if (!mountedRef.current) return;
      clockOffsetRef.current = current.serverTime.getTime() - Date.now();

      const opensAt = getBattleOpenTime(current.serverTime);
      const countdownStartsAt = getBattleCountdownStartTime(current.serverTime);
      const submissionDeadline = getSubmissionDeadline(current.serverTime);
      const resultAvailableAt = getResultAvailableAt(current.serverTime);
      const serverNow = current.serverTime.getTime();

      submissionDeadlineRef.current = submissionDeadline;
      resultAvailableAtRef.current = resultAvailableAt;
      // 12:30부터는 이전 결과 대신 오늘 배틀 시작 카운트다운을 보여준다.
      if (serverNow < opensAt.getTime()) {
        const secondsUntilOpen = Math.max(0, Math.ceil((opensAt.getTime() - serverNow) / 1000));
        setUntilOpenSeconds(secondsUntilOpen);

        if (serverNow >= countdownStartsAt.getTime()) {
          setNextOpenAt(opensAt);
          setViewingPreviousResult(false);
          setPhase("waiting");
        } else if (current.latestResultBattleId) {
          setNextOpenAt(countdownStartsAt);
          setViewingPreviousResult(true);
          setBattleId(current.latestResultBattleId);
          resultAvailableAtRef.current = new Date(0);
          setPhase("result-loading");
          pollResult(current.latestResultBattleId);
        } else {
          setNextOpenAt(opensAt);
          setViewingPreviousResult(false);
          setPhase("waiting");
        }
        return;
      }

      setViewingPreviousResult(false);

      // 12:50부터 제출 마감 전까지는 오늘 배틀에 참여한다.
      if (serverNow < submissionDeadline.getTime()) {
        if (current.currentBattleId) {
          await enterBattle(current.currentBattleId);
        } else {
          setPhase("no-battle");
        }
        return;
      }

      // 12:59:59부터 13:00까지는 제출을 막고 오늘 결과 공개를 기다린다.
      if (serverNow < resultAvailableAt.getTime()) {
        if (current.currentBattleId) {
          setBattleId(current.currentBattleId);
          waitUntilDeadlineOrPoll(current.currentBattleId);
        } else {
          setPhase("no-battle");
        }
        return;
      }

      // 13:00 이후에는 오늘 결과를, 오늘 배틀이 없다면 가장 최근 결과를 보여준다.
      const resultBattleId = current.currentBattleId ?? current.latestResultBattleId;
      setNextOpenAt(new Date(countdownStartsAt.getTime() + DAY_MS));
      setViewingPreviousResult(true);
      if (resultBattleId) {
        setBattleId(resultBattleId);
        setPhase("result-loading");
        pollResult(resultBattleId);
      } else {
        setPhase("closed");
      }
    } catch (error) {
      if (!mountedRef.current) return;
      setErrorMessage(messageForError(error));
      setPhase("error");
    }
  }, [enterBattle, pollResult, stopPolling, waitUntilDeadlineOrPoll]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [load, stopPolling]);

  useEffect(() => {
    if (phase !== "in-progress" && phase !== "result-pending") return undefined;
    let deadlineHandled = false;

    const updateTimer = () => {
      const targetTime = phase === "in-progress"
        ? submissionDeadlineRef.current
        : resultAvailableAtRef.current;
      const seconds = getRemainingSeconds(targetTime, clockOffsetRef.current);
      setRemainingSeconds(seconds);
      if (seconds === 0 && !deadlineHandled) {
        deadlineHandled = true;
        if (phase === "in-progress") {
          if (battleId) waitUntilDeadlineOrPoll(battleId);
          return;
        }
        if (battleId) pollResult(battleId);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [battleId, phase, pollResult, waitUntilDeadlineOrPoll]);

  useEffect(() => {
    if ((!viewingPreviousResult && phase !== "waiting") || !nextOpenAt) return undefined;
    const update = () => {
      const serverNow = Date.now() + clockOffsetRef.current;
      const seconds = Math.max(0, Math.ceil((nextOpenAt.getTime() - serverNow) / 1000));
      setUntilOpenSeconds(seconds);
      if (seconds === 0) load();
    };
    const timer = setInterval(update, 1000);
    update();
    return () => clearInterval(timer);
  }, [load, nextOpenAt, phase, viewingPreviousResult]);

  useEffect(() => {
    if (phase !== "no-battle") return undefined;
    const timer = setTimeout(load, 2000);
    return () => clearTimeout(timer);
  }, [load, phase]);

  const updateAnswer = useCallback((displayOrder, value) => {
    setAnswers((current) => ({ ...current, [displayOrder]: value }));
  }, []);

  const answerList = useMemo(
    () => (battle?.cases ?? []).map((item) => ({
      displayOrder: item.displayOrder,
      value: answers[item.displayOrder] ?? "",
    })),
    [answers, battle],
  );
  const canSubmit = answerList.length === 3 && answerList.every((answer) => answer.value.trim()) && remainingSeconds > 0 && !submitting && !droppingOut;

  const submit = useCallback(async () => {
    if (!battleId || !canSubmit) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      await submitDailyBattle(battleId, answerList);
      if (!mountedRef.current) return;
      waitUntilDeadlineOrPoll(battleId);
    } catch (error) {
      if (!mountedRef.current) return;
      if (error?.status === 409) {
        waitUntilDeadlineOrPoll(battleId);
      } else if (!error?.status || error.status >= 500) {
        // 응답을 놓쳤더라도 서버에는 제출됐을 수 있으므로 곧바로 재제출하지 않고 참여 상태부터 확인한다.
        try {
          const participation = await participateDailyBattle(battleId);
          if (!mountedRef.current) return;
          if (participation.participationStatus === "IN_PROGRESS") {
            setErrorMessage("제출이 완료되지 않았습니다. 답안을 확인한 뒤 다시 제출해 주세요.");
          } else {
            waitUntilDeadlineOrPoll(battleId);
          }
        } catch (verificationError) {
          if (!mountedRef.current) return;
          if (verificationError?.status === 409) {
            waitUntilDeadlineOrPoll(battleId);
          } else {
            setErrorMessage("제출 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          }
        }
      } else {
        setErrorMessage(messageForError(error));
      }
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [answerList, battleId, canSubmit, waitUntilDeadlineOrPoll]);

  const dropOut = useCallback(async () => {
    if (!battleId || phase !== "in-progress" || droppingOut || submitting) return;
    setDroppingOut(true);
    setErrorMessage("");
    try {
      await dropOutDailyBattle(battleId);
      if (!mountedRef.current) return;
      waitUntilDeadlineOrPoll(battleId);
    } catch (error) {
      if (!mountedRef.current) return;
      setErrorMessage(error?.status === 409
        ? "이미 제출되었거나 종료된 배틀은 포기할 수 없습니다."
        : messageForError(error));
    } finally {
      if (mountedRef.current) setDroppingOut(false);
    }
  }, [battleId, droppingOut, phase, submitting, waitUntilDeadlineOrPoll]);

  const retryResult = useCallback(() => {
    if (!battleId) return load();
    pollFailuresRef.current = 0;
    setErrorMessage("");
    return waitUntilDeadlineOrPoll(battleId);
  }, [battleId, load, waitUntilDeadlineOrPoll]);

  return {
    accessIssue,
    answers,
    battle,
    canSubmit,
    droppingOut,
    errorMessage,
    phase,
    remainingSeconds,
    result,
    submitting,
    untilOpenSeconds,
    load,
    dropOut,
    retryResult,
    submit,
    updateAnswer,
  };
}
