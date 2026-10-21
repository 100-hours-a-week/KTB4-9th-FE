// 알림이 만들어진 시각을 "방금 전", "10분 전", "3시간 전", "2일 전"으로 바꾼다.
export function formatRelativeTime(isoString, now) {
  const diff = now - new Date(isoString).getTime();
  if (!Number.isFinite(diff)) return "";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}
