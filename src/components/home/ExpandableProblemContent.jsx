import { useLayoutEffect, useRef, useState } from "react";

export default function ExpandableProblemContent({ content }) {
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
  }, [content, expanded]);

  return (
    <div className="mb-4">
      <p
        ref={contentRef}
        className="text-sm text-[#6B6890] leading-relaxed"
        style={{
          fontFamily: "'Outfit', sans-serif",
          ...(!expanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}),
        }}
      >
        {content}
      </p>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1.5 text-xs font-medium text-[#A855F7] transition-colors hover:text-[#C084FC]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {expanded ? "접기" : "더보기"}
        </button>
      )}
    </div>
  );
}
