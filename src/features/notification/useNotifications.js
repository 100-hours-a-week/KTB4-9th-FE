import { useCallback, useEffect, useRef, useState } from "react";
import { getNotifications, markNotificationRead } from "../../api/notificationApi.js";
import {
  EVALUATION_SUBMITTED_EVENT,
  FAST_POLL_DURATION_MS,
  hasNewUnread,
  maxNotificationId,
  nextPollDelay,
} from "./notificationPolling.js";

// 알림 목록과 안 읽은 개수를 주기적으로 확인하고, 읽음 처리를 맡는다.
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // 새 알림이 도착할 때마다 1씩 늘어남 (종을 흔들 때 사용)
  const [arrival, setArrival] = useState(0);
  // 마지막으로 확인한 시각 (알림의 "몇 분 전" 표시 기준)
  const [fetchedAt, setFetchedAt] = useState(0);

  const timerRef = useRef(null);
  const generationRef = useRef(0);
  const failuresRef = useRef(0);
  const fastUntilRef = useRef(0);
  const knownMaxIdRef = useRef(null);

  // 서버에서 알림을 가져와 반영하고 다음 확인을 예약한다. (이전 요청의 응답은 번호로 걸러낸다.)
  const check = useCallback(async function run() {
    // 1. 확인 번호를 올리고 예약된 확인을 취소한다
    const generation = ++generationRef.current;
    clearTimeout(timerRef.current);

    try {
      // 2. 서버에서 가져오고, 그 사이 더 새로운 확인이 시작됐으면 이 응답은 버린다
      const next = await getNotifications();
      if (generation !== generationRef.current) return;

      // 3. 처음 보는 안 읽은 알림이 생겼으면 새 알림 도착으로 보고 빠른 확인을 끝낸다
      failuresRef.current = 0;
      if (knownMaxIdRef.current !== null && hasNewUnread(knownMaxIdRef.current, next.notifications)) {
        setArrival((count) => count + 1);
        fastUntilRef.current = 0;
      }
      knownMaxIdRef.current = maxNotificationId(next.notifications, knownMaxIdRef.current);

      // 4. 화면 상태에 반영한다
      setNotifications(next.notifications);
      setUnreadCount(next.unreadCount);
      setFetchedAt(Date.now());
    } catch (error) {
      if (generation !== generationRef.current) return;
      // 로그인이 풀렸으면 더 확인하지 않는다. (httpClient가 로그인 화면으로 보냄)
      if (error?.status === 401 || error?.status === 403) return;
      // 그 밖의 실패는 기존 목록을 그대로 두고 간격을 늘려 다시 시도한다
      failuresRef.current += 1;
    }

    // 5. 다음 확인을 예약한다
    const delay = nextPollDelay({
      failures: failuresRef.current,
      fastUntil: fastUntilRef.current,
      now: Date.now(),
    });
    timerRef.current = setTimeout(run, delay);
  }, []);

  useEffect(() => {
    // 1. 화면이 열리면 바로 확인하고 이후 주기적으로 반복한다
    check();

    // 2. 탭이 숨겨지면 멈추고, 다시 보이면 바로 확인한다
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        check();
      } else {
        generationRef.current += 1;
        clearTimeout(timerRef.current);
      }
    };
    // 3. 평가를 제출하면 60초 동안 빠르게 확인한다
    const onSubmitted = () => {
      fastUntilRef.current = Date.now() + FAST_POLL_DURATION_MS;
      check();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener(EVALUATION_SUBMITTED_EVENT, onSubmitted);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener(EVALUATION_SUBMITTED_EVENT, onSubmitted);
      generationRef.current += 1;
      clearTimeout(timerRef.current);
    };
  }, [check]);

  // 알림을 읽음 처리한다. 화면은 먼저 바꾸고, 서버 상태와는 요청이 끝난 뒤 다시 맞춘다.
  const markRead = useCallback(async (item) => {
    // 1. 이미 읽은 알림이면 아무것도 하지 않는다
    if (item.isRead) return;

    // 2. 날아가 있던 이전 응답이 방금 바꾼 화면을 되돌리지 못하게 한다
    generationRef.current += 1;
    setNotifications((list) => list.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    setUnreadCount((count) => Math.max(0, count - 1));

    // 3. 서버에 읽음을 알린다 (실패해도 아래 확인이 서버 상태로 맞춘다)
    try {
      await markNotificationRead(item.id);
    } catch {
      // 일부러 비워 둠
    }
    check();
  }, [check]);

  return { notifications, unreadCount, arrival, fetchedAt, markRead, refresh: check };
}
