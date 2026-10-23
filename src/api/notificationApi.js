import { request } from "./httpClient.js";

// 서버 응답의 알림 1건을 화면에서 쓰는 모양으로 바꾼다.
function normalizeNotification(item) {
  return {
    id: item.id,
    type: item.type,
    evaluationTaskId: item.evaluationTaskId,
    problemId: item.problemId,
    message: item.message,
    isRead: item.isRead === true,
    createdAt: item.createdAt,
  };
}

// 내 최근 알림(읽음 포함), 안 읽은 전체 개수, 진행 중인 평가 여부를 가져온다.
export async function getNotifications() {
  const payload = await request("/notifications");
  const data = payload?.data ?? {};
  return {
    unreadCount: Number.isFinite(data.unreadCount) ? data.unreadCount : 0,
    hasPendingEvaluation: data.hasPendingEvaluation === true,
    notifications: (data.notifications ?? []).map(normalizeNotification),
  };
}

// 알림을 읽음 처리한다. (이미 읽은 알림이어도 성공)
export async function markNotificationRead(notificationId) {
  await request(`/notifications/${notificationId}/read`, { method: "PATCH" });
}
