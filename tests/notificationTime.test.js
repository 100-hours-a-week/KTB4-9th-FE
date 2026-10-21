import assert from "node:assert/strict";
import test from "node:test";
import { formatRelativeTime } from "../src/features/notification/notificationTime.js";

const NOW = Date.parse("2026-10-21T10:00:00Z");

test("a notification from under a minute ago is shown as just now", () => {
  assert.equal(formatRelativeTime("2026-10-21T09:59:40Z", NOW), "방금 전");
});

test("minutes, hours and days are rounded down", () => {
  assert.equal(formatRelativeTime("2026-10-21T09:50:00Z", NOW), "10분 전");
  assert.equal(formatRelativeTime("2026-10-21T07:00:00Z", NOW), "3시간 전");
  assert.equal(formatRelativeTime("2026-10-19T09:00:00Z", NOW), "2일 전");
});

test("an invalid time gives an empty text", () => {
  assert.equal(formatRelativeTime("not a date", NOW), "");
});
