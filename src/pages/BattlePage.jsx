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
              <p className="mt-1 text-[11px] leading-5 text-[#6B6890]">매일 12:00–12:09:59에만 참여할 수 있으며, 배틀 페이지 진입 시 자동으로 참여가 시작됩니다.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,58,237,0.24)] active:scale-[0.98]"
        >
          홈으로 돌아가기
        </button>
        {showBattleGuide && (
          <button
            type="button"
            onClick={() => navigate("/daily-battles", { replace: true })}
            className="mt-2 w-full rounded-2xl border border-[#2A2845] py-3.5 text-xs font-semibold text-[#A89EC4] active:bg-[#12121F]"
          >
            오늘의 배틀 일정 보기
          </button>
        )}
      </section>
    </div>
  );
}

function IncompleteState({ description }) {
  return (
    <div className="relative z-10 flex min-h-full items-center justify-center px-6">
      <section className="w-full rounded-2xl border border-[#2A2845] bg-[#0D0D1F] px-5 py-5 shadow-[0_16px_45px_rgba(0,0,0,0.24)]">
        <h1 className="text-lg font-bold text-[#E2E0F0]">배틀을 완료하지 못했어요</h1>
        <p className="mt-2 text-sm leading-6 text-[#8B87AA]">{description}</p>
        <p className="mt-4 text-[10px] text-[#4A4870]">결과가 공개되면 TOP 5를 자동으로 보여드릴게요.</p>
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
    <div className="relative z-10 min-h-full overflow-y-auto pb-6">
      <PageHeader
        eyebrow="Daily Battle"
        title="오늘의 배틀"
        subtitle="세 문제의 답을 모두 작성해 한 번에 제출하세요"
        action={<UserMenu />}
      />

      <div className="px-5 pb-6">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-4 py-3">
          <div>
            <p className="text-[9px] tracking-widest text-[#8B7FC4]" style={MONO}>TIME LEFT</p>
            <p className="mt-0.5 text-[11px] text-[#6B6890]">마감 이후에는 제출할 수 없어요</p>
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
  const value = Math.max(0, Number(seconds));
  const minutes = Math.floor(value / 60);
  const remain = value % 60;
  return minutes ? `${minutes}분 ${remain}초` : `${remain}초`;
}

const INCOMPLETE_STATUS = {
  DROPPED_OUT: "중도 이탈한 배틀은 순위에 반영되지 않습니다.",
  TIME_OVER: "제출 시간이 초과되어 순위에 반영되지 않습니다.",
  GRADING_FAILED: "채점 중 문제가 발생했습니다. 오답으로 처리된 것은 아닙니다.",
};

function ResultRankings({ rankings }) {
  if (rankings.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1E1D35] bg-[#0D0D1F]">
      <div className="flex items-center gap-2 border-b border-[#1E1D35] px-4 py-3">
        <span className="text-[#C084FC]">★</span>
        <h3 className="text-sm font-semibold text-[#E2E0F0]">TOP 5 랭킹</h3>
      </div>
      <div className="divide-y divide-[#1E1D35]">
        {rankings.map((entry) => (
          <div key={`${entry.rank}-${entry.user_id}`} className="flex items-center gap-3 px-4 py-3">
            <span className={`w-7 text-center font-bold ${entry.rank <= 3 ? "text-xl text-[#E2E0F0]" : "text-sm text-[#8B87AA]"}`}>{entry.rank}</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#2A2845] bg-[#7C3AED]/15 text-[10px] font-bold text-[#C084FC]">
              <ProfileAvatar src={entry.profile_image_url} name={entry.name} className="h-full w-full object-cover" />
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#E2E0F0]">{entry.name}</p>
            <span className={`text-[11px] ${entry.rank === 1 ? "font-bold text-[#C084FC]" : "text-[#A89EC4]"}`} style={MONO}>{formatElapsed(entry.elapsed_seconds)}</span>
          </div>
        ))}
      </div>
    </section>
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

  return (
    <div className="relative z-10 min-h-full overflow-y-auto pb-6">
      <PageHeader eyebrow="오늘의 배틀 종료" title={result?.title ?? "오늘의 데일리 배틀"} subtitle={result?.battle_date} action={<UserMenu />} />
      <div className="space-y-4 px-5 pb-6">
        {!mine && (
          <section className="rounded-2xl border border-[#2A2845] bg-[#0D0D1F] px-5 py-4">
            <h2 className="text-base font-bold text-[#E2E0F0]">이번 배틀에 참여하지 않았어요</h2>
            <p className="mt-1.5 text-xs text-[#8B87AA]">다음 배틀에 도전해 보세요.</p>
          </section>
        )}

        {mine && incompleteMessage && (
          <section className="rounded-2xl border border-[#2A2845] bg-[#0D0D1F] px-5 py-4">
            <h2 className="text-base font-bold text-[#E2E0F0]">배틀을 완료하지 못했어요</h2>
            <p className="mt-1.5 text-xs leading-5 text-[#8B87AA]">{incompleteMessage}</p>
          </section>
        )}

        {mine && completed && (
          <section className="flex items-center gap-3 rounded-2xl border border-[#7C3AED]/35 bg-[#7C3AED]/10 px-4 py-4">
            <div className="min-w-[54px] border-r border-[#2A2845] pr-3">
              <p className="text-[9px] text-[#6B6890]">내 순위</p>
              <p className="mt-1 text-2xl font-bold text-[#C084FC]">{mine.my_rank == null ? "-" : `${mine.my_rank}위`}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#7C3AED]/35 bg-[#7C3AED]/20 text-xs font-bold text-[#C084FC]">
              <ProfileAvatar src={user?.profileImageUrl} name={user?.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#E2E0F0]">{user?.name || "사용자"}</p>
              <p className={`mt-0.5 text-[10px] ${mine.all_correct ? "text-emerald-400" : "text-rose-400"}`}>{mine.all_correct ? "전체 정답" : "오답 포함"}</p>
            </div>
            <span className="text-xs font-semibold text-[#E2E0F0]" style={MONO}>{formatElapsed(mine.elapsed_seconds)}</span>
          </section>
        )}

        <ResultRankings rankings={rankings} />

        {answers.length > 0 && (
          <section className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#E2E0F0]">정답 확인</h3>
            <div className="space-y-2">
              {answers.map((answer) => (
                <div key={answer.battle_case_id} className={`rounded-xl border p-3 ${answer.is_correct ? "border-emerald-500/25 bg-emerald-500/5" : "border-rose-500/25 bg-rose-500/5"}`}>
                  <div className="mb-2 flex items-center justify-between"><span className="text-[10px] text-[#6B6890]">케이스 {answer.display_order}</span><span className={`text-[10px] font-semibold ${answer.is_correct ? "text-emerald-400" : "text-rose-400"}`}>{answer.is_correct ? "✓ 정답" : "× 오답"}</span></div>
                  <div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1 text-[10px] leading-4">
                    <span className="text-[#4A4870]">IN</span><pre className="whitespace-pre-wrap break-words text-[#A89EC4]" style={MONO}>{answer.input}</pre>
                    <span className="text-[#4A4870]">정답</span><pre className="whitespace-pre-wrap break-words font-semibold text-[#C8B8F8]" style={MONO}>{answer.expected_output}</pre>
                    {!answer.is_correct && <><span className="text-[#4A4870]">내 답</span><pre className="whitespace-pre-wrap break-words text-rose-400" style={MONO}>{answer.submitted_output}</pre></>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="py-5 text-center text-[11px] text-[#4A4870]">내일 또 다른 문제가 기다리고 있어요</p>
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
  if (phase === "loading") {
    content = <CenterState title="배틀 정보를 확인하고 있어요" description="서버 시간과 오늘의 배틀을 확인합니다." busy />;
  } else if (phase === "launch-waiting") {
    content = <CenterState eyebrow="BATTLE OPEN D-1" title="내일, 데일리 배틀이 시작됩니다" description={"10월 19일 낮 12시 첫 배틀이 열려요.\n세 문제를 가장 빠르게 풀고 TOP 5에 도전하세요!"} time={untilOpenSeconds} />;
  } else if (phase === "waiting") {
    content = <CenterState title="오늘의 배틀을 기다리는 중" description={"매일 낮 12시에 모든 사용자가\n같은 세 문제로 경쟁합니다."} time={untilOpenSeconds} />;
  } else if (phase === "no-battle") {
    content = <CenterState title="배틀 문제를 준비하고 있어요" description="잠시 후 다시 확인해 주세요." action={<ErrorButton onClick={load} />} />;
  } else if (phase === "closed") {
    content = <CenterState title="오늘의 배틀이 마감되었습니다" description={"결과를 조회할 참여 기록이 없습니다.\n내일 낮 12시에 다시 도전해 주세요."} />;
  } else if (phase === "access-denied") {
    content = <AccessDeniedState title={accessIssue?.title} description={accessIssue?.description} />;
  } else if (phase === "in-progress" && battle) {
    content = <BattleForm battle={battle} answers={answers} remainingSeconds={remainingSeconds} errorMessage={errorMessage} canSubmit={canSubmit} submitting={submitting} droppingOut={droppingOut} onAnswer={updateAnswer} onSubmit={submit} onDropOut={dropOut} />;
  } else if (phase === "result-pending") {
    content = <CenterState eyebrow="GRADING" title="배틀 결과 채점 중..." description={"제출은 완료되었습니다.\n채점이 끝나면 결과가 자동으로 표시됩니다."} busy />;
  } else if (phase === "dropped-out") {
    content = <IncompleteState description="중도 이탈한 배틀은 순위에 반영되지 않습니다." />;
  } else if (phase === "time-over") {
    content = <IncompleteState description="제출 시간이 초과되어 순위에 반영되지 않습니다." />;
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
