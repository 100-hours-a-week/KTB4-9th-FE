import { Navigate, Outlet, useLocation } from "react-router";
import BottomNavigation from "./BottomNavigation.jsx";
import { getStoredUser } from "../../services/auth.js";

export default function AppShell() {
  const location = useLocation();

  if (!getStoredUser()) {
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
