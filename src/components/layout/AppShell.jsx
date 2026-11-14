import { Navigate, Outlet } from "react-router";
import BottomNavigation from "./BottomNavigation.jsx";
import WithdrawalRecoveryModal from "../auth/WithdrawalRecoveryModal.jsx";
import AuthProvider from "../../features/auth/AuthProvider.jsx";
import { useAuthSession } from "../../features/auth/useAuthSession.js";

const BATTLE_PREVIEWS = new Set(["top5", "grading-delayed"]);
const PREVIEW_HOSTS = new Set(["localhost", "127.0.0.1", "dev.cosmoscode.site"]);

function isBattlePreview() {
  if (typeof window === "undefined") return false;
  const preview = new URLSearchParams(window.location.search).get("preview");
  return window.location.pathname === "/daily-battles"
    && PREVIEW_HOSTS.has(window.location.hostname)
    && BATTLE_PREVIEWS.has(preview);
}

function AuthenticatedShell() {
  const session = useAuthSession();

  if (session.status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#05050F]">
        <div className="h-9 w-9 animate-pulse rounded-full border border-[#7C3AED]/60 bg-[#7C3AED]/20" aria-label="로그인 상태 확인 중" />
      </div>
    );
  }

  if (session.status !== "authenticated") {
    if (session.status === "withdrawal-pending") {
      return (
        <AuthProvider value={session}>
          <div className="h-full w-full bg-[var(--cosmos-background)]">
            <WithdrawalRecoveryModal user={session.user} onRecover={session.recoverWithdrawal} />
          </div>
        </AuthProvider>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthProvider value={session}>
      <div className="flex h-full w-full flex-col overflow-hidden bg-[#05050F]" style={{ paddingTop: "var(--sat)" }}>
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </AuthProvider>
  );
}

export default function AppShell() {
  if (isBattlePreview()) {
    return (
      <AuthProvider value={{ status: "authenticated", user: { id: "preview", name: "미리보기 사용자" } }}>
        <div className="flex h-full w-full flex-col overflow-hidden bg-[#05050F]" style={{ paddingTop: "var(--sat)" }}>
          <main className="relative min-h-0 flex-1 overflow-hidden">
            <Outlet />
          </main>
          <BottomNavigation />
        </div>
      </AuthProvider>
    );
  }

  return <AuthenticatedShell />;
}
