import { Navigate, Outlet, useLocation } from "react-router";
import CosmosLogo from "../common/CosmosLogo.jsx";
import BottomNavigation from "./BottomNavigation.jsx";
import { useAuthSession } from "../../features/auth/useAuthSession.js";

export default function AppShell() {
  const location = useLocation();
  const authStatus = useAuthSession();

  if (authStatus === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#05050F]">
        <div className="flex flex-col items-center gap-3 text-[#6B6890]">
          <CosmosLogo size={38} color="#C084FC" className="animate-pulse" />
          <span className="text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>로그인 확인 중...</span>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#05050F]" style={{ paddingTop: "var(--sat)" }}>
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
