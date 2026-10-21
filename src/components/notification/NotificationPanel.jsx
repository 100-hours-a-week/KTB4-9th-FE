import { formatRelativeTime } from "../../features/notification/notificationTime.js";

// 알림 종류별 바로가기 문구
const LINK_LABELS = {
  NL_EVALUATION_DONE: "결과 보기",
  NL_EVALUATION_FAILED: "다시 제출하기",
};

// 지난 알림 목록 패널. 알림을 누르면 읽음 처리하고 해당 화면으로 이동한다.
export default function NotificationPanel({ notifications, unreadCount, now, placement, onSelect, onClose }) {
  return (
    <>
      <button type="button" aria-label="알림 닫기" onClick={onClose} className="fixed inset-0 z-[91] cursor-default" />
      <div
        role="dialog"
        aria-label="알림"
        className="cosmos-panel fixed z-[92] flex max-h-[60vh] flex-col rounded-2xl p-3 text-sm"
        style={{ left: placement.left, width: placement.width, top: placement.top, bottom: placement.bottom }}
      >
        <div className="mb-1 flex items-center justify-between px-1">
          <strong className="text-sm">알림</strong>
          <span className="text-xs text-[#6B6890]">
            {unreadCount > 0 ? `안 읽은 알림 ${unreadCount}개` : "모두 읽었어요"}
          </span>
        </div>
        {notifications.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-[#6B6890]">아직 알림이 없어요.</p>
        ) : (
          <ul className="min-h-0 overflow-y-auto">
            {notifications.map((item) => (
              <li key={item.id} className="mt-1.5">
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`cosmos-panel-item w-full rounded-xl p-2.5 text-left ${item.isRead ? "is-read" : "is-unread"}`}
                >
                  <span className="flex items-start gap-2.5">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? "bg-transparent" : "bg-[#7C3AED]"}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block break-words">{item.message}</span>
                      <span className="mt-0.5 block text-[11px] text-[#6B6890]">{formatRelativeTime(item.createdAt, now)}</span>
                    </span>
                  </span>
                  <span className={`ml-[18px] mt-2 block text-xs font-semibold ${item.isRead ? "text-[#6B6890]" : "text-[#C084FC]"}`}>
                    {LINK_LABELS[item.type] ?? "열기"} ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
