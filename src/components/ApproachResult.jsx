function LockedText({ children, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block select-none blur-[5px] ${className}`}
    >
      {children}
    </span>
  );
}

function ResultActions({ showCode, onWriteCode, onNewProblem }) {
  return (
    <>
      <button
        type="button"
        onClick={onWriteCode}
        className="flex w-full items-center justify-between rounded-2xl border border-[#7C3AED]/25 bg-[#7C3AED]/8 px-4 py-3.5 text-sm font-semibold text-[#C084FC]"
      >
        코드 직접 작성해볼게요
        <span aria-hidden="true">{showCode ? "⌃" : "⌄"}</span>
      </button>
      <button
        type="button"
        onClick={onNewProblem}
        className="w-full rounded-2xl border border-[#1E1D35] py-4 text-sm font-bold text-[#6B6890]"
      >
        새 문제 생성하기
      </button>
    </>
  );
}

export default function ApproachResult({
  evaluation,
  categoryKnown,
  selectedCategory,
  answerRevealed,
  onRevealAnswer,
  showCode,
  onWriteCode,
  onNewProblem,
}) {
  if (evaluation.status === "pending" || evaluation.status === "failed") {
    return (
      <div className="flex flex-col gap-3 animate-fadeIn">
        <div className="rounded-2xl border border-[#2A2845] bg-[#0D0D1F] p-5">
          <p className="text-sm font-semibold text-[#E2E0F0]">
            {evaluation.status === "failed" ? "AI 평가를 완료하지 못했어요" : "제출 완료"}
          </p>
          <p className="mt-1 text-xs text-[#6B6890]">
            {evaluation.status === "failed"
              ? "평가 결과를 표시할 수 없지만 코드 풀이를 계속할 수 있어요."
              : "AI 평가가 진행 중이에요. 아직 점수와 피드백이 도착하지 않았어요."}
          </p>
        </div>
        <ResultActions showCode={showCode} onWriteCode={onWriteCode} onNewProblem={onNewProblem} />
      </div>
    );
  }

  const hasScore = evaluation.approachScore !== null;
  const score = hasScore ? Math.max(0, Math.min(100, evaluation.approachScore)) : 0;
  const totalPass = evaluation.categoryCorrect && hasScore && score >= 33;
  const lockCategory = !categoryKnown && !evaluation.categoryCorrect && !answerRevealed;

  return (
    <div className="flex flex-col gap-3 animate-fadeIn">
      <div className={`flex items-center gap-3 rounded-2xl border p-4 ${totalPass ? "border-emerald-500/25 bg-emerald-500/8" : "border-rose-500/25 bg-rose-500/8"}`}>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${totalPass ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/12 text-rose-400"}`} aria-hidden="true">
          {totalPass ? "✓" : "⊗"}
        </span>
        <div>
          <p className="text-sm font-bold text-[#E2E0F0]">
            {totalPass ? "훌륭한 접근이에요!" : "조금 더 생각해봐요"}
          </p>
          <p className="mt-0.5 text-xs text-[#6B6890]">
            {categoryKnown ? evaluation.correctCategory : `카테고리 ${evaluation.categoryCorrect ? "정답" : "오답"}`}
            {" · "}
            {hasScore ? `접근 방식 ${evaluation.approachScore}점` : "접근 방식 평가 결과 없음"}
          </p>
        </div>
      </div>

      {!categoryKnown && (
        <section className="rounded-2xl border border-[#2A2845] bg-[#0D0D1F] p-5">
          <h3 className="mb-4 text-xs font-medium tracking-wide text-[#6B6890]">카테고리</h3>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-[11px] text-[#6B6890]">내 선택</p>
              <p className="break-words text-sm font-semibold text-[#E2E0F0]">{selectedCategory}</p>
            </div>
            <span className="text-[#6B6890]" aria-hidden="true">→</span>
            <div className="min-w-0">
              <p className="mb-1 text-[11px] text-[#6B6890]">정답</p>
              {lockCategory ? (
                <button
                  type="button"
                  onClick={onRevealAnswer}
                  aria-label="카테고리 정답과 선정 배경 확인"
                  className="rounded-full border border-[#7C3AED]/50 bg-[#7C3AED]/15 px-3 py-1.5 text-xs font-semibold text-[#C084FC] transition-colors hover:bg-[#7C3AED]/25"
                >
                  정답 확인
                </button>
              ) : (
                <p className="break-words text-sm font-semibold text-[#E2E0F0]">
                  {evaluation.correctCategory ?? "결과 없음"}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 border-t border-[#1E1D35] pt-4">
            <p className="mb-2 text-xs text-[#6B6890]">카테고리 선정 배경</p>
            {lockCategory ? (
              <LockedText className="text-xs text-[#A89EC4]">
                {evaluation.categoryReason ?? "카테고리 선정 배경은 아직 제공되지 않았어요."}
              </LockedText>
            ) : (
              <p className="text-xs leading-relaxed text-[#A89EC4]">
                {evaluation.categoryReason ?? "카테고리 선정 배경은 아직 제공되지 않았어요."}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[#2A2845] bg-[#0D0D1F] p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-xs font-medium text-[#6B6890]">접근 방식</h3>
          <strong className="font-mono text-sm text-[#E2E0F0]">
            {hasScore ? `${evaluation.approachScore}점` : "평가 없음"}
          </strong>
        </div>
        <div
          role="progressbar"
          aria-label="접근 방식 점수"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
          className="h-1.5 overflow-hidden rounded-full bg-[#2A2845]"
        >
          <div
            className="h-full rounded-full bg-[#A855F7] transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="mt-5">
          <h4 className="mb-3 text-xs text-[#6B6890]">핵심 키워드</h4>
          {evaluation.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {evaluation.keywords.map((item, index) => (
                <span
                  key={`${item.keyword}-${index}`}
                  aria-label={item.matched ? `일치한 키워드: ${item.keyword}` : "아직 찾지 못한 키워드"}
                  className={`rounded-full border px-3 py-1.5 text-xs ${item.matched ? "border-[#7C3AED]/40 bg-[#7C3AED]/15 text-[#E2E0F0]" : "border-[#2A2845] bg-[#151425] text-[#6B6890]"}`}
                >
                  {item.matched ? (
                    <>✓ {item.keyword}</>
                  ) : (
                    <span aria-hidden="true" className="inline-block select-none blur-[5px]">
                      {item.keyword}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B6890]">키워드 평가 결과가 아직 제공되지 않았어요.</p>
          )}
        </div>

        {evaluation.aiFeedback && (
          <div className="mt-5 border-t border-[#1E1D35] pt-4">
            <h4 className="mb-2 text-xs text-[#6B6890]">AI 피드백</h4>
            <p className="text-xs leading-relaxed text-[#A89EC4]">{evaluation.aiFeedback}</p>
          </div>
        )}
      </section>

      <ResultActions showCode={showCode} onWriteCode={onWriteCode} onNewProblem={onNewProblem} />
    </div>
  );
}
