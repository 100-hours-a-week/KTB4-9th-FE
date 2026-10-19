import { request } from "./httpClient.js";

// 배틀이 열려 있는 시간(12:50~13:00)의 길이. 서버가 열리는 시각을 주지 않아서 마감 시각에서 거꾸로 계산한다.
const BATTLE_WINDOW_MS = 10 * 60 * 1000;

// 개발 서버에서 주소에 alarmMock이 있으면 가짜 서버를 쓴다. 운영 빌드에서는 이 값이 항상 false다.
// 화면을 옮기면 주소의 ?뒷부분이 지워질 수 있어서, 페이지가 열릴 때 옵션을 한 번에 읽어 둔다.
const MOCK_PARAMS =
  import.meta.env.DEV && typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
const MOCKED = MOCK_PARAMS?.has("alarmMock") ?? false;

export function isBattleAlarmMocked() {
  return MOCKED;
}

// 서버 응답(snake_case)을 화면에서 쓰는 모양으로 바꾼다.
function normalizeStatus(payload) {
  const data = payload?.data ?? {};
  const closesAt = data.closes_at ? new Date(data.closes_at) : null;

  // 상태나 시각이 이상한 응답은 실패로 처리한다. (시각 계산이 NaN이 되어 요청이 쉬지 않고 나가는 것을 막는다.)
  const serverTime = new Date(data.server_time);
  if (!data.status || Number.isNaN(serverTime.getTime()) || (closesAt && Number.isNaN(closesAt.getTime()))) {
    throw new Error("invalid_battle_alarm_response");
  }

  const opensAt = data.opens_at
    ? new Date(data.opens_at)
    : closesAt
      ? new Date(closesAt.getTime() - BATTLE_WINDOW_MS)
      : null;

  return {
    status: data.status,
    serverTime,
    battleId: data.battle_id ?? null,
    participated: Boolean(data.participated),
    dismissed: Boolean(data.dismissed),
    opensAt,
    closesAt,
  };
}

// 지금 배틀 알림 모달을 띄워도 되는 상태인지 서버에 확인한다.
export async function getBattleAlarmStatus() {
  if (MOCKED) {
    const mock = await import("./battleAlarmMock.js");
    return normalizeStatus(await mock.mockStatusPayload(MOCK_PARAMS));
  }

  const payload = await request("/daily-battles/alarm");
  return normalizeStatus(payload);
}

// 사용자가 배틀 알림 모달을 닫았다는 것을 서버에 저장한다.
export async function dismissBattleAlarm(battleId) {
  if (MOCKED) {
    const mock = await import("./battleAlarmMock.js");
    return mock.mockDismiss(MOCK_PARAMS, battleId);
  }

  return request(`/daily-battles/${battleId}/alarm`, {
    method: "PATCH",
    body: JSON.stringify({ dismissed: true }),
  });
}
