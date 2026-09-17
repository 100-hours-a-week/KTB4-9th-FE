import { request } from "../api/httpClient.js";

const USER_KEY = "cosmos_user";

function normalizeUser(payload) {
  const source = payload?.data?.user ?? payload?.user ?? payload?.data ?? payload;

  return {
    id: source?.id == null ? null : String(source.id),
    name: source?.nickname ?? source?.name ?? "사용자",
    email: source?.email ?? "",
    profileImageUrl:
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
  const payload = await request("/api/v1/users/me");
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
