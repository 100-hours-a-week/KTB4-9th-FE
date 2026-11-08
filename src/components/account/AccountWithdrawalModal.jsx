import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { requestAccountWithdrawal } from "../../services/auth.js";

const CONFIRM_TEXT = "코스모스 탈퇴하기";

function WarningIcon() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FB7185]/35 bg-[#FB7185]/10 text-[#FB7185]">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10.3 4.2 2.7 17.3A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.7L13.7 4.2a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}

function SuccessIcon() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
      <svg width="31" height="31" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ModalShell({ children, labelledBy }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="w-full max-w-sm rounded-[24px] border border-[var(--cosmos-border-strong)] bg-[var(--cosmos-surface)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        {children}
      </section>
    </div>
  );
}

export default function AccountWithdrawalModal({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("notice");
  const [input, setInput] = useState("");
  const [submittedInput, setSubmittedInput] = useState(false);
  const [error, setError] = useState("");
  const matches = input === CONFIRM_TEXT;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && step !== "processing" && step !== "success") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, step]);

  async function handleWithdraw() {
    setSubmittedInput(true);
    if (!matches) return;
    setStep("processing");
    setError("");
    try {
      await requestAccountWithdrawal();
      setStep("success");
    } catch {
      setError("회원 탈퇴를 신청하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setStep("confirm");
    }
  }

  function finish() {
    navigate("/login", { replace: true });
  }

  if (step === "notice") {
    return (
      <ModalShell labelledBy="withdrawal-notice-title">
        <div className="text-center">
          <WarningIcon />
          <h2 id="withdrawal-notice-title" className="mt-5 text-xl font-bold text-[var(--cosmos-text-primary)]">정말 탈퇴하시겠어요?</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--cosmos-text-secondary)]">
            탈퇴를 신청하면 즉시 로그아웃되고 계정 이용이 중지됩니다.
          </p>
        </div>
        <div className="mt-5 space-y-2.5 rounded-2xl border border-[#FB7185]/20 bg-[#FB7185]/5 px-4 py-4">
          <p className="flex gap-2 text-xs leading-5 text-[var(--cosmos-text-secondary)]"><span className="text-[#FB7185]">•</span><span>계정과 학습 기록은 <strong className="text-[var(--cosmos-text-primary)]">탈퇴 신청 30일 후</strong> 완전히 삭제됩니다.</span></p>
          <p className="flex gap-2 text-xs leading-5 text-[var(--cosmos-text-secondary)]"><span className="text-[#C084FC]">•</span><span>삭제 전에는 카카오로 다시 로그인해 탈퇴 신청을 취소할 수 있습니다.</span></p>
          <p className="flex gap-2 text-xs leading-5 text-[var(--cosmos-text-secondary)]"><span className="text-[#6B6890]">•</span><span>30일이 지나 삭제된 계정과 기록은 복구할 수 없습니다.</span></p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onClose} className="min-h-12 rounded-xl border border-[var(--cosmos-border-strong)] text-sm font-semibold text-[var(--cosmos-text-secondary)]">취소</button>
          <button type="button" onClick={() => setStep("confirm")} className="min-h-12 rounded-xl bg-[#E11D48] text-sm font-bold text-white shadow-[0_10px_28px_rgba(225,29,72,0.22)]">계속하기</button>
        </div>
      </ModalShell>
    );
  }

  if (step === "processing") {
    return (
      <ModalShell labelledBy="withdrawal-processing-title">
        <div className="py-4 text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-[#2A2845] border-t-[#A855F7]" aria-hidden="true" />
          <h2 id="withdrawal-processing-title" className="mt-6 text-lg font-bold text-[var(--cosmos-text-primary)]">탈퇴 신청을 처리하고 있습니다</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--cosmos-text-muted)]">잠시만 기다려 주세요.<br />처리가 끝날 때까지 화면을 닫지 마세요.</p>
        </div>
      </ModalShell>
    );
  }

  if (step === "success") {
    return (
      <ModalShell labelledBy="withdrawal-success-title">
        <div className="text-center">
          <SuccessIcon />
          <h2 id="withdrawal-success-title" className="mt-5 text-xl font-bold text-[var(--cosmos-text-primary)]">탈퇴 신청이 완료되었습니다</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--cosmos-text-secondary)]">계정과 기록은 30일 후 완전히 삭제됩니다.</p>
          <p className="mt-2 text-xs leading-5 text-[var(--cosmos-text-muted)]">삭제 전 카카오로 다시 로그인하면<br />탈퇴 신청을 취소할 수 있어요.</p>
          <button type="button" onClick={finish} className="mt-6 min-h-12 w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-sm font-bold text-white shadow-[0_10px_28px_rgba(124,58,237,0.25)]">확인</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell labelledBy="withdrawal-confirm-title">
      <div className="text-center">
        <h2 id="withdrawal-confirm-title" className="text-xl font-bold text-[var(--cosmos-text-primary)]">회원 탈퇴를 최종 확인합니다</h2>
        <p className="mt-2 text-sm text-[var(--cosmos-text-muted)]">아래 문구를 정확히 입력해 주세요.</p>
      </div>
      <div className="mt-6 rounded-xl border border-[#7C3AED]/25 bg-[#7C3AED]/8 px-4 py-3 text-center font-semibold text-[var(--cosmos-accent-text)]">{CONFIRM_TEXT}</div>
      <label htmlFor="withdrawal-confirm-input" className="mt-4 block text-xs font-semibold text-[var(--cosmos-text-secondary)]">확인 문구 입력</label>
      <input
        id="withdrawal-confirm-input"
        value={input}
        onChange={(event) => { setInput(event.target.value); setSubmittedInput(false); }}
        autoComplete="off"
        className="withdraw-input mt-2 h-12 w-full rounded-xl border border-[var(--cosmos-border-strong)] bg-[var(--cosmos-surface-deep)] px-4 text-sm text-[var(--cosmos-text-primary)] focus:border-[#7C3AED]"
        placeholder={CONFIRM_TEXT}
      />
      {submittedInput && !matches && <p role="alert" className="mt-2 text-xs text-[#FB7185]">입력한 문구와 일치하지 않습니다.</p>}
      {error && <p role="alert" className="mt-2 text-xs leading-5 text-[#FB7185]">{error}</p>}
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onClose} className="min-h-12 rounded-xl border border-[var(--cosmos-border-strong)] text-sm font-semibold text-[var(--cosmos-text-secondary)]">취소</button>
        <button type="button" onClick={handleWithdraw} disabled={!matches} className="min-h-12 rounded-xl bg-[#E11D48] text-sm font-bold text-white shadow-[0_10px_28px_rgba(225,29,72,0.22)] disabled:cursor-not-allowed disabled:opacity-35">회원 탈퇴</button>
      </div>
    </ModalShell>
  );
}
