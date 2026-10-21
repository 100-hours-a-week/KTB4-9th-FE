// 평소 확인 간격 (임시값, 나중에 측정으로 조정)
export const POLL_INTERVAL_MS = 10_000;
// 평가를 제출한 직후 빠르게 확인하는 간격과 기간
export const FAST_POLL_INTERVAL_MS = 4_000;
export const FAST_POLL_DURATION_MS = 60_000;
// 실패가 이어질 때 늘려 가는 간격의 상한
export const MAX_BACKOFF_MS = 60_000;
// 평가를 제출했다는 것을 화면 전체에 알리는 이벤트 이름
export const EVALUATION_SUBMITTED_EVENT = "cosmos:evaluation-submitted";

// 평가를 제출했다고 알린다. (알림 확인이 빨라지고 안내 토스트가 뜬다)
export function announceEvaluationSubmitted() {
  window.dispatchEvent(new Event(EVALUATION_SUBMITTED_EVENT));
}

// 다음 확인까지 기다릴 시간. 실패가 이어지면 늘리고, 제출 직후에는 줄인다.
export function nextPollDelay({ failures, fastUntil, now }) {
  // 1. 연속 실패 중이면 20초, 40초, 60초(상한)
  if (failures > 0) return Math.min(POLL_INTERVAL_MS * 2 ** failures, MAX_BACKOFF_MS);
  // 2. 제출 직후 빠른 확인 기간이면 4초
  if (now < fastUntil) return FAST_POLL_INTERVAL_MS;
  // 3. 아니면 10초
  return POLL_INTERVAL_MS;
}

// 지금까지 본 가장 큰 알림 id (알림이 없으면 기존 값을 그대로)
export function maxNotificationId(notifications, current) {
  return notifications.reduce((max, item) => Math.max(max, item.id), current ?? 0);
}

// 처음 보는(id가 더 큰) 안 읽은 알림이 있는지
export function hasNewUnread(knownMaxId, notifications) {
  return notifications.some((item) => !item.isRead && item.id > knownMaxId);
}
