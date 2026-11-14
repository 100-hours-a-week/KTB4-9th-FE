// 배틀 시간을 바꿀 때는 아래 시작 시각만 수정하면 됩니다.
const START_HOUR = 20;
const START_MINUTE = 20;

const BATTLE_DURATION_MINUTES = 10;
const COUNTDOWN_LEAD_MINUTES = 20;
const ALARM_LEAD_MINUTES = 5;
const ALARM_TAIL_MINUTES = 5;

export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const MINUTES_PER_DAY = 24 * 60;
const SECONDS_PER_DAY = MINUTES_PER_DAY * 60;
const startMinuteOfDay = START_HOUR * 60 + START_MINUTE;
const resultMinuteOfDay = startMinuteOfDay + BATTLE_DURATION_MINUTES;
const submissionDeadlineSecondOfDay = resultMinuteOfDay * 60 - 1;

function normalizeSeconds(seconds) {
  return ((seconds % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;
}

function formatClock(seconds, includeSeconds = false) {
  const normalized = normalizeSeconds(seconds);
  const hour = Math.floor(normalized / 3600);
  const minute = Math.floor((normalized % 3600) / 60);
  const second = normalized % 60;
  const base = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return includeSeconds ? `${base}:${String(second).padStart(2, "0")}` : base;
}

function formatKoreanTime(minutes, use24Hour = false) {
  const normalized = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  if (use24Hour) return `${hour}시 ${minute}분`;

  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 || 12;
  return `${period} ${hour12}시 ${minute}분`;
}

function formatKoreanTimeWithSeconds(seconds) {
  const normalized = normalizeSeconds(seconds);
  const hour = Math.floor(normalized / 3600);
  const minute = Math.floor((normalized % 3600) / 60);
  const second = normalized % 60;
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 || 12;
  return `${period} ${hour12}시 ${minute}분 ${second}초`;
}

function formatMeridiemTime(minutes) {
  const normalized = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 || 12;
  return `${period} ${hour12}:${String(minute).padStart(2, "0")}`;
}

const startLabel = formatClock(startMinuteOfDay * 60);
const submissionDeadlineLabel = formatClock(submissionDeadlineSecondOfDay, true);
const resultLabel = formatClock(resultMinuteOfDay * 60);

export const DAILY_BATTLE_SCHEDULE = Object.freeze({
  startTime: `${startLabel}:00`,
  countdownStartTime: `${formatClock((startMinuteOfDay - COUNTDOWN_LEAD_MINUTES) * 60)}:00`,
  submissionDeadlineTime: submissionDeadlineLabel,
  resultAvailableTime: `${resultLabel}:00`,
  battleWindowMs: BATTLE_DURATION_MINUTES * 60 * 1000,
  alarmWindowStartMinute: startMinuteOfDay - ALARM_LEAD_MINUTES,
  alarmWindowEndMinute: resultMinuteOfDay + ALARM_TAIL_MINUTES,
  labels: Object.freeze({
    start: startLabel,
    submissionDeadline: submissionDeadlineLabel,
    result: resultLabel,
    participationRange: `${startLabel}–${submissionDeadlineLabel}`,
    startKorean: formatKoreanTime(startMinuteOfDay),
    startKorean24: formatKoreanTime(startMinuteOfDay, true),
    submissionDeadlineKorean: formatKoreanTimeWithSeconds(submissionDeadlineSecondOfDay),
    startMeridiem: formatMeridiemTime(startMinuteOfDay),
  }),
});

export function getKstDateTime(serverTime, time) {
  const koreanTime = new Date(serverTime.getTime() + KST_OFFSET_MS);
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const date = String(koreanTime.getUTCDate()).padStart(2, "0");
  return new Date(`${year}-${month}-${date}T${time}+09:00`);
}

export function getKstDateTimeForDate(date, time) {
  return new Date(`${date}T${time}+09:00`);
}
