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
    <div className="grid grid-cols-[42px_1fr] gap-3 border-b border-[#1A1A2E] py-3 last:border-b-0">
      <span className="flex h-6 items-center justify-center rounded-md bg-[#7C3AED]/15 text-[10px] font-semibold text-[#A78BFA]">
        {label}
      </span>
      <p className="break-words text-xs leading-6 text-[#8B87AA]">{children}</p>
    </div>
  );
}

export function ProblemConditions({
  inputFormat,
  outputFormat,
  inputConstraints = [],
  legacyConstraints = [],
}) {
  const hasFormats = Boolean(inputFormat || outputFormat);
  const hasStructuredConstraints = inputConstraints.length > 0;
  const hasLegacyConstraints = legacyConstraints.length > 0;

  if (!hasFormats && !hasStructuredConstraints && !hasLegacyConstraints) return null;

  return (
    <section className="mt-4 border-t border-[#1E1D35] pt-4">
      {hasFormats && (
        <div>
          <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-[#6B6890]">입출력 형식</h3>
          <div className="rounded-xl border border-[#1E1D35] bg-[#080814] px-3">
            {inputFormat && <FormatRow label="입력">{inputFormat}</FormatRow>}
            {outputFormat && <FormatRow label="출력">{outputFormat}</FormatRow>}
          </div>
        </div>
      )}

      {(hasStructuredConstraints || hasLegacyConstraints) && (
        <div className={hasFormats ? "mt-4" : ""}>
          <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-[#6B6890]">제약 조건</h3>
          <div className="space-y-2">
            {inputConstraints.map((constraint, index) => {
              const conditions = [
                constraint.dataCount != null ? `원소 수 ${formatNumber(constraint.dataCount)}개` : null,
                ...(constraint.specialConditions ?? []),
              ].filter(Boolean);

              return (
                <div key={`${constraint.target}-${index}`} className="rounded-xl border border-[#1E1D35] bg-[#080814] px-3.5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {constraint.scope === "OUTPUT" && (
                      <span className="rounded-md bg-[#A855F7]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#C084FC]">출력</span>
                    )}
                    <code className="text-xs font-semibold text-[#C8B8F8]">{formatRange(constraint)}</code>
                    {constraint.dataType && (
                      <span className="rounded-md border border-[#2A2845] px-1.5 py-0.5 text-[9px] text-[#6B6890]">
                        {DATA_TYPE_LABELS[constraint.dataType] ?? constraint.dataType}
                      </span>
                    )}
                  </div>
                  {conditions.length > 0 && (
                    <p className="mt-1.5 text-[10px] leading-5 text-[#5F5B80]">{conditions.join(" · ")}</p>
                  )}
                </div>
              );
            })}

            {!hasStructuredConstraints && legacyConstraints.map((constraint, index) => (
              <div key={`${constraint}-${index}`} className="rounded-xl border border-[#1E1D35] bg-[#080814] px-3.5 py-3">
                <code className="text-xs text-[#8B87AA]">{constraint}</code>
              </div>
            ))}
          </div>
        </div>
      )}
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

export function ExecutionLimitsCard({ limits = [] }) {
  if (limits.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
        <h3 className="text-xs font-semibold tracking-wider text-[#8B87AA]">언어별 제한</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {limits.map((limit) => (
          <div key={limit.language} className="rounded-xl border border-[#1E1D35] bg-[#080814] px-3 py-3">
            <p className="mb-2 truncate text-xs font-semibold text-[#C8B8F8]">{limit.language}</p>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#4A4870]">시간</span>
                <span className="font-medium text-[#8B87AA]">{formatTime(limit.timeLimitMs)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#4A4870]">메모리</span>
                <span className="font-medium text-[#8B87AA]">{formatMemory(limit.memoryLimitKb)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
