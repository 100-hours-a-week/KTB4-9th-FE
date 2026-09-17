import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { clearStoredUser, getStoredUser } from "../../services/auth.js";

export default function UserMenu({ rounded = "rounded-xl", menuIcon = false }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const user = getStoredUser() || {};

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const handleLogout = () => {
    clearStoredUser();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" aria-label="사용자 메뉴" aria-expanded={open} onClick={() => setOpen((value) => !value)} className={`flex items-center justify-center ${menuIcon ? "h-12 w-12 border-[#252342] bg-[#0D0D1F]" : "h-9 w-9 border-[#7C3AED]/40 bg-[#7C3AED]/30"} ${rounded} border text-xs font-bold text-[#C084FC] transition-transform active:scale-95`} style={{ fontFamily: "'Outfit', sans-serif" }}>
        {menuIcon ? (
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
            <path d="M1 1h20M1 9h20M1 17h20" stroke="#A89EC4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (user.name || "?")[0]}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[200] min-w-[168px] overflow-hidden rounded-2xl border border-[#2A2845]" style={{ background: "#0F0E1E", boxShadow: "0 12px 40px rgba(0,0,0,0.85), 0 0 0 1px rgba(168,85,247,0.06)" }}>
          <div className="border-b border-[#1E1D35] px-4 py-3"><p className="text-sm font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>{user.name || "사용자"}</p><p className="mt-0.5 text-xs text-[#4A4870]" style={{ fontFamily: "'Outfit', sans-serif" }}>{user.email || ""}</p></div>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#F87171] transition-colors active:bg-[#1A0D1D]" style={{ fontFamily: "'Outfit', sans-serif" }}><svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>로그아웃</button>
        </div>
      )}
    </div>
  );
}
