import { request } from "../api/httpClient.js";

const USER_KEY = "cosmos_user";

function normalizeUser(payload) {
  const source = payload?.data?.user ?? payload?.user ?? payload?.data ?? payload;

  return {
    id: source?.userId == null ? null : String(source.userId),
    name: source?.userName ?? source?.username ?? "사용자",
    profileImageUrl:
      source?.userProfileImageUrl ??
      source?.profileImageUrl ??
      source?.profile_image_url ??
      source?.thumbnailImageUrl ??
      source?.thumbnail_image_url ??
      null,
  };
}

export function getStoredUser() {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
}

export async function fetchCurrentUser() {
  const payload = await request("/auth/me");
  return normalizeUser(payload);
}

export async function logoutCurrentUser() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("서버 로그아웃 요청에 실패해 로컬 로그인 정보만 정리합니다.", error);
  } finally {
    clearStoredUser();
  }
}
