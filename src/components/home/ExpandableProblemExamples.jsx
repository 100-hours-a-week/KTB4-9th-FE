import { useLayoutEffect, useRef, useState } from "react";

export default function ExpandableProblemExamples({ examples }) {
  const contentRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element || expanded) return undefined;

    const updateOverflow = () => {
      setCanExpand(element.scrollHeight > element.clientHeight + 1);
    };

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [examples, expanded]);

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl border border-[#1A1A30] bg-[#08081A]">
      <div
        ref={contentRef}
        className="relative px-3 pt-3"
        style={!expanded ? { maxHeight: 164, overflow: "hidden" } : undefined}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          입출력 예시
        </p>
        {examples.map((example, index) => (
          <div key={index} className={`flex flex-col gap-1 pb-3 ${index > 0 ? "border-t border-[#1A1A30] pt-3" : ""}`}>
            {examples.length > 1 && (
              <p className="mb-0.5 text-[10px] text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                예시 {index + 1}
              </p>
            )}
            <p className="whitespace-pre-wrap break-words text-xs text-[#8B7FC4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="mr-1 text-[#4A4870]">입력</span>{example.input}
            </p>
            <p className="whitespace-pre-wrap break-words text-xs text-[#C084FC]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="mr-1 text-[#4A4870]">출력</span>{example.output}
            </p>
            {example.description && (
              <p className="mt-1 break-words text-[11px] leading-relaxed text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {example.description}
              </p>
            )}
          </div>
        ))}
        {!expanded && canExpand && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#08081A] to-transparent theme-example-fade" />
        )}
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="relative flex w-full items-center justify-center border-t border-[#1A1A30] bg-[#08081A] py-2 text-xs font-medium text-[#A855F7] transition-colors hover:text-[#C084FC]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {expanded ? "접기" : "예시 더보기"}
        </button>
      )}
    </div>
  );
}
