import assert from "node:assert/strict";
import test from "node:test";
import { hasSeenBellHint, markBellHintSeen } from "../src/features/notification/hintStorage.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("the hint has not been seen at first and is remembered once it is", () => {
  const storage = createStorage();
  assert.equal(hasSeenBellHint(storage), false);
  markBellHintSeen(storage);
  assert.equal(hasSeenBellHint(storage), true);
});

test("an unusable storage never throws", () => {
  const broken = {
    getItem: () => { throw new Error("blocked"); },
    setItem: () => { throw new Error("blocked"); },
  };
  assert.equal(hasSeenBellHint(broken), false);
  assert.doesNotThrow(() => markBellHintSeen(broken));
  assert.equal(hasSeenBellHint(undefined), false);
});
