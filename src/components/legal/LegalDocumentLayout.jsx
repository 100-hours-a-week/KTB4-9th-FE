import { useNavigate } from "react-router";
import CosmosLogo from "../common/CosmosLogo.jsx";

export function LegalSection({ number, title, children }) {
  return (
    <section className="rounded-2xl border border-[var(--cosmos-border)] bg-[var(--cosmos-surface)] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#7C3AED]/15 px-1.5 text-[10px] font-bold text-[var(--cosmos-accent-text)]">{number}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[var(--cosmos-text-primary)]">{title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--cosmos-text-secondary)]">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function LegalDocumentLayout({ eyebrow, title, description, effectiveDate, children }) {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto overscroll-contain bg-[var(--cosmos-background)] pb-12" style={{ WebkitOverflowScrolling: "touch" }}>
      <header className="sticky top-0 z-30 border-b border-[var(--cosmos-border)] bg-[var(--cosmos-background)]/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} aria-label="이전 화면" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--cosmos-border)] text-[var(--cosmos-text-secondary)] active:bg-[#7C3AED]/10">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-[var(--cosmos-text-purple)]">
            <CosmosLogo size={22} color="var(--cosmos-accent-text)" /> COSMOS
          </div>
          <span className="h-10 w-10" aria-hidden="true" />
        </div>
      </header>

      <main className="px-5 pt-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--cosmos-text-purple)]">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--cosmos-text-primary)]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--cosmos-text-secondary)]">{description}</p>
        <div className="mt-5 inline-flex rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10 px-3 py-1.5 text-[10px] font-semibold text-[var(--cosmos-accent-text)]">
          시행일 {effectiveDate}
        </div>

        <div className="mt-7 space-y-4">{children}</div>

        <footer className="mt-8 border-t border-[var(--cosmos-border)] pt-6 text-center text-[10px] leading-5 text-[var(--cosmos-text-muted)]">
          COSMOS · 나만의 알고리즘 튜터<br />본 문서는 서비스 정책 변경 시 업데이트될 수 있습니다.
        </footer>
      </main>
    </div>
  );
}
