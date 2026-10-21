export const BELL_SIZE = 36;
// 앱 화면 가장자리와 종 사이의 최소 간격
const EDGE_GAP = 8;
// 처음 놓을 때 영역 가장자리에서 더 띄우는 간격
const DEFAULT_INSET = 8;
const PANEL_MAX_WIDTH = 320;
const PANEL_GAP = 10;
const PANEL_SIDE_MARGIN = 12;
const TOAST_MAX_WIDTH = 340;
const TOAST_SIDE_MARGIN = 16;
// 토스트를 움직일 수 있는 영역의 아래 끝에서 띄우는 높이 (하단 내비게이션 윗면에서 12px 위)
const TOAST_LIFT = 4;
const HINT_GAP = 12;
// 말풍선이 종 위에 들어갈 수 있는지 볼 때 필요한 높이
const HINT_ROOM = 50;
const HINT_OVERHANG = 4;

// 종이 움직일 수 있는 영역: 앱 화면 폭 안, 아래는 하단 내비게이션 위까지
export function movableArea(frame, bottomLimit) {
  return {
    left: frame.left + EDGE_GAP,
    top: EDGE_GAP,
    right: frame.right - EDGE_GAP,
    bottom: bottomLimit - EDGE_GAP,
  };
}

// 두 영역(또는 앱 화면 범위)이 같은 값인지. 다시 측정해도 달라진 게 없으면 화면을 다시 그리지 않으려고 쓴다.
export function isSameBox(a, b) {
  return Object.keys(a).every((key) => a[key] === b[key]);
}

// 종의 위치(왼쪽 위 모서리)를 움직일 수 있는 영역 안으로 보정한다.
export function clampBellPosition(position, area) {
  return {
    x: Math.min(Math.max(position.x, area.left), area.right - BELL_SIZE),
    y: Math.min(Math.max(position.y, area.top), area.bottom - BELL_SIZE),
  };
}

// 처음 놓는 위치: 영역의 오른쪽 아래
export function defaultBellPosition(area) {
  return clampBellPosition(
    { x: area.right - BELL_SIZE - DEFAULT_INSET, y: area.bottom - BELL_SIZE - DEFAULT_INSET },
    area,
  );
}

// 알림 패널의 위치와 폭. 종이 영역의 위쪽 절반이면 아래로, 아래쪽 절반이면 위로 펼친다.
export function panelPlacement({ bell, frame, area, viewportHeight }) {
  const width = Math.min(PANEL_MAX_WIDTH, frame.right - frame.left - PANEL_SIDE_MARGIN * 2);
  const left = Math.min(
    Math.max(bell.x + BELL_SIZE - width, frame.left + PANEL_SIDE_MARGIN),
    frame.right - width - PANEL_SIDE_MARGIN,
  );
  const opensDown = bell.y + BELL_SIZE / 2 < (area.top + area.bottom) / 2;
  return opensDown
    ? { left, width, top: bell.y + BELL_SIZE + PANEL_GAP }
    : { left, width, bottom: viewportHeight - bell.y + PANEL_GAP };
}

// 제출 안내 토스트의 위치와 최대 폭. 앱 화면 가운데, 하단 내비게이션 바로 위에 놓는다.
export function toastPlacement({ frame, area, viewportHeight }) {
  return {
    left: (frame.left + frame.right) / 2,
    maxWidth: Math.min(TOAST_MAX_WIDTH, frame.right - frame.left - TOAST_SIDE_MARGIN * 2),
    bottom: viewportHeight - area.bottom + TOAST_LIFT,
  };
}

// 말풍선의 위치. 종이 앱 화면 오른쪽 절반이면 오른쪽 끝을, 왼쪽 절반이면 왼쪽 끝을 종에 맞춘다.
export function hintPlacement({ bell, area, frame, viewportWidth, viewportHeight }) {
  const anchorRight = bell.x + BELL_SIZE / 2 > (frame.left + frame.right) / 2;
  const above = bell.y - area.top > HINT_ROOM;
  return {
    anchorRight,
    above,
    x: anchorRight ? viewportWidth - (bell.x + BELL_SIZE + HINT_OVERHANG) : bell.x - HINT_OVERHANG,
    y: above ? viewportHeight - bell.y + HINT_GAP : bell.y + BELL_SIZE + HINT_GAP,
  };
}
