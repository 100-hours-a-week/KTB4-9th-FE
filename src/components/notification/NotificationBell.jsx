import { useRef } from "react";
import { BELL_SIZE, clampBellPosition } from "../../features/notification/bellPosition.js";

// 이 거리보다 많이 움직이면 "누름"이 아니라 "끌기"로 본다
const DRAG_THRESHOLD_PX = 6;

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

// 알림 종 버튼. 누르면 목록을 열고, 끌면 앱 화면 안에서 위치를 옮긴다.
export default function NotificationBell({ position, area, unreadCount, arrival, onMove, onDragStart, onTap }) {
  const dragRef = useRef(null);

  // 1. 누른 자리와 종의 처음 위치를 기억한다
  function handlePointerDown(event) {
    dragRef.current = { startX: event.clientX, startY: event.clientY, origin: position, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  // 2. 조금 움직이면 끌기로 보고, 움직인 만큼 종을 옮긴다 (움직일 수 있는 영역 안으로 보정)
  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
      onDragStart();
    }
    if (drag.moved) {
      onMove(clampBellPosition({ x: drag.origin.x + dx, y: drag.origin.y + dy }, area));
    }
  }

  // 3. 손을 떼면 끌지 않았을 때만 "눌렀다"로 처리한다
  function handlePointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved) onTap();
  }

  // 키보드(Enter, Space)로도 열 수 있게 한다
  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onTap();
    }
  }

  return (
    <button
      type="button"
      aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : "알림"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragRef.current = null; }}
      onKeyDown={handleKeyDown}
      className="cosmos-bell fixed z-[90] flex touch-none select-none items-center justify-center rounded-full"
      style={{ left: position.x, top: position.y, width: BELL_SIZE, height: BELL_SIZE }}
    >
      <span key={arrival} className={arrival > 0 ? "cosmos-bell-ring" : ""}>
        <BellIcon />
      </span>
      {unreadCount > 0 && (
        <span className="cosmos-bell-badge absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
