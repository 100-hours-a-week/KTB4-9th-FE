import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_BACKOFF_MS,
  PENDING_POLL_INTERVAL_MS,
  hasNewUnread,
  maxNotificationId,
  nextPollDelay,
} from "../src/features/notification/notificationPolling.js";

test("stops polling when no evaluation is pending", () => {
  assert.equal(nextPollDelay({ failures: 0, hasPending: false }), null);
});

test("polls fast while an evaluation is pending", () => {
  assert.equal(nextPollDelay({ failures: 0, hasPending: true }), PENDING_POLL_INTERVAL_MS);
});

test("does not poll notifications while the result is awaited on the solve screen", () => {
  assert.equal(nextPollDelay({ failures: 0, hasPending: true, enabled: false }), null);
});

test("backs off after consecutive failures and stops at the cap", () => {
  assert.equal(nextPollDelay({ failures: 1, hasPending: false }), 20_000);
  assert.equal(nextPollDelay({ failures: 2, hasPending: false }), 40_000);
  assert.equal(nextPollDelay({ failures: 3, hasPending: false }), MAX_BACKOFF_MS);
  assert.equal(nextPollDelay({ failures: 10, hasPending: false }), MAX_BACKOFF_MS);
});

test("failures win over a pending evaluation", () => {
  assert.equal(nextPollDelay({ failures: 1, hasPending: true }), 20_000);
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
