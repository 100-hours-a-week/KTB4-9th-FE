import assert from "node:assert/strict";
import test from "node:test";
import {
  FAST_POLL_INTERVAL_MS,
  MAX_BACKOFF_MS,
  POLL_INTERVAL_MS,
  hasNewUnread,
  maxNotificationId,
  nextPollDelay,
} from "../src/features/notification/notificationPolling.js";

test("polls at the normal interval when nothing special is happening", () => {
  assert.equal(nextPollDelay({ failures: 0, fastUntil: 0, now: 1000 }), POLL_INTERVAL_MS);
});

test("polls faster only while the fast period after a submission lasts", () => {
  assert.equal(nextPollDelay({ failures: 0, fastUntil: 5000, now: 1000 }), FAST_POLL_INTERVAL_MS);
  assert.equal(nextPollDelay({ failures: 0, fastUntil: 5000, now: 5000 }), POLL_INTERVAL_MS);
});

test("backs off after consecutive failures and stops at the cap", () => {
  assert.equal(nextPollDelay({ failures: 1, fastUntil: 0, now: 0 }), 20_000);
  assert.equal(nextPollDelay({ failures: 2, fastUntil: 0, now: 0 }), 40_000);
  assert.equal(nextPollDelay({ failures: 3, fastUntil: 0, now: 0 }), MAX_BACKOFF_MS);
  assert.equal(nextPollDelay({ failures: 10, fastUntil: 0, now: 0 }), MAX_BACKOFF_MS);
});

test("failures win over the fast period", () => {
  assert.equal(nextPollDelay({ failures: 1, fastUntil: 99_999, now: 0 }), 20_000);
});

test("maxNotificationId keeps the largest id seen", () => {
  assert.equal(maxNotificationId([{ id: 3 }, { id: 9 }, { id: 5 }], null), 9);
  assert.equal(maxNotificationId([{ id: 3 }], 7), 7);
  assert.equal(maxNotificationId([], null), 0);
});

test("hasNewUnread is true only for an unread notification newer than the known one", () => {
  assert.equal(hasNewUnread(5, [{ id: 6, isRead: false }]), true);
  assert.equal(hasNewUnread(5, [{ id: 6, isRead: true }]), false);
  assert.equal(hasNewUnread(5, [{ id: 5, isRead: false }, { id: 4, isRead: false }]), false);
  assert.equal(hasNewUnread(5, []), false);
});
