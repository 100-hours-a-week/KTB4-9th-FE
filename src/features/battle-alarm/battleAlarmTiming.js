// 배틀 알림 확인 주기와 시간 계산. 화면과 상관없는 값과 계산만 모아 둔다.

// 아직 안 열렸거나 배틀이 준비 안 됐을 때 다시 확인하는 간격(ms)
export const POLL_INTERVAL_MS = 2000;
// 열리기 이만큼(ms) 전부터 확인을 시작한다. (13:20 기준 13:19:58)
export const POLL_LEAD_MS = 2000;
// 사용자마다 확인 시작을 어긋나게 하는 최대 무작위 지연(ms). 요청이 한꺼번에 몰리지 않게 한다.
export const POLL_JITTER_MAX_MS = 2000;
// 확인 요청이 실패했을 때 다시 시도하는 간격(ms)과 횟수
export const RETRY_INTERVAL_MS = 5000;
export const MAX_RETRIES = 3;
// 확인이 이 시간(ms)보다 오래 걸리면 "확인 중" 배너를 보여준다.
export const CHECKING_BANNER_DELAY_MS = 500;
// 열리는 시각을 알 수 없을 때 다음 확인까지 기다리는 시간(ms)
const UNKNOWN_OPEN_WAIT_MS = 60 * 1000;
// 테스트 배틀 전후(한국 시각 13:15~14:35)에만 배너를 보여준다.
const BANNER_START_MINUTE = 13 * 60 + 15;
const BANNER_END_MINUTE = 14 * 60 + 35;
// 서버에 물어보는 시간대(한국 시각 13:10~14:35).
const CHECK_START_MINUTE = 13 * 60 + 10;
const CHECK_END_MINUTE = 14 * 60 + 35;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

// 한국 시각 기준으로 하루 중 몇 분째인지 구한다.
function kstMinuteOfDay(ms) {
  const kst = new Date(ms + KST_OFFSET_MS);
  return kst.getUTCHours() * 60 + kst.getUTCMinutes();
}

// 서버 시각과 내 시계의 차이를 계산한다.
export function computeClockOffset(serverTimeMs, requestedAtMs, respondedAtMs) {
  // 1. 요청을 보낸 시각과 응답을 받은 시각의 한가운데를 서버가 시각을 만든 순간으로 본다.
  const midpoint = (requestedAtMs + respondedAtMs) / 2;

  // 2. 서버 시각에서 내 시계의 그 순간을 뺀 값이 시계 차이다.
  return serverTimeMs - midpoint;
}

// 내 시계에 시계 차이를 더해 지금 서버 시각을 구한다.
export function toServerNow(offsetMs) {
  return Date.now() + offsetMs;
}

// 상태에 따라 다음 확인까지 기다릴 시간(ms)을 구한다. 더 확인하지 않아도 되면 null.
export function nextCheckDelay(status, serverNowMs, opensAtMs, random = Math.random()) {
  // 1. 열려 있거나 이미 닫혔으면 더 확인하지 않는다.
  if (status === "OPEN" || status === "CLOSED") return null;

  // 2. 열려야 하는 시간인데 배틀이 준비되지 않았으면 일정 간격으로 다시 확인한다.
  if (status === "NO_BATTLE") return POLL_INTERVAL_MS;

  // 3. 아직 안 열렸으면 열리는 시각을 알 수 있는지 확인한다.
  if (status !== "NOT_OPEN") return null;
  if (opensAtMs == null || Number.isNaN(opensAtMs)) return UNKNOWN_OPEN_WAIT_MS;

  // 4. 열리기 조금 전까지 기다렸다가 확인을 시작한다. (사용자마다 무작위 지연을 더해 어긋나게 한다.)
  const waitMs = opensAtMs - POLL_LEAD_MS - serverNowMs;
  if (waitMs > 0) return waitMs + random * POLL_JITTER_MAX_MS;

  // 5. 이미 확인을 시작할 시간이면 일정 간격으로 확인한다.
  return POLL_INTERVAL_MS;
}

// 지금이 서버에 물어봐도 되는 테스트 시간대(13:10~14:35)인지 확인한다.
export function isInCheckWindow(nowMs) {
  const minute = kstMinuteOfDay(nowMs);
  return minute >= CHECK_START_MINUTE && minute <= CHECK_END_MINUTE;
}

// 다음 13:10(한국 시각)까지 남은 시간(ms). 사용자마다 어긋나게 무작위 지연을 더한다.
export function msUntilNextCheckStart(nowMs, random = Math.random()) {
  const kstMs = nowMs + KST_OFFSET_MS;
  let startKstMs = Math.floor(kstMs / DAY_MS) * DAY_MS + CHECK_START_MINUTE * MINUTE_MS;
  if (startKstMs <= kstMs) startKstMs += DAY_MS;
  return startKstMs - kstMs + random * POLL_JITTER_MAX_MS;
}

// 지금(서버 시각 기준)이 배너를 보여줘도 되는 테스트 시간대인지 확인한다.
export function isNearOpenWindow(serverNowMs) {
  const minutes = kstMinuteOfDay(serverNowMs);
  return minutes >= BANNER_START_MINUTE && minutes <= BANNER_END_MINUTE;
}
