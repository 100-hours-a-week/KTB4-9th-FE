import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../features/auth/authContext.js";
import { logoutCurrentUser } from "../../services/auth.js";
import AccountWithdrawalModal from "../account/AccountWithdrawalModal.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";

export default function UserMenu({ rounded = "rounded-xl", menuIcon = false, accountMenu = false }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const user = currentUser || {};

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCurrentUser();
      setOpen(false);
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const moveToDocument = (path) => {
    setOpen(false);
    navigate(path);
  };

  const openWithdrawal = () => {
    setOpen(false);
    setWithdrawalOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" aria-label="사용자 메뉴" aria-expanded={open} onClick={() => setOpen((value) => !value)} className={`flex items-center justify-center overflow-hidden ${menuIcon ? "h-12 w-12 border-transparent bg-transparent" : "h-9 w-9 border-[#7C3AED]/40 bg-[#7C3AED]/30"} ${rounded} border text-xs font-bold text-[#C084FC] transition-transform active:scale-95`} style={{ fontFamily: "'Outfit', sans-serif" }}>
        {menuIcon ? (
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
            <path d="M1 1h20M1 9h20M1 17h20" stroke="var(--cosmos-text-secondary)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <ProfileAvatar
            src={user.profileImageUrl}
            name={user.name}
            className="h-full w-full rounded-[inherit] object-cover"
          />
        )}
      </button>
      {open && (
        <div className={`absolute right-0 top-12 z-[200] overflow-hidden rounded-2xl border border-[var(--cosmos-border-strong)] ${accountMenu ? "w-[180px]" : "min-w-[168px]"}`} style={{ background: "var(--cosmos-popover)", boxShadow: "0 12px 40px rgba(37,24,61,0.22), 0 0 0 1px rgba(168,85,247,0.06)" }}>
          <div className="flex items-center gap-3 border-b border-[#1E1D35] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#7C3AED]/25 text-xs font-bold text-[#C084FC]">
              <ProfileAvatar
                src={user.profileImageUrl}
                name={user.name}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>{user.name || "사용자"}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[var(--cosmos-text-secondary)] transition-colors active:bg-[#7C3AED]/10 disabled:opacity-50" style={{ fontFamily: "'Outfit', sans-serif" }}><svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>{loggingOut ? "로그아웃 중..." : "로그아웃"}</button>
          {accountMenu && (
            <>
              <button type="button" onClick={openWithdrawal} className="flex w-full items-center gap-2.5 border-t border-[var(--cosmos-border)] bg-[#E11D48]/8 px-4 py-3 text-sm text-[#FB7185] transition-colors active:bg-[#E11D48]/15" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.5 2H3.3A1.3 1.3 0 0 0 2 3.3v9.4A1.3 1.3 0 0 0 3.3 14h3.2M10.5 11.5 14 8l-3.5-3.5M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                회원 탈퇴
              </button>
              <div className="border-t border-[var(--cosmos-border)] py-1.5">
                <button type="button" onClick={() => moveToDocument("/privacy")} className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-[var(--cosmos-text-muted)] active:bg-[#7C3AED]/8">
                  개인정보처리방침
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" onClick={() => moveToDocument("/terms")} className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-[var(--cosmos-text-muted)] active:bg-[#7C3AED]/8">
                  이용약관
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {withdrawalOpen && <AccountWithdrawalModal onClose={() => setWithdrawalOpen(false)} />}
    </div>
  );
}
