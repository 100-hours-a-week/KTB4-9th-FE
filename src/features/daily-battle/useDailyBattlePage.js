import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBattleAlarmStatus } from "../../api/battleAlarmApi.js";
import {
  dropOutDailyBattle,
  getDailyBattleResult,
  participateDailyBattle,
  submitDailyBattle,
} from "../../api/dailyBattleApi.js";

const RESULT_POLL_MS = 1000;
const MAX_RESULT_FAILURES = 3;
const STORAGE_KEY = "cosmos:last-daily-battle";
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
// 첫 데일리 배틀 공개 시각. 이 시각 이후에는 평소의 서버 상태 흐름만 사용한다.
const FIRST_BATTLE_OPENS_AT = new Date("2026-10-19T13:20:00+09:00");
const joinRequests = new Map();

function getSubmissionDeadline(serverTime) {
  const koreanTime = new Date(serverTime.getTime() + KST_OFFSET_MS);
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const date = String(koreanTime.getUTCDate()).padStart(2, "0");
  return new Date(`${year}-${month}-${date}T16:00:00+09:00`);
}

function getRemainingSeconds(deadline, clockOffset) {
  if (!(deadline instanceof Date) || Number.isNaN(deadline.getTime())) return 0;
  const serverNow = Date.now() + clockOffset;
  return Math.max(0, Math.ceil((deadline.getTime() - serverNow) / 1000));
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

function rememberBattle(battleId, battleDate = null) {
  if (typeof window === "undefined" || !Number.isFinite(Number(battleId))) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ battleId: Number(battleId), battleDate }));
}

function readRememberedBattle() {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    return Number.isFinite(Number(saved?.battleId)) ? Number(saved.battleId) : null;
  } catch {
    return null;
  }
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
      description: "현재 테스트 배틀은 오후 1시 20분부터 4시까지 참여할 수 있어요.",
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
  const [phase, setPhase] = useState("loading");
  const [alarm, setAlarm] = useState(null);
  const [battle, setBattle] = useState(null);
  const [battleId, setBattleId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [untilOpenSeconds, setUntilOpenSeconds] = useState(0);
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

  const stopPolling = useCallback(() => {
    clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }, []);

  const pollResult = useCallback(async function poll(id, pendingPhase = "result-pending") {
    stopPolling();
    try {
      const response = await getDailyBattleResult(id);
      if (!mountedRef.current) return;

      if (response.pending) {
        pollFailuresRef.current = 0;
        setPhase(pendingPhase);
        pollTimerRef.current = setTimeout(() => poll(id, pendingPhase), RESULT_POLL_MS);
        return;
      }

      // 배틀 마감 전에는 서버 응답 여부와 관계없이 결과를 공개하지 않는다.
      if (getRemainingSeconds(submissionDeadlineRef.current, clockOffsetRef.current) > 0) {
        pollFailuresRef.current = 0;
        setPhase(pendingPhase);
        pollTimerRef.current = setTimeout(() => poll(id, pendingPhase), RESULT_POLL_MS);
        return;
      }

      setResult(response.result);
      setPhase("result");
      setErrorMessage("");
    } catch (error) {
      if (!mountedRef.current) return;
      pollFailuresRef.current += 1;
      if (error?.status >= 500 && pollFailuresRef.current < MAX_RESULT_FAILURES) {
        pollTimerRef.current = setTimeout(() => poll(id, pendingPhase), RESULT_POLL_MS);
        return;
      }
      setErrorMessage(messageForError(error));
      setPhase("result-error");
    }
  }, [stopPolling]);

  const enterBattle = useCallback(async (id) => {
    setBattleId(id);
    rememberBattle(id);
    setErrorMessage("");
    setAccessIssue(null);
    try {
      const participation = await joinOnce(id);
      if (!mountedRef.current) return;
      rememberBattle(id, participation.battleDate);
      setBattle(participation);
      if (!submissionDeadlineRef.current && participation.battleDate) {
        submissionDeadlineRef.current = new Date(`${participation.battleDate}T16:00:00+09:00`);
      }
      setRemainingSeconds(getRemainingSeconds(submissionDeadlineRef.current, clockOffsetRef.current));
      setAnswers(Object.fromEntries(participation.cases.map((item) => [item.displayOrder, ""])));

      if (participation.participationStatus === "IN_PROGRESS") {
        setPhase("in-progress");
      } else if (participation.participationStatus === "DROPPED_OUT") {
        setPhase("dropped-out");
        pollResult(id, "dropped-out");
      } else if (participation.participationStatus === "TIME_OVER") {
        setPhase("time-over");
        pollResult(id, "time-over");
      } else {
        setPhase("result-pending");
        pollResult(id);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      if (error?.status === 409) {
        setPhase("result-pending");
        pollResult(id);
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
  }, [pollResult]);

  const load = useCallback(async () => {
    stopPolling();
    setPhase("loading");
    setErrorMessage("");
    setAccessIssue(null);
    try {
      const nextAlarm = await getBattleAlarmStatus();
      if (!mountedRef.current) return;
      clockOffsetRef.current = nextAlarm.serverTime.getTime() - Date.now();
      setAlarm(nextAlarm);

      // 정식 오픈 전에는 오늘 상태(CLOSED 등)와 무관하게 출시 예고 화면을 우선 표시한다.
      if (nextAlarm.serverTime.getTime() < FIRST_BATTLE_OPENS_AT.getTime()) {
        const serverNow = Date.now() + clockOffsetRef.current;
        setAlarm({ ...nextAlarm, opensAt: FIRST_BATTLE_OPENS_AT });
        setUntilOpenSeconds(Math.max(0, Math.ceil((FIRST_BATTLE_OPENS_AT.getTime() - serverNow) / 1000)));
        setPhase("launch-waiting");
        return;
      }

      if (nextAlarm.status === "OPEN" && nextAlarm.battleId) {
        submissionDeadlineRef.current = getSubmissionDeadline(nextAlarm.serverTime);
        await enterBattle(nextAlarm.battleId);
        return;
      }

      if (nextAlarm.status === "CLOSED") {
        const rememberedBattleId = readRememberedBattle();
        if (rememberedBattleId) {
          setBattleId(rememberedBattleId);
          setPhase("result-pending");
          pollResult(rememberedBattleId);
        } else {
          setPhase("closed");
        }
        return;
      }

      if (nextAlarm.status === "NO_BATTLE") {
        setPhase("no-battle");
      } else {
        const serverNow = Date.now() + clockOffsetRef.current;
        setUntilOpenSeconds(Math.max(0, Math.ceil((nextAlarm.opensAt.getTime() - serverNow) / 1000)));
        setPhase("waiting");
      }
    } catch (error) {
      if (!mountedRef.current) return;
      if (Date.now() < FIRST_BATTLE_OPENS_AT.getTime()) {
        clockOffsetRef.current = 0;
        setAlarm({ opensAt: FIRST_BATTLE_OPENS_AT, status: "LAUNCH_WAITING" });
        setUntilOpenSeconds(Math.max(0, Math.ceil((FIRST_BATTLE_OPENS_AT.getTime() - Date.now()) / 1000)));
        setPhase("launch-waiting");
        return;
      }
      setErrorMessage(messageForError(error));
      setPhase("error");
    }
  }, [enterBattle, pollResult, stopPolling]);

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
      const seconds = getRemainingSeconds(submissionDeadlineRef.current, clockOffsetRef.current);
      setRemainingSeconds(seconds);
      if (seconds === 0 && !deadlineHandled) {
        deadlineHandled = true;
        if (phase === "in-progress") {
          setPhase("time-over");
          if (battleId) pollResult(battleId, "time-over");
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [battleId, phase, pollResult]);

  useEffect(() => {
    if ((phase !== "waiting" && phase !== "launch-waiting") || !alarm?.opensAt) return undefined;
    const update = () => {
      const serverNow = Date.now() + clockOffsetRef.current;
      const seconds = Math.max(0, Math.ceil((alarm.opensAt.getTime() - serverNow) / 1000));
      setUntilOpenSeconds(seconds);
      if (seconds === 0) load();
    };
    const timer = setInterval(update, 1000);
    update();
    return () => clearInterval(timer);
  }, [alarm, load, phase]);

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
      setPhase("result-pending");
      pollResult(battleId);
    } catch (error) {
      if (!mountedRef.current) return;
      if (error?.status === 409) {
        setPhase("result-pending");
        pollResult(battleId);
      } else if (!error?.status || error.status >= 500) {
        // 응답을 놓쳤더라도 서버에는 제출됐을 수 있으므로 곧바로 재제출하지 않고 참여 상태부터 확인한다.
        try {
          const participation = await participateDailyBattle(battleId);
          if (!mountedRef.current) return;
          if (participation.participationStatus === "IN_PROGRESS") {
            setErrorMessage("제출이 완료되지 않았습니다. 답안을 확인한 뒤 다시 제출해 주세요.");
          } else {
            setPhase("result-pending");
            pollResult(battleId);
          }
        } catch (verificationError) {
          if (!mountedRef.current) return;
          if (verificationError?.status === 409) {
            setPhase("result-pending");
            pollResult(battleId);
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
  }, [answerList, battleId, canSubmit, pollResult]);

  const dropOut = useCallback(async () => {
    if (!battleId || phase !== "in-progress" || droppingOut || submitting) return;
    setDroppingOut(true);
    setErrorMessage("");
    try {
      await dropOutDailyBattle(battleId);
      if (!mountedRef.current) return;
      setPhase("dropped-out");
      pollResult(battleId, "dropped-out");
    } catch (error) {
      if (!mountedRef.current) return;
      setErrorMessage(error?.status === 409
        ? "이미 제출되었거나 종료된 배틀은 포기할 수 없습니다."
        : messageForError(error));
    } finally {
      if (mountedRef.current) setDroppingOut(false);
    }
  }, [battleId, droppingOut, phase, pollResult, submitting]);

  const retryResult = useCallback(() => {
    if (!battleId) return load();
    pollFailuresRef.current = 0;
    setErrorMessage("");
    setPhase("result-pending");
    return pollResult(battleId);
  }, [battleId, load, pollResult]);

  return {
    accessIssue,
    alarm,
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
