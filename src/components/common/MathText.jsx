import { Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const MATH_EXPRESSION = /([A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)(?:_(?:\{([^{}]+)\}|([A-Za-z0-9+-]+)))?(?:\^(?:\{([^{}]+)\}|([A-Za-z0-9+-]+)))?/g;
const DOLLAR_MATH = /\$([^$]+)\$/g;

function normalizeOperators(text) {
  return text
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/->/g, "→");
}

// AI가 줄바꿈을 글자 그대로("\n") 보낸 경우 실제 줄바꿈으로 바꿈 (\neq 같은 LaTeX 명령은 제외)
function restoreNewlines(text) {
  return text.replace(/\\n(?![A-Za-z])/g, "\n");
}

// $ 없이 쓴 w_i, 10^5 같은 표기를 아래첨자·위첨자로 변환
function renderPlain(text, keyPrefix) {
  const source = normalizeOperators(restoreNewlines(text));
  const parts = [];
  let cursor = 0;

  for (const match of source.matchAll(MATH_EXPRESSION)) {
    const [raw, base, groupedSubscript, subscript, groupedSuperscript, superscript] = match;
    const sub = groupedSubscript ?? subscript;
    const sup = groupedSuperscript ?? superscript;

    if (!sub && !sup) continue;

    if (match.index > cursor) parts.push(source.slice(cursor, match.index));

    parts.push(
      <Fragment key={`${keyPrefix}-${match.index}-${raw}`}>
        {base}
        {sub && <sub className="relative -bottom-[0.08em] text-[0.72em] leading-none">{sub}</sub>}
        {sup && <sup className="relative -top-[0.08em] text-[0.72em] leading-none">{sup}</sup>}
      </Fragment>,
    );
    cursor = match.index + raw.length;
  }

  if (cursor < source.length) parts.push(source.slice(cursor));

  return parts.length > 0 ? parts : source;
}

export default function MathText({ text }) {
  const source = String(text ?? "");
  const nodes = [];
  let cursor = 0;

  // 1. $...$ 구간은 KaTeX로 수식 렌더링 (문법이 틀려도 에러 대신 원문 표시)
  for (const match of source.matchAll(DOLLAR_MATH)) {
    if (match.index > cursor) nodes.push(renderPlain(source.slice(cursor, match.index), `t${cursor}`));

    const html = katex.renderToString(match[1], { throwOnError: false });
    nodes.push(<span key={`m${match.index}`} dangerouslySetInnerHTML={{ __html: html }} />);
    cursor = match.index + match[0].length;
  }

  // 2. 나머지 일반 글
  if (cursor < source.length) nodes.push(renderPlain(source.slice(cursor), `t${cursor}`));

  return <>{nodes}</>;
}
