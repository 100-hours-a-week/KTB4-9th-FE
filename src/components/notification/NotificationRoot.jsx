import { useLocation } from "react-router";
import NotificationLayer from "./NotificationLayer.jsx";

// 알림 종, 목록, 말풍선, 토스트를 화면 위에 붙이는 뿌리. 로그인 화면에서는 아무것도 하지 않는다.
export default function NotificationRoot() {
  const { pathname } = useLocation();
  if (pathname === "/login") return null;
  return <NotificationLayer />;
}
