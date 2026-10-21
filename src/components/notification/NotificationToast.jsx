// 평가를 제출한 뒤 홈에서 보여주는 짧은 안내. 하단 내비게이션 위에 뜬다.
export default function NotificationToast({ placement }) {
  return (
    <div
      role="status"
      className="cosmos-notice fixed z-[95] w-max -translate-x-1/2 rounded-full px-4 py-2.5 text-center text-[13px]"
      style={{ left: placement.left, bottom: placement.bottom, maxWidth: placement.maxWidth }}
    >
      제출했어요. 평가가 끝나면 알림으로 알려드려요.
    </div>
  );
}
