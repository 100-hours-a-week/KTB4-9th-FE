import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useNotifications } from "../../features/notification/useNotifications.js";
import { EVALUATION_SUBMITTED_EVENT } from "../../features/notification/notificationPolling.js";
import { hasSeenBellHint, markBellHintSeen } from "../../features/notification/hintStorage.js";
import { measureBellArea } from "../../features/notification/bellArea.js";
import {
  clampBellPosition,
  defaultBellPosition,
  hintPlacement,
  isSameBox,
  panelPlacement,
  toastPlacement,
} from "../../features/notification/bellPosition.js";
import NotificationBell from "./NotificationBell.jsx";
import NotificationHint from "./NotificationHint.jsx";
import NotificationPanel from "./NotificationPanel.jsx";
import NotificationToast from "./NotificationToast.jsx";

// 말풍선이 저절로 사라지는 시간, 제출 안내 토스트가 보이는 시간
const HINT_AUTO_HIDE_MS = 5_000;
const TOAST_VISIBLE_MS = 3_000;

export default function NotificationLayer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { notifications, unreadCount, arrival, fetchedAt, markRead, refresh } = useNotifications();

  // 종의 위치와, 그 위치를 정하는 데 쓴 앱 화면 범위(null이면 아직 측정 전)
  const [geometry, setGeometry] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(() => !hasSeenBellHint());
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  // 1. 화면이 바뀌거나 창 크기가 바뀌거나 화면 구조가 바뀌면(하단 내비게이션은 로그인 확인이 끝난 뒤에 나타나기도 함)
  //    종이 움직일 수 있는 영역을 다시 재고, 영역 밖이면 안으로 옮긴다
  useLayoutEffect(() => {
    const place = () => {
      const { frame, area } = measureBellArea();
      setGeometry((current) => {
        const position = current ? clampBellPosition(current.position, area) : defaultBellPosition(area);
        // 달라진 게 없으면 같은 값을 그대로 돌려줘서 화면을 다시 그리지 않는다
        if (
          current
          && isSameBox(current.frame, frame)
          && isSameBox(current.area, area)
          && isSameBox(current.position, position)
        ) {
          return current;
        }
        return { frame, area, position };
      });
    };
    place();
    window.addEventListener("resize", place);
    const observer = new MutationObserver(place);
    observer.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", place);
      observer.disconnect();
    };
  }, [pathname]);

  // 2. 말풍선은 한 번 보면 다시 보이지 않게 기억하고 숨긴다
  const hideHint = useCallback(() => {
    setHintVisible(false);
    markBellHintSeen();
  }, []);

  // 3. 말풍선은 5초 뒤에 저절로 사라진다 (종이 화면에 나타난 뒤부터 센다)
  const hintShown = hintVisible && geometry !== null;
  useEffect(() => {
    if (!hintShown) return undefined;
    const timer = setTimeout(hideHint, HINT_AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [hintShown, hideHint]);

  // 4. 평가를 제출하면 안내 토스트를 3초 동안 보여준다
  useEffect(() => {
    const onSubmitted = () => {
      setToastVisible(true);
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToastVisible(false), TOAST_VISIBLE_MS);
    };
    window.addEventListener(EVALUATION_SUBMITTED_EVENT, onSubmitted);
    return () => {
      window.removeEventListener(EVALUATION_SUBMITTED_EVENT, onSubmitted);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  // 종을 누르면 목록을 열고 닫는다 (열 때는 최신 목록으로 한 번 확인)
  function handleTap() {
    hideHint();
    if (!panelOpen) refresh();
    setPanelOpen(!panelOpen);
  }

  // 종을 끌기 시작하면 목록과 말풍선을 닫는다
  function handleDragStart() {
    hideHint();
    setPanelOpen(false);
  }

  function handleMove(position) {
    setGeometry((current) => (current ? { ...current, position } : current));
  }

  // 알림을 누르면 읽음 처리하고 해당 문제 화면으로 이동한다 (결과는 그 화면이 한 번 조회해서 보여줌)
  function handleSelect(item) {
    setPanelOpen(false);
    markRead(item);
    navigate(`/problems/${item.problemId}`, {
      state: { fromNotification: true, evaluationTaskId: item.evaluationTaskId },
    });
  }

  if (!geometry) return null;

  const { position, frame, area } = geometry;
  const view = { viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };

  return (
    <>
      <NotificationBell
        position={position}
        area={area}
        unreadCount={unreadCount}
        arrival={arrival}
        onMove={handleMove}
        onDragStart={handleDragStart}
        onTap={handleTap}
      />
      {hintShown && !panelOpen && (
        <NotificationHint placement={hintPlacement({ bell: position, area, frame, ...view })} />
      )}
      {panelOpen && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          now={fetchedAt}
          placement={panelPlacement({ bell: position, frame, area, viewportHeight: view.viewportHeight })}
          onSelect={handleSelect}
          onClose={() => setPanelOpen(false)}
        />
      )}
      {toastVisible && (
        <NotificationToast placement={toastPlacement({ frame, area, viewportHeight: view.viewportHeight })} />
      )}
    </>
  );
}
