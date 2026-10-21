import assert from "node:assert/strict";
import test from "node:test";
import {
  BELL_SIZE,
  clampBellPosition,
  defaultBellPosition,
  hintPlacement,
  isSameBox,
  movableArea,
  panelPlacement,
  toastPlacement,
} from "../src/features/notification/bellPosition.js";

const frame = { left: 100, right: 530 };
const area = movableArea(frame, 700);

test("the movable area stays inside the app frame and above the bottom navigation", () => {
  assert.deepEqual(area, { left: 108, top: 8, right: 522, bottom: 692 });
});

test("the area shrinks when the bottom navigation appears later", () => {
  const withoutNav = movableArea(frame, 812);
  const withNav = movableArea(frame, 732);
  assert.equal(withoutNav.bottom, 804);
  assert.equal(withNav.bottom, 724);
  // 내비게이션이 생기기 전 기본 위치에 있던 종은 내비게이션 위로 올라온다
  const bell = clampBellPosition(defaultBellPosition(withoutNav), withNav);
  assert.ok(bell.y + BELL_SIZE <= 732);
});

test("isSameBox compares every value", () => {
  assert.equal(isSameBox({ x: 1, y: 2 }, { x: 1, y: 2 }), true);
  assert.equal(isSameBox({ x: 1, y: 2 }, { x: 1, y: 3 }), false);
});

test("a position inside the area is kept as it is", () => {
  assert.deepEqual(clampBellPosition({ x: 200, y: 300 }, area), { x: 200, y: 300 });
});

test("a position outside the app frame is pushed back inside", () => {
  assert.deepEqual(clampBellPosition({ x: 900, y: 300 }, area), { x: area.right - BELL_SIZE, y: 300 });
  assert.deepEqual(clampBellPosition({ x: 0, y: 300 }, area), { x: area.left, y: 300 });
});

test("the bell can never go below the navigation bar", () => {
  const clamped = clampBellPosition({ x: 200, y: 900 }, area);
  assert.equal(clamped.y, area.bottom - BELL_SIZE);
  assert.ok(clamped.y + BELL_SIZE <= 700);
  assert.deepEqual(clampBellPosition({ x: 200, y: -50 }, area), { x: 200, y: area.top });
});

test("the default position is the bottom right of the area", () => {
  assert.deepEqual(defaultBellPosition(area), { x: 478, y: 648 });
});

test("the panel opens upward when the bell is in the lower half", () => {
  const placement = panelPlacement({ bell: { x: 478, y: 648 }, frame, area, viewportHeight: 700 });
  assert.equal(placement.width, 320);
  assert.equal(placement.left, 194);
  assert.equal(placement.bottom, 700 - 648 + 10);
  assert.equal(placement.top, undefined);
});

test("the panel opens downward when the bell is in the upper half", () => {
  const placement = panelPlacement({ bell: { x: 478, y: 20 }, frame, area, viewportHeight: 700 });
  assert.equal(placement.top, 20 + BELL_SIZE + 10);
  assert.equal(placement.bottom, undefined);
});

test("the panel never leaves the app frame, even when the frame is narrow", () => {
  const narrow = { left: 0, right: 300 };
  const narrowArea = movableArea(narrow, 700);
  const placement = panelPlacement({ bell: { x: 250, y: 600 }, frame: narrow, area: narrowArea, viewportHeight: 700 });
  assert.equal(placement.width, 276);
  assert.ok(placement.left >= 12);
  assert.ok(placement.left + placement.width <= 288);
});

test("the toast is centered in the app frame, just above the bottom navigation", () => {
  const placement = toastPlacement({ frame, area, viewportHeight: 760 });
  assert.equal(placement.left, 315);
  assert.equal(placement.maxWidth, 340);
  // 내비게이션 윗면(700)에서 12px 위에 토스트의 아래 끝이 놓임
  assert.equal(760 - placement.bottom, 700 - 12);
});

test("the toast shrinks to fit a narrow app frame", () => {
  const narrow = { left: 0, right: 300 };
  const placement = toastPlacement({ frame: narrow, area: movableArea(narrow, 700), viewportHeight: 760 });
  assert.equal(placement.maxWidth, 268);
  assert.equal(placement.left, 150);
});

test("the hint sits above a bell on the right side and is anchored to its right edge", () => {
  const placement = hintPlacement({ bell: { x: 478, y: 648 }, area, frame, viewportWidth: 640, viewportHeight: 700 });
  assert.equal(placement.anchorRight, true);
  assert.equal(placement.above, true);
  assert.equal(placement.x, 640 - (478 + BELL_SIZE + 4));
  assert.equal(placement.y, 700 - 648 + 12);
});

test("the hint is anchored to the left edge for a bell on the left side", () => {
  const placement = hintPlacement({ bell: { x: 120, y: 400 }, area, frame, viewportWidth: 640, viewportHeight: 700 });
  assert.equal(placement.anchorRight, false);
  assert.equal(placement.x, 116);
});

test("the hint goes below the bell when there is no room above", () => {
  const placement = hintPlacement({ bell: { x: 478, y: 20 }, area, frame, viewportWidth: 640, viewportHeight: 700 });
  assert.equal(placement.above, false);
  assert.equal(placement.y, 20 + BELL_SIZE + 12);
});
