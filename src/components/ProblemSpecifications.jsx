import MathText from "./common/MathText.jsx";

const DATA_TYPE_LABELS = {
  INT: "INT",
  LONG: "LONG",
  FLOAT: "FLOAT",
  DOUBLE: "DOUBLE",
  STRING: "STRING",
  CHAR: "CHAR",
  BOOLEAN: "BOOLEAN",
};

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return number.toLocaleString("ko-KR", { maximumFractionDigits: 10 });
}

function formatRange(constraint) {
  const target = constraint.target || "값";
  const hasMin = constraint.minValue != null;
  const hasMax = constraint.maxValue != null;

  if (hasMin && hasMax) {
    return `${formatNumber(constraint.minValue)} ≤ ${target} ≤ ${formatNumber(constraint.maxValue)}`;
  }
  if (hasMin) return `${formatNumber(constraint.minValue)} ≤ ${target}`;
  if (hasMax) return `${target} ≤ ${formatNumber(constraint.maxValue)}`;
  return target;
}

function FormatRow({ label, children }) {
  return (
    <div className="grid grid-cols-[36px_1fr] items-start gap-2.5 border-b border-[#1A1A2E] py-2.5 last:border-b-0">
      <span className="flex h-5 items-center justify-center rounded-md bg-[#7C3AED]/15 text-[9px] font-semibold text-[#A78BFA]">
        {label}
      </span>
      <p className="break-words whitespace-pre-line text-[11px] leading-5 text-[#8B87AA]"><MathText text={children} /></p>
    </div>
  );
}

export function ProblemConditions({
  inputFormat,
  outputFormat,
  inputConstraints = [],
  legacyConstraints = [],
  executionLimits = [],
}) {
  const hasFormats = Boolean(inputFormat || outputFormat);
  const hasStructuredConstraints = inputConstraints.length > 0;
  const hasLegacyConstraints = legacyConstraints.length > 0;
  const hasExecutionLimits = executionLimits.length > 0;

  if (!hasFormats && !hasStructuredConstraints && !hasLegacyConstraints && !hasExecutionLimits) return null;

  return (
    <section className="mt-4 border-t border-[#1E1D35] pt-4">
      <div className="rounded-xl border border-[#1E1D35] bg-[#080814] p-3">
        {hasFormats && (
          <div>
            <h3 className="mb-1.5 text-[10px] font-semibold tracking-wider text-[#6B6890]">입출력 형식</h3>
            <div className="px-1">
            {inputFormat && <FormatRow label="입력">{inputFormat}</FormatRow>}
            {outputFormat && <FormatRow label="출력">{outputFormat}</FormatRow>}
            </div>
          </div>
        )}

        {(hasStructuredConstraints || hasLegacyConstraints) && (
          <div className={hasFormats ? "mt-3 border-t border-[#1A1A2E] pt-3" : ""}>
            <h3 className="mb-1 text-[10px] font-semibold tracking-wider text-[#6B6890]">제약 조건</h3>
            <div className="divide-y divide-[#1A1A2E] px-1">
            {inputConstraints.map((constraint, index) => {
              const conditions = [
                constraint.dataCount != null ? `원소 수 ${formatNumber(constraint.dataCount)}개` : null,
                ...(constraint.specialConditions ?? []),
              ].filter(Boolean);

              return (
                <div key={`${constraint.target}-${index}`} className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 py-1.5 text-[10px] leading-4">
                  <span className="text-[#7C3AED]">•</span>
                    {constraint.scope === "OUTPUT" && (
                      <span className="font-semibold text-[#C084FC]">출력</span>
                    )}
                    <code className="font-semibold text-[#C8B8F8]"><MathText text={formatRange(constraint)} /></code>
                    {constraint.dataType && (
                      <span className="text-[9px] text-[#6B6890]">({DATA_TYPE_LABELS[constraint.dataType] ?? constraint.dataType})</span>
                    )}
                  {conditions.length > 0 && (
                    <span className="text-[9px] text-[#5F5B80]">· <MathText text={conditions.join(" · ")} /></span>
                  )}
                </div>
              );
            })}

            {!hasStructuredConstraints && legacyConstraints.map((constraint, index) => (
              <div key={`${constraint}-${index}`} className="flex gap-1.5 py-1.5 text-[10px] leading-4 text-[#8B87AA]">
                <span className="text-[#7C3AED]">•</span>
                <code><MathText text={constraint} /></code>
              </div>
            ))}
            </div>
          </div>
        )}

        {hasExecutionLimits && (
          <div className={(hasFormats || hasStructuredConstraints || hasLegacyConstraints) ? "mt-3 border-t border-[#1A1A2E] pt-3" : ""}>
            <div className="mb-2 flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-[#A855F7] shadow-[0_0_6px_#A855F7]" />
              <h3 className="text-[10px] font-semibold tracking-wider text-[#6B6890]">언어별 제한</h3>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {executionLimits.map((limit) => (
                <div key={limit.language} className="min-w-0 rounded-lg border border-[#1E1D35] bg-[#0D0D1F] px-1.5 py-2 text-center">
                  <p className="truncate text-[10px] font-semibold text-[#C8B8F8]">{limit.language}</p>
                  <p className="mt-1 whitespace-nowrap text-[8px] text-[#8B87AA]">
                    {formatTime(limit.timeLimitMs)} · {formatMemory(limit.memoryLimitKb)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function formatTime(milliseconds) {
  const seconds = Number(milliseconds) / 1000;
  if (!Number.isFinite(seconds)) return "-";
  return `${formatNumber(seconds)}초`;
}

function formatMemory(kilobytes) {
  const megabytes = Number(kilobytes) / 1024;
  if (!Number.isFinite(megabytes)) return "-";
  return `${formatNumber(megabytes)}MB`;
}
