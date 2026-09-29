import { Fragment } from "react";

const MATH_EXPRESSION = /([A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)(?:_(?:\{([^{}]+)\}|([A-Za-z0-9+-]+)))?(?:\^(?:\{([^{}]+)\}|([A-Za-z0-9+-]+)))?/g;

function normalizeOperators(text) {
  return text
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/->/g, "→");
}

export default function MathText({ text }) {
  const source = normalizeOperators(String(text ?? ""));
  const parts = [];
  let cursor = 0;

  for (const match of source.matchAll(MATH_EXPRESSION)) {
    const [raw, base, groupedSubscript, subscript, groupedSuperscript, superscript] = match;
    const sub = groupedSubscript ?? subscript;
    const sup = groupedSuperscript ?? superscript;

    if (!sub && !sup) continue;

    if (match.index > cursor) parts.push(source.slice(cursor, match.index));

    parts.push(
      <Fragment key={`${match.index}-${raw}`}>
        {base}
        {sub && <sub className="relative -bottom-[0.08em] text-[0.72em] leading-none">{sub}</sub>}
        {sup && <sup className="relative -top-[0.08em] text-[0.72em] leading-none">{sup}</sup>}
      </Fragment>,
    );
    cursor = match.index + raw.length;
  }

  if (cursor < source.length) parts.push(source.slice(cursor));

  return <>{parts.length > 0 ? parts : source}</>;
}
