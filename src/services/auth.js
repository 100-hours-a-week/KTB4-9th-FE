import { request } from "../api/httpClient.js";

const USER_KEY = "cosmos_user";

function normalizeUser(payload) {
  const source = payload?.data?.user ?? payload?.user ?? payload?.data ?? payload;
  const accountStatus = source?.accountStatus ?? source?.account_status ?? "ACTIVE";

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
    accountStatus,
    withdrawalPending:
      source?.withdrawalPending === true ||
      source?.withdrawal_pending === true ||
      accountStatus === "WITHDRAWAL_PENDING",
    withdrawalRequestedAt:
      source?.withdrawalRequestedAt ??
      source?.withdrawal_requested_at ??
      source?.deletedAt ??
      source?.deleted_at ??
      null,
    scheduledDeletionAt:
      source?.scheduledDeletionAt ??
      source?.scheduled_deletion_at ??
      source?.deletionScheduledAt ??
      source?.deletion_scheduled_at ??
      null,
  };
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
    await request("/auth/logout", {
      method: "POST",
      skipAuthRefresh: true,
    });
  } catch (error) {
    console.warn("서버 로그아웃 요청에 실패해 로컬 로그인 정보만 정리합니다.", error);
  } finally {
    clearStoredUser();
  }
}

export async function requestAccountWithdrawal() {
  const payload = await request("/auth/me", {
    method: "DELETE",
  });
  clearStoredUser();
  return payload?.data ?? payload ?? null;
}

export async function cancelAccountWithdrawal() {
  const payload = await request("/auth/withdrawal/cancel", {
    method: "POST",
    skipAuthRefresh: true,
  });
  return payload?.data ?? payload ?? null;
}
