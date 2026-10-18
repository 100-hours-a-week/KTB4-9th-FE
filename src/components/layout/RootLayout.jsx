import { Outlet } from "react-router";
import BattleAlarmRoot from "../battle-alarm/BattleAlarmRoot.jsx";

// 모든 화면을 감싸는 맨 바깥 레이아웃. 화면을 옮겨도 유지되어야 하는 배틀 알림 모달을 여기에 한 번만 붙인다.
export default function RootLayout() {
  return (
    <>
      <Outlet />
      <BattleAlarmRoot />
    </>
  );
}
