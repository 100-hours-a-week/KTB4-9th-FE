import { useState } from "react";
import { useNavigate } from "react-router";
import CosmosLogo from "../components/common/CosmosLogo.jsx";
import MathText from "../components/common/MathText.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ProfileAvatar from "../components/common/ProfileAvatar.jsx";
import UserMenu from "../components/common/UserMenu.jsx";
import { useAuth } from "../features/auth/authContext.js";
import {
  formatBattleTime,
  useDailyBattlePage,
} from "../features/daily-battle/useDailyBattlePage.js";

const FONT = { fontFamily: "'Outfit', sans-serif" };
const MONO = { fontFamily: "'JetBrains Mono', monospace" };

function BattleBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ background: "radial-gradient(ellipse 80% 32% at 50% 0%, rgba(124,58,237,0.14), transparent 65%)" }}
    />
  );
}

function BattleLogo() {
  return (
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#7C3AED]/40 bg-[#121126] shadow-[0_18px_55px_rgba(124,58,237,0.24)]">
      <CosmosLogo size={48} color="var(--cosmos-accent-text)" />
    </div>
  );
}

function CenterState({ eyebrow = "DAILY BATTLE", title, description, time, action, busy = false }) {
  return (
    <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-10 text-center">
      <section className="flex w-full max-w-sm flex-col items-center">
        <BattleLogo />
        <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#8B7FC4]" style={MONO}>{eyebrow}</p>
        <h1 className="text-2xl font-bold text-[#F2F0FA]" style={FONT}>{title}</h1>
        {description && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#8B87AA]" style={FONT}>{description}</p>}
        {time != null && (
          <div className="mt-6 rounded-2xl border border-[#2A2845] bg-[#0D0D1F] px-7 py-4">
            <p className="mb-1 text-[9px] tracking-[0.2em] text-[#6B6890]" style={MONO}>COUNTDOWN</p>
            <p className="text-3xl font-bold tracking-wider text-[#C084FC]" style={MONO}>{formatBattleTime(time)}</p>
          </div>
        )}
        {busy && <div className="mt-7 h-1.5 w-36 overflow-hidden rounded-full bg-[#1E1D35]"><div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7]" /></div>}
        {action && <div className="mt-7 w-full">{action}</div>}
      </section>
    </div>
  );
}

function ErrorButton({ onClick, children = "다시 시도" }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-xl border border-[#7C3AED]/45 bg-[#7C3AED]/15 px-4 py-3 text-sm font-semibold text-[#C084FC] active:scale-[0.98]">
      {children}
    </button>
  );
}

function AccessDeniedState({
  eyebrow = "BATTLE ACCESS",
  title = "배틀에 참여할 수 없어요",
  description = "배틀 참여 시간과 주소를 다시 확인해 주세요.",
  showBattleGuide = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-10">
      <section className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#7C3AED]/35 bg-[#121126] shadow-[0_18px_55px_rgba(124,58,237,0.2)]">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
            <path d="M21 4.5 35 10v9.7c0 8.3-5.2 14.8-14 18-8.8-3.2-14-9.7-14-18V10l14-5.5Z" stroke="var(--cosmos-accent-text)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M21 13v9" stroke="var(--cosmos-accent-text)" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="21" cy="28" r="1.5" fill="var(--cosmos-accent-text)" />
          </svg>
        </div>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#8B7FC4]" style={MONO}>{eyebrow}</p>
        <h1 className="text-2xl font-bold text-[#F2F0FA]" style={FONT}>{title}</h1>
        <p className="mx-auto mt-3 max-w-[290px] whitespace-pre-line text-sm leading-6 text-[#8B87AA]" style={FONT}>{description}</p>

        <div className="mt-7 rounded-2xl border border-[#2A2845] bg-[#0D0D1F] px-4 py-3.5 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#7C3AED]/15 text-[#C084FC]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold text-[#E2E0F0]">배틀 참여 안내</p>
              <p className="mt-1 text-[11px] leading-5 text-[#6B6890]">데일리 배틀은 12:50–12:59:59에 참여할 수 있으며, 배틀 페이지 진입 시 자동으로 참여가 시작됩니다.</p>
            </div>
          </div>
        </div>

        <div className={`mt-5 ${showBattleGuide ? "grid grid-cols-2 gap-2" : ""}`}>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="min-h-11 w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-3 py-3 text-xs font-bold text-white shadow-[0_10px_24px_rgba(124,58,237,0.2)] active:scale-[0.98]"
          >
            홈으로 돌아가기
          </button>
          {showBattleGuide && (
            <button
              type="button"
              onClick={() => navigate("/daily-battles", { replace: true })}
              className="min-h-11 w-full rounded-xl border border-[#2A2845] px-3 py-3 text-xs font-bold text-[#A89EC4] active:bg-[#12121F]"
            >
              배틀 페이지로 돌아가기
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function BattleForm({ battle, answers, remainingSeconds, errorMessage, canSubmit, submitting, droppingOut, onAnswer, onSubmit, onDropOut }) {
  const [dialogType, setDialogType] = useState(null);
  const malformed = battle.cases.length !== 3;

  const confirmSubmit = async () => {
    setDialogType(null);
    await onSubmit();
  };

  const confirmDropOut = async () => {
    setDialogType(null);
    await onDropOut();
  };

  return (
    <div className="relative z-10 h-full min-h-0 overflow-y-auto overscroll-contain pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
      <PageHeader
        eyebrow="Daily Battle"
        title="오늘의 배틀"
        subtitle="세 문제의 답을 모두 작성해 한 번에 제출하세요"
        action={<UserMenu />}
      />

      <div className="px-5 pb-6">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-4 py-3">
          <div>
            <p className="text-[9px] tracking-widest text-[#8B7FC4]" style={MONO}>SUBMISSION TIME LEFT</p>
            <p className="mt-0.5 text-[11px] text-[#6B6890]">12:59:59 제출 마감</p>
          </div>
          <p className={`text-2xl font-bold tracking-wider ${remainingSeconds <= 60 ? "text-[#F87171]" : "text-[#C084FC]"}`} style={MONO}>
            {formatBattleTime(remainingSeconds)}
          </p>
        </div>

        <section className="mb-4 rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
          <div className="mb-3 flex items-center gap-2">
            {battle.category && <span className="rounded-full border border-[#7C3AED]/35 bg-[#7C3AED]/15 px-2.5 py-1 text-[10px] font-semibold text-[#C084FC]">{battle.category}</span>}
            <span className="text-[10px] text-[#4A4870]" style={MONO}>{battle.battleDate}</span>
          </div>
          <h2 className="text-lg font-bold text-[#E2E0F0]" style={FONT}>{battle.title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#A89EC4]" style={FONT}><MathText text={battle.content} /></p>
        </section>

        <div className="space-y-3">
          {battle.cases.map((battleCase) => (
            <section key={battleCase.displayOrder} className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#E2E0F0]">문제 {battleCase.displayOrder}</h3>
                <span className="text-[9px] tracking-widest text-[#4A4870]" style={MONO}>OUTPUT</span>
              </div>
              <div className="mb-3 rounded-xl border border-[#1E1D35] bg-[#06060E] p-3">
                <p className="mb-1 text-[9px] text-[#6B6890]" style={MONO}>입력</p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-[#C8B8F8]" style={MONO}>{battleCase.input}</pre>
              </div>
              <label className="sr-only" htmlFor={`battle-answer-${battleCase.displayOrder}`}>문제 {battleCase.displayOrder} 정답</label>
              <textarea
                id={`battle-answer-${battleCase.displayOrder}`}
                value={answers[battleCase.displayOrder] ?? ""}
                onChange={(event) => onAnswer(battleCase.displayOrder, event.target.value)}
                rows={2}
                spellCheck={false}
                placeholder="출력값을 입력하세요"
                className="w-full resize-none rounded-xl border border-[#2A2845] bg-[#080814] px-3 py-2.5 text-xs leading-5 text-[#E2E0F0] placeholder:text-[#3A3860] focus:border-[#7C3AED]/70"
                style={MONO}
              />
            </section>
          ))}
        </div>

        {malformed && <p className="mt-3 text-center text-xs text-[#F87171]">배틀 문제 3개가 모두 준비되지 않았습니다.</p>}
        {errorMessage && <p role="alert" className="mt-3 text-center text-xs text-[#F87171]">{errorMessage}</p>}

        <div className="mt-5 rounded-xl border border-[#2A2845] bg-[#121126] px-4 py-3 text-[11px] leading-5 text-[#8B87AA]">
          제출은 한 번만 가능하며, 제출 후에는 답안을 수정하거나 다시 제출할 수 없습니다.
        </div>
        <button
          type="button"
          disabled={!canSubmit || malformed}
          onClick={() => setDialogType("submit")}
          className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,58,237,0.24)] active:scale-[0.98] disabled:opacity-40"
        >
          {submitting ? "제출 중..." : "3문제 답안 제출하기"}
        </button>
        <button
          type="button"
          disabled={submitting || droppingOut}
          onClick={() => setDialogType("drop-out")}
          className="mt-2 w-full rounded-2xl border border-[#2A2845] py-3 text-xs font-semibold text-[#8B87AA] active:bg-[#12121F] disabled:opacity-40"
        >
          {droppingOut ? "포기 처리 중..." : "중도 포기"}
        </button>
      </div>

      {dialogType && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/65 px-6">
          <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-[#2A2845] bg-[#0D0D1F] p-5">
            <h3 className="text-lg font-bold text-[#E2E0F0]">{dialogType === "submit" ? "답안을 제출할까요?" : "배틀을 포기할까요?"}</h3>
            <p className="mt-2 text-sm leading-6 text-[#8B87AA]">
              {dialogType === "submit" ? "제출 후에는 답안을 바꾸거나 다시 제출할 수 없습니다." : "포기하면 다시 답안을 제출할 수 없으며 순위에도 포함되지 않습니다."}
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setDialogType(null)} className="flex-1 rounded-xl border border-[#2A2845] py-3 text-sm font-semibold text-[#A89EC4]">계속 풀기</button>
              <button type="button" onClick={dialogType === "submit" ? confirmSubmit : confirmDropOut} className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white ${dialogType === "submit" ? "bg-[#7C3AED]" : "bg-[#BE123C]"}`}>
                {dialogType === "submit" ? "제출하기" : "포기하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatElapsed(seconds) {
  if (seconds == null) return "-";
  const value = Math.max(0, Math.floor(Number(seconds)));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const remain = value % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

function BlurredResultPreview() {
  return (
    <div className="pointer-events-none space-y-4 select-none" aria-hidden="true" style={{ filter: "blur(6px)", opacity: 0.58 }}>
      <section className="flex items-center gap-3 rounded-2xl border border-[#7C3AED]/35 bg-[#7C3AED]/10 px-4 py-4">
        <div className="min-w-[54px] border-r border-[#2A2845] pr-3">
          <p className="text-[9px] text-[#6B6890]">내 순위</p>
          <p className="mt-1 text-2xl font-bold text-[#C084FC]">2위</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-3 w-24 rounded-full bg-[#C8B8F8]" />
          <div className="mt-2 h-2 w-14 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-semibold text-[#E2E0F0]" style={MONO}>00:42</span>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#1E1D35] bg-[#0D0D1F]">
        <div className="flex items-center gap-2 border-b border-[#1E1D35] px-4 py-3">
          <span className="text-[#C084FC]">★</span>
          <h3 className="text-sm font-semibold text-[#E2E0F0]">TOP 5 랭킹</h3>
        </div>
        <div className="divide-y divide-[#1E1D35]">
          {[1, 2, 3, 4, 5].map((rank) => (
            <div key={rank} className="flex items-center gap-3 px-4 py-3">
              <span className={`w-7 text-center font-bold ${rank <= 3 ? "text-xl text-[#E2E0F0]" : "text-sm text-[#8B87AA]"}`}>{rank}</span>
              <div className="h-3 flex-1 rounded-full bg-[#A89EC4]" />
              <span className="text-[11px] text-[#A89EC4]" style={MONO}>0{rank}:2{rank}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#E2E0F0]">정답 확인</h3>
        <div className="space-y-2">
          {[1, 2].map((order) => (
            <div key={order} className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] text-[#6B6890]">케이스 {order}</span>
                <span className="text-[10px] font-semibold text-emerald-400">✓ 정답</span>
              </div>
              <div className="h-2.5 w-3/4 rounded-full bg-[#8B87AA]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PendingBattleResult({ battle, remainingSeconds }) {
  return (
    <div className="relative z-10 h-full min-h-0 overflow-y-auto overscroll-contain pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
      <PageHeader eyebrow="오늘의 배틀" title={battle?.title ?? "오늘의 데일리 배틀"} />
      <div className="space-y-5 px-5 pb-6">
        <section className="flex items-center gap-4 rounded-2xl border border-[#7C3AED]/40 bg-[#7C3AED]/10 px-4 py-4 shadow-[0_14px_36px_rgba(124,58,237,0.12)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/25 text-[#C084FC]">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-[#E2E0F0]">배틀 진행 중</h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold tracking-wider text-[#C084FC]" style={MONO}>{formatBattleTime(remainingSeconds)}</p>
            <p className="mt-1 text-[10px] text-[#6B6890]">후 결과 공개</p>
          </div>
        </section>

        <div className="relative overflow-hidden rounded-2xl">
          <BlurredResultPreview />
          <div className="absolute inset-x-5 top-16 flex justify-center">
            <span className="rounded-full border border-[#7C3AED]/35 bg-[#0D0D1F]/90 px-4 py-2 text-[11px] font-semibold text-[#C084FC] shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm">
              배틀 마감 후 결과가 공개됩니다
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const INCOMPLETE_STATUS = {
  DROPPED_OUT: "중도 이탈한 배틀은 순위에 반영되지 않습니다.",
  TIME_OVER: "제출 시간이 초과되어 순위에 반영되지 않습니다.",
  GRADING_FAILED: "채점 중 문제가 발생했습니다. 오답으로 처리된 것은 아닙니다.",
};

function BattleResultHeader({ result }) {
  return (
    <header className="px-5 pt-12 pb-4">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_5px_rgba(168,85,247,0.9)]" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--battle-muted)]" style={MONO}>오늘의 배틀 종료</span>
      </div>
      <h1 className="text-xl font-bold leading-tight text-[var(--battle-text)]" style={FONT}>{result?.title ?? "오늘의 데일리 배틀"}</h1>
      {result?.battle_date && <p className="mt-1.5 text-xs leading-relaxed text-[var(--battle-muted)]" style={MONO}>{result.battle_date}</p>}
    </header>
  );
}

function ResultRankings({ rankings, currentUserId }) {
  if (rankings.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-[22px] border border-[var(--battle-border)] bg-[var(--battle-surface)] shadow-[var(--battle-card-shadow)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--battle-border)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-base text-[var(--battle-gold)]">★</span>
          <h3 className="shrink-0 text-sm font-bold text-[var(--battle-text)]">TOP 5 랭킹</h3>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-[var(--battle-muted)]">전체 정답자만 집계</span>
      </div>
      <div className="divide-y divide-[var(--battle-divider)]">
        {rankings.map((entry) => {
          const mine = currentUserId != null && String(entry.user_id) === String(currentUserId);
          const medal = ["🥇", "🥈", "🥉"][entry.rank - 1];
          return (
            <div key={`${entry.rank}-${entry.user_id}`} className={`flex min-h-16 items-center gap-3 px-5 py-3.5 ${mine ? "bg-[var(--battle-row-highlight)]" : "bg-[var(--battle-surface)]"}`}>
              <span className={`w-9 shrink-0 text-center font-bold ${entry.rank <= 3 ? "text-lg text-[var(--battle-text)]" : "text-sm text-[var(--battle-muted)]"}`}>
                {medal ?? entry.rank}
              </span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--battle-accent-box)] text-xs font-bold text-[var(--cosmos-accent-text)]">
                <ProfileAvatar
                  src={entry.profile_image_url ?? entry.profileImageUrl}
                  name={entry.name}
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
              <p className={`min-w-0 flex-1 truncate text-sm font-semibold ${mine ? "text-[var(--cosmos-accent-text)]" : "text-[var(--battle-text-secondary)]"}`}>
                {entry.name}{mine && <span className="ml-1.5 text-[10px] font-medium text-[var(--battle-muted)]">나</span>}
              </p>
              <span className={`text-xs font-bold tracking-wide ${entry.rank === 1 ? "text-[var(--battle-gold)]" : mine ? "text-[var(--cosmos-accent-text)]" : "text-[var(--battle-muted)]"}`} style={MONO}>{formatElapsed(entry.elapsed_seconds)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EmptyBattleResult({ result }) {
  const navigate = useNavigate();

  return (
    <div className="battle-result-theme relative z-10 h-full min-h-0 overflow-y-auto overscroll-contain bg-[var(--battle-bg)] pb-10" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
      <BattleResultHeader result={result} />
      <div className="px-5 pt-5">
        <section className="rounded-[24px] border border-[var(--battle-border)] bg-[var(--battle-surface)] px-6 py-9 text-center shadow-[var(--battle-card-shadow)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] border border-[var(--battle-border-strong)] bg-[var(--battle-surface-soft)]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect x="6" y="23" width="7" height="9" rx="2" fill="#6B6890" />
              <rect x="16.5" y="15" width="7" height="17" rx="2" fill="#7C3AED" />
              <rect x="27" y="19" width="7" height="13" rx="2" fill="#A855F7" />
              <path d="M5 34h30" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-6 text-[10px] font-semibold tracking-[0.25em] text-[var(--battle-muted)]" style={MONO}>NO PARTICIPANTS</p>
          <h2 className="mt-2 text-xl font-bold text-[var(--battle-text)]">이번 배틀에는 참여자가 없어요</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--battle-muted)]">오늘의 TOP 5는 비어 있습니다.<br />다음 배틀에서 첫 번째 기록을 남겨보세요!</p>
          <div className="mx-auto mt-6 flex max-w-[250px] items-center justify-center gap-2 rounded-xl border border-[#7C3AED]/25 bg-[#7C3AED]/10 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="text-xs font-semibold text-[#C084FC]">매일 12:50 배틀 시작</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_24px_rgba(124,58,237,0.2)] active:scale-[0.98]"
          >
            홈으로 돌아가기
          </button>
        </section>
      </div>
    </div>
  );
}

function BattleResult({ result }) {
  const { user } = useAuth();
  const mine = result?.my_result;
  const status = mine?.participation_status;
  const completed = status === "GRADING_COMPLETED";
  const incompleteMessage = INCOMPLETE_STATUS[status];
  const rankings = result?.top5_rankings ?? [];
  const answers = mine?.answers ?? [];

  if (!mine && rankings.length === 0) {
    return <EmptyBattleResult result={result} />;
  }

  return (
    <div className="battle-result-theme relative z-10 h-full min-h-0 overflow-y-auto overscroll-contain bg-[var(--battle-bg)] pb-10" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y", overscrollBehaviorY: "contain" }}>
      <BattleResultHeader result={result} />
      <div className="space-y-4 px-5 pb-8">
        {!mine && (
          <section className="rounded-[22px] border border-[var(--battle-border-strong)] bg-[var(--battle-surface-soft)] px-5 py-5 shadow-[var(--battle-soft-shadow)]">
            <h2 className="text-base font-bold text-[var(--battle-text)]">이번 배틀에 참여하지 않았어요</h2>
            <p className="mt-1.5 text-xs text-[var(--battle-muted)]">다음 배틀에 도전해 보세요.</p>
          </section>
        )}

        {mine && incompleteMessage && (
          <section className="rounded-[22px] border border-[var(--battle-border-strong)] bg-[var(--battle-surface-soft)] px-5 py-5 shadow-[var(--battle-soft-shadow)]">
            <h2 className="text-base font-bold text-[var(--battle-text)]">배틀을 완료하지 못했어요</h2>
            <p className="mt-1.5 text-xs leading-5 text-[var(--battle-muted)]">{incompleteMessage}</p>
          </section>
        )}

        {mine && completed && (
          <section className="flex items-center gap-4 rounded-[22px] border border-[var(--battle-accent-border)] bg-[var(--battle-accent-surface)] px-5 py-5 shadow-[var(--battle-accent-shadow)]">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--battle-accent-box)] text-2xl font-black text-[var(--cosmos-accent-text)] shadow-[inset_0_0_0_1px_rgba(124,58,237,0.12)]" style={MONO}>
              {mine.my_rank == null ? "✓" : `#${mine.my_rank}`}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-[var(--battle-text)]">{mine.my_rank == null ? "배틀 완료" : `${mine.my_rank}위 달성!`}</p>
              <p className="mt-1 text-[11px] text-[var(--battle-muted)]">{user?.name || "사용자"} · {mine.all_correct ? "전체 정답" : "오답 포함"}</p>
              {mine.elapsed_seconds != null && <p className="mt-1 text-xs font-bold text-[var(--cosmos-accent-text)]" style={MONO}>기록 {formatElapsed(mine.elapsed_seconds)}</p>}
            </div>
          </section>
        )}

        <ResultRankings rankings={rankings} currentUserId={user?.id} />

        {answers.length > 0 && (
          <section className="rounded-[22px] border border-[var(--battle-border)] bg-[var(--battle-surface)] p-4 shadow-[var(--battle-card-shadow)]">
            <div className="mb-4 flex items-center gap-2 px-1">
              <span className="h-2 w-2 rounded-full bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              <h3 className="text-sm font-bold text-[var(--battle-text)]">내 답안 확인</h3>
            </div>
            <div className="space-y-3">
              {answers.map((answer) => (
                <div key={answer.battle_case_id} className={`rounded-2xl border bg-[var(--battle-answer-bg)] p-4 ${answer.is_correct ? "border-[var(--battle-correct-border)]" : "border-[var(--battle-wrong-border)]"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider text-[var(--battle-muted)]" style={MONO}>CASE {answer.display_order}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${answer.is_correct ? "bg-[var(--battle-correct-bg)] text-[var(--battle-correct-text)]" : "bg-[var(--battle-wrong-bg)] text-[var(--battle-wrong-text)]"}`}>{answer.is_correct ? "✓ 정답" : "× 오답"}</span>
                  </div>
                  <div className="grid grid-cols-[46px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[11px] leading-5">
                    <span className="text-[var(--battle-subtle)]">입력</span><pre className="min-w-0 whitespace-pre-wrap break-words text-[var(--battle-text-secondary)]" style={MONO}>{answer.input}</pre>
                    <span className="text-[var(--battle-subtle)]">정답</span><pre className="min-w-0 whitespace-pre-wrap break-words font-semibold text-[var(--battle-answer-text)]" style={MONO}>{answer.expected_output}</pre>
                    <span className="text-[var(--battle-subtle)]">내 답</span><pre className={`min-w-0 whitespace-pre-wrap break-words font-bold ${answer.is_correct ? "text-[var(--battle-correct-text)]" : "text-[var(--battle-wrong-text)]"}`} style={MONO}>{answer.submitted_output || "-"}</pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="py-6 text-center text-[11px] text-[var(--battle-subtle)]">내일 또 다른 문제가 기다리고 있어요</p>
      </div>
    </div>
  );
}

export default function BattlePage() {
  const {
    accessIssue,
    alarm,
    answers,
    battle,
    canSubmit,
    droppingOut,
    errorMessage,
    phase,
    remainingSeconds,
    result,
    submitting,
    untilOpenSeconds,
    dropOut,
    load,
    retryResult,
    submit,
    updateAnswer,
  } = useDailyBattlePage();

  let content;
  if (phase === "result-loading") {
    content = <CenterState eyebrow="BATTLE RESULT" title="배틀 결과를 불러오고 있어요" description="잠시만 기다려 주세요." busy />;
  } else if (phase === "loading") {
    content = <CenterState title="배틀 정보를 확인하고 있어요" description="서버 시간과 오늘의 배틀을 확인합니다." busy />;
  } else if (phase === "launch-waiting") {
    content = <CenterState eyebrow="BATTLE OPEN" title="데일리 배틀이 곧 시작됩니다" description={"오늘 낮 12시 50분에 데일리 배틀이 열려요.\n세 문제를 가장 빠르게 풀고 TOP 5에 도전하세요!"} time={untilOpenSeconds} />;
  } else if (phase === "waiting") {
    content = <CenterState title="오늘의 배틀을 기다리는 중" description={"오늘 낮 12시 50분에 모든 사용자가\n같은 세 문제로 경쟁합니다."} time={untilOpenSeconds} />;
  } else if (phase === "no-battle") {
    content = <CenterState title="배틀 문제를 준비하고 있어요" description="잠시 후 다시 확인해 주세요." action={<ErrorButton onClick={load} />} />;
  } else if (phase === "closed") {
    content = <CenterState title="오늘의 배틀이 마감되었습니다" description="오늘의 배틀 결과를 준비하고 있습니다." />;
  } else if (phase === "access-denied") {
    content = <AccessDeniedState title={accessIssue?.title} description={accessIssue?.description} />;
  } else if (phase === "in-progress" && battle) {
    content = <BattleForm battle={battle} answers={answers} remainingSeconds={remainingSeconds} errorMessage={errorMessage} canSubmit={canSubmit} submitting={submitting} droppingOut={droppingOut} onAnswer={updateAnswer} onSubmit={submit} onDropOut={dropOut} />;
  } else if (phase === "result-pending" && remainingSeconds > 0) {
    content = <PendingBattleResult battle={battle} remainingSeconds={remainingSeconds} />;
  } else if (phase === "result" && result) {
    content = <BattleResult result={result} />;
  } else if (phase === "result-error") {
    content = <CenterState title="결과를 불러오지 못했습니다" description={errorMessage} action={<ErrorButton onClick={retryResult} />} />;
  } else {
    content = <CenterState title="배틀을 불러오지 못했습니다" description={errorMessage || "잠시 후 다시 시도해 주세요."} action={<ErrorButton onClick={load} />} />;
  }

  return (
    <div className="relative h-full overflow-hidden bg-[#05050F]">
      <BattleBackdrop />
      {content}
      <span className="sr-only" aria-live="polite">{alarm?.status}</span>
    </div>
  );
}

export function InvalidBattleRoutePage() {
  return (
    <div className="relative h-full overflow-hidden bg-[#05050F]">
      <BattleBackdrop />
      <AccessDeniedState
        eyebrow="INVALID BATTLE"
        title="잘못된 배틀 접근입니다"
        description={"주소로 직접 참여할 수 없는 배틀이에요.\n현재 진행 중인 배틀은 배틀 메뉴에서 확인해 주세요."}
        showBattleGuide
      />
    </div>
  );
}
