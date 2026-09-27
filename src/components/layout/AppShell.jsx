import { Navigate, Outlet } from "react-router";
import BottomNavigation from "./BottomNavigation.jsx";
import AuthProvider from "../../features/auth/AuthProvider.jsx";
import { useAuthSession } from "../../features/auth/useAuthSession.js";

export default function AppShell() {
  const session = useAuthSession();

  if (session.status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#05050F]">
        <div className="h-9 w-9 animate-pulse rounded-full border border-[#7C3AED]/60 bg-[#7C3AED]/20" aria-label="로그인 상태 확인 중" />
      </div>
    );
  }

  if (session.status !== "authenticated") {
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
