import { useState } from "react";
import { useNavigate } from "react-router";
import { logoutCurrentUser } from "../../services/auth.js";

function formatDeletionDate(value) {
  if (!value) return "탈퇴 신청일로부터 30일 후";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "탈퇴 신청일로부터 30일 후";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function WithdrawalRecoveryModal({ user, onRecover }) {
  const navigate = useNavigate();
  const [busyAction, setBusyAction] = useState(null);
  const [error, setError] = useState("");
  const deletionDate = formatDeletionDate(user?.scheduledDeletionAt);

  async function handleKeepWithdrawal() {
    if (busyAction) return;
    setBusyAction("logout");
    setError("");
    try {
      await logoutCurrentUser();
      navigate("/login", { replace: true });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRecover() {
    if (busyAction) return;
    setBusyAction("recover");
    setError("");
    try {
      await onRecover();
      navigate("/", { replace: true });
    } catch {
      setError("탈퇴 신청을 취소하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-recovery-title"
        className="w-full max-w-sm rounded-[24px] border border-[var(--cosmos-border-strong)] bg-[var(--cosmos-surface)] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.48)]"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#A855F7]/35 bg-[#7C3AED]/15 text-[#C084FC]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12a8 8 0 1 0 2.34-5.66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-5 text-[10px] font-semibold tracking-[0.22em] text-[var(--cosmos-text-purple)]">ACCOUNT RECOVERY</p>
        <h1 id="withdrawal-recovery-title" className="mt-2 text-xl font-bold text-[var(--cosmos-text-primary)]">
          탈퇴 신청 중인 계정입니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--cosmos-text-secondary)]">
          계정과 학습 기록은 <strong className="text-[var(--cosmos-accent-text)]">{deletionDate}</strong> 완전히 삭제될 예정이에요.
        </p>
        <div className="mt-5 rounded-2xl border border-[#7C3AED]/25 bg-[#7C3AED]/10 px-4 py-4 text-left">
          <p className="text-sm font-semibold text-[var(--cosmos-text-primary)]">다시 COSMOS를 이용하시겠어요?</p>
          <p className="mt-1.5 text-xs leading-5 text-[var(--cosmos-text-muted)]">
            탈퇴를 취소하고 로그인하면 기존 문제와 학습 기록을 그대로 이어서 사용할 수 있어요.
          </p>
        </div>
        {error && <p role="alert" className="mt-4 text-left text-xs leading-5 text-[#FB7185]">{error}</p>}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleKeepWithdrawal}
            disabled={Boolean(busyAction)}
            className="min-h-12 rounded-xl border border-[var(--cosmos-border-strong)] px-3 text-xs font-semibold text-[var(--cosmos-text-secondary)] disabled:opacity-45"
          >
            {busyAction === "logout" ? "처리 중..." : "탈퇴 유지"}
          </button>
          <button
            type="button"
            onClick={handleRecover}
            disabled={Boolean(busyAction)}
            className="min-h-12 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-3 text-xs font-bold text-white shadow-[0_10px_28px_rgba(124,58,237,0.25)] disabled:opacity-45"
          >
            {busyAction === "recover" ? "복구 중..." : "탈퇴 취소하고 로그인"}
          </button>
        </div>
      </section>
    </div>
  );
}
