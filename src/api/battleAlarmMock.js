// 개발 서버에서만 쓰는 가짜 배틀 알림 서버. 운영 시간이 아니어도 모달 흐름을 볼 수 있다.
// 주소 뒤에 아래 값을 붙여서 켠다. 예) /solve?alarmMock=12:49:50&alarmMockWindow=40
//   alarmMock=12:49:50          가짜 서버 시각의 시작 (한국 시각, 이 시각부터 실제 시간만큼 흐른다)
//   alarmMockWindow=600         배틀이 열려 있는 시간(초). 짧게 주면 마감도 금방 볼 수 있다 (기본 600)
//   alarmMockReadyAfter=0       열린 뒤 배틀이 준비되기까지 걸리는 시간(초). never면 계속 준비 안 됨 (기본 0)
//   alarmMockParticipated=1     이미 참여한 사용자로 응답
//   alarmMockFail=4             처음 N번의 요청을 실패시킴
//   alarmMockDelay=150          응답이 오는 데 걸리는 시간(ms). 1000 이상이면 "확인 중" 배너를 볼 수 있다

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

let state = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 밀리초를 한국 시각(+09:00) 문자열로 바꾼다.
function toKstIso(ms) {
  return new Date(ms + KST_OFFSET_MS).toISOString().replace("Z", "+09:00");
}

// 옵션 값을 읽어 가짜 서버 상태를 처음 한 번만 만든다.
function getState(params) {
  if (state) return state;

  const [hour, minute = 0, second = 0] = (params.get("alarmMock") || "12:49:50").split(":").map(Number);
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  const year = kstNow.getUTCFullYear();
  const month = kstNow.getUTCMonth();
  const day = kstNow.getUTCDate();
  const openMs = Date.UTC(year, month, day, 12 - 9, 50, 0);
  const readyAfter = params.get("alarmMockReadyAfter");

  state = {
    loadedAt: Date.now(),
    startMs: Date.UTC(year, month, day, hour - 9, minute, second),
    openMs,
    closeMs: openMs + Number(params.get("alarmMockWindow") ?? 600) * 1000,
    readyAfterMs: readyAfter === "never" ? Infinity : Number(readyAfter ?? 0) * 1000,
    participated: params.get("alarmMockParticipated") === "1",
    delayMs: Number(params.get("alarmMockDelay") ?? 150),
    failuresLeft: Number(params.get("alarmMockFail") ?? 0),
    dismissed: false,
  };
  return state;
}

export async function mockStatusPayload(params) {
  const mock = getState(params);
  await sleep(mock.delayMs);

  if (mock.failuresLeft > 0) {
    mock.failuresLeft -= 1;
    throw new Error("mock_failure");
  }

  const nowMs = mock.startMs + (Date.now() - mock.loadedAt);
  let status = "OPEN";
  if (nowMs < mock.openMs) status = "NOT_OPEN";
  else if (nowMs >= mock.closeMs) status = "CLOSED";
  else if (nowMs - mock.openMs < mock.readyAfterMs) status = "NO_BATTLE";

  const open = status === "OPEN";
  const resultAvailable = status === "CLOSED";
  return {
    message: "battle_alarm_status_retrieval_success",
    data: {
      status,
      server_time: toKstIso(nowMs),
      battle_id: open || resultAvailable ? 1 : null,
      participated: open && mock.participated,
      dismissed: open && mock.dismissed,
      opens_at: toKstIso(mock.openMs),
      closes_at: toKstIso(mock.closeMs),
    },
  };
}

export async function mockDismiss(params, battleId) {
  const mock = getState(params);
  await sleep(mock.delayMs);
  mock.dismissed = true;
  return { message: "battle_alarm_dismissed", data: { battle_id: battleId, dismissed: true } };
}
