import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useBattleAlarm } from "../../features/battle-alarm/useBattleAlarm.js";
import BattleAlarmBanner from "./BattleAlarmBanner.jsx";
import BattleAlarmModal from "./BattleAlarmModal.jsx";

// 배틀 알림 모달과 안내 띠를 화면 위에 붙이는 뿌리 컴포넌트. 로그인 화면에서는 확인하지 않는다.
export default function BattleAlarmRoot() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { view, banner, retry, dismiss, challenge } = useBattleAlarm(pathname !== "/login");

  // 1. 서버에 다시 확인한다.
  // 2. 아직 열려 있으면 배틀 화면으로 이동한다.
  async function handleChallenge() {
    setBusy(true);
    const stillOpen = await challenge();
    setBusy(false);
    if (stillOpen) navigate("/daily-battles");
  }

  if (pathname === "/login") return null;

  return (
    <>
      {banner && <BattleAlarmBanner banner={banner} onRetry={retry} />}
      {view && (
        <BattleAlarmModal view={view} busy={busy} onChallenge={handleChallenge} onDismiss={dismiss} />
      )}
    </>
  );
}
