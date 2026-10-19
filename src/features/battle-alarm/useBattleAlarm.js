import { useCallback, useEffect, useRef, useState } from "react";
import { dismissBattleAlarm, getBattleAlarmStatus, isBattleAlarmMocked } from "../../api/battleAlarmApi.js";
import {
  CHECKING_BANNER_DELAY_MS,
  MAX_RETRIES,
  RETRY_INTERVAL_MS,
  computeClockOffset,
  isInCheckWindow,
  isNearOpenWindow,
  msUntilNextCheckStart,
  nextCheckDelay,
  toServerNow,
} from "./battleAlarmTiming.js";

// 배틀 알림 모달을 띄울지 서버에 확인하고, 필요하면 다시 확인하는 흐름을 맡는다.
// view: "open"(도전 모달) | "closed"(마감 안내) | null(아무것도 안 보임)
// banner: "checking"(확인 중) | "failed"(확인 실패) | null
export function useBattleAlarm(enabled) {
  const [view, setView] = useState(null);
  const [alarm, setAlarm] = useState(null);
  const [banner, setBanner] = useState(null);

  const offsetRef = useRef(0);
  const timerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const generationRef = useRef(0);

  const showBannerNow = () => isBattleAlarmMocked() || isNearOpenWindow(toServerNow(offsetRef.current));

  // 지금 모달을 보여줘야 하는지 결과에 맞춰 화면 상태를 정한다.
  const applyStatus = useCallback((next) => {
    setAlarm(next);

    if (next.status === "OPEN" && !next.participated && !next.dismissed) {
      setView("open");
    } else if (next.status === "CLOSED") {
      // 모달이 떠 있는 중에 마감되면 마감 안내로 바꾸고, 그 밖에는 아무것도 보이지 않는다.
      setView((current) => (current === "open" ? "closed" : null));
    } else {
      setView(null);
    }

    // 열린 모달은 마감 시각이 되면 마감 안내로 바꾼다.
    clearTimeout(closeTimerRef.current);
    if (next.status === "OPEN" && next.closesAt) {
      const wait = next.closesAt.getTime() - toServerNow(offsetRef.current);
      closeTimerRef.current = setTimeout(() => setView((current) => (current === "open" ? "closed" : current)), Math.max(wait, 0));
    }
  }, []);

  const check = useCallback(
    async function run(retry = 0) {
      const generation = ++generationRef.current;
      clearTimeout(timerRef.current);

      // 테스트 시간대(13:10~16:55)가 아니면 서버에 묻지 않고 다음 확인 시작까지 기다린다.
      if (!isBattleAlarmMocked() && !isInCheckWindow(toServerNow(offsetRef.current))) {
        setBanner(null);
        timerRef.current = setTimeout(() => run(0), msUntilNextCheckStart(toServerNow(offsetRef.current)));
        return;
      }

      // 확인이 오래 걸릴 때만 "확인 중"을 보여준다. 금방 끝나면 깜빡이지 않는다.
      const bannerTimer = setTimeout(() => {
        if (generation === generationRef.current && showBannerNow()) setBanner("checking");
      }, CHECKING_BANNER_DELAY_MS);

      const requestedAt = Date.now();
      try {
        const next = await getBattleAlarmStatus();
        clearTimeout(bannerTimer);
        if (generation !== generationRef.current) return;

        offsetRef.current = computeClockOffset(next.serverTime.getTime(), requestedAt, Date.now());
        setBanner(null);
        applyStatus(next);

        // 더 확인할 필요가 없으면 다음 날 11:50에 다시 확인한다.
        const serverNow = toServerNow(offsetRef.current);
        const delay = nextCheckDelay(next.status, serverNow, next.opensAt?.getTime()) ?? msUntilNextCheckStart(serverNow);
        timerRef.current = setTimeout(() => run(0), delay);
      } catch {
        clearTimeout(bannerTimer);
        if (generation !== generationRef.current) return;

        // 실패하면 5초 간격으로 최대 3번 다시 시도하고, 그래도 안 되면 "확인 실패"를 보여준다.
        if (retry < MAX_RETRIES) {
          if (showBannerNow()) setBanner("checking");
          timerRef.current = setTimeout(() => run(retry + 1), RETRY_INTERVAL_MS);
        } else {
          setBanner(showBannerNow() ? "failed" : null);
        }
      }
    },
    [applyStatus],
  );

  // 처음 화면이 열릴 때와 탭으로 돌아왔을 때 확인한다.
  useEffect(() => {
    if (!enabled) return undefined;

    check(0);

    const onVisible = () => {
      if (document.visibilityState === "visible") check(0);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      generationRef.current += 1;
      clearTimeout(timerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, [enabled, check]);

  // 모달을 닫는다. 화면에서는 바로 닫고, 서버에는 닫았다는 사실을 저장한다.
  const dismiss = useCallback(() => {
    setView(null);
    if (!alarm?.battleId) return;

    setAlarm((current) => (current ? { ...current, dismissed: true } : current));
    dismissBattleAlarm(alarm.battleId).catch(() => {});
  }, [alarm]);

  // [도전하기]를 누르면 서버에 다시 확인한다. 아직 열려 있으면 true, 이미 마감됐으면 마감 안내로 바꾸고 false.
  const challenge = useCallback(async () => {
    try {
      const next = await getBattleAlarmStatus();
      if (next.status !== "OPEN") {
        applyStatus(next);
        setView("closed");
        return false;
      }
    } catch {
      // 확인에 실패해도 도전 화면 안에서 다시 판단하므로 이동은 막지 않는다.
    }

    // 도전하기로 닫을 때는 "닫기"와 달리 서버에 저장하지 않는다.
    setView(null);
    return true;
  }, [applyStatus]);

  return { view, banner, alarm, retry: () => check(0), dismiss, challenge };
}
