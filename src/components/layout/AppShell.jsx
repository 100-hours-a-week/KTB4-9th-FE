import { Outlet } from "react-router";
import BottomNavigation from "./BottomNavigation.jsx";
import AuthProvider from "../../features/auth/AuthProvider.jsx";
import { useAuthSession } from "../../features/auth/useAuthSession.js";

export default function AppShell() {
  const session = useAuthSession();

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
