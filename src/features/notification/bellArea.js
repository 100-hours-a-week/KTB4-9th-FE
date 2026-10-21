import { movableArea } from "./bellPosition.js";

// 앱 화면(#root)의 좌우 범위와 종이 움직일 수 있는 영역을 지금 화면에서 측정한다.
export function measureBellArea() {
  const root = document.getElementById("root")?.getBoundingClientRect();
  const frame = root ? { left: root.left, right: root.right } : { left: 0, right: window.innerWidth };
  // 하단 내비게이션이 있는 화면이면 그 윗면까지만, 없으면 화면 아래까지
  const nav = document.querySelector("[data-bottom-nav]");
  const bottomLimit = nav ? nav.getBoundingClientRect().top : window.innerHeight;
  return { frame, area: movableArea(frame, bottomLimit) };
}
