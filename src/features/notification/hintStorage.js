const HINT_SEEN_KEY = "cosmos_notification_hint_seen";

// 종을 옮길 수 있다는 말풍선을 이미 봤는지
export function hasSeenBellHint(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(HINT_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

// 말풍선을 봤다고 기억한다. (저장소를 쓸 수 없으면 조용히 넘어감)
export function markBellHintSeen(storage = globalThis.localStorage) {
  try {
    storage?.setItem(HINT_SEEN_KEY, "1");
  } catch {
    // 저장소를 쓸 수 없는 환경이면 다음에 한 번 더 보일 뿐이라 무시
  }
}
