import { useState } from "react";
import { useNavigate } from "react-router";
import UserMenu from "../components/common/UserMenu.jsx";
import { getStoredUser } from "../services/auth.js";
import { setCurrentProblem } from "../store";
// ─── Daily problem pool ───────────────────────────────────────────────────────
const POOL = [
	{
		title: "두 수의 합",
		difficulty: "LV1",
		category: "Array",
		description: "정수 배열 nums와 정수 target이 주어진다. 합이 target이 되는 두 수의 인덱스를 반환하시오.",
		examples: [{
			input: "nums=[2,7,11,15], target=9",
			output: "[0,1]"
		}],
		constraints: ["2 ≤ nums.length ≤ 10⁴", "각 입력에 정확히 하나의 답이 존재"],
		categoryKnown: true
	},
	{
		title: "회의실 최대 예약",
		difficulty: "LV2",
		category: "Greedy",
		description: "하나의 회의실에서 겹치지 않게 진행할 수 있는 최대 회의 수를 구하시오.",
		examples: [{
			input: "meetings=[[1,4],[3,5],[0,6],[5,7]]",
			output: "2"
		}],
		constraints: ["1 ≤ N ≤ 10⁵"],
		categoryKnown: true
	},
	{
		title: "괄호 유효성 검사",
		difficulty: "LV2",
		category: "Stack/Queue",
		description: "주어진 괄호 문자열이 올바른 괄호 쌍으로 이루어져 있는지 판별하시오.",
		examples: [{
			input: "s = \"(())\"",
			output: "false"
		}],
		constraints: ["1 ≤ s.length ≤ 10⁵"],
		categoryKnown: true
	},
	{
		title: "소수 판별",
		difficulty: "LV1",
		category: "Math",
		description: "정수 N이 주어질 때 소수이면 true, 아니면 false를 반환하시오.",
		examples: [{
			input: "N = 7",
			output: "true"
		}],
		constraints: ["2 ≤ N ≤ 10⁶"],
		categoryKnown: true
	},
	{
		title: "부분 배열 최대합",
		difficulty: "LV2",
		category: "Array",
		description: "정수 배열에서 합이 최대인 연속 부분 배열의 합을 구하시오 (카데인 알고리즘).",
		examples: [{
			input: "nums=[-2,1,-3,4,-1,2,1,-5,4]",
			output: "6"
		}],
		constraints: ["1 ≤ nums.length ≤ 10⁵"],
		categoryKnown: true
	},
	{
		title: "아나그램 판별",
		difficulty: "LV1",
		category: "String",
		description: "두 문자열 s와 t가 서로 아나그램인지 판별하시오.",
		examples: [{
			input: "s=\"anagram\", t=\"nagaram\"",
			output: "true"
		}],
		constraints: ["1 ≤ s.length ≤ 5×10⁴"],
		categoryKnown: true
	},
	{
		title: "이진 트리 최대 깊이",
		difficulty: "LV2",
		category: "Tree",
		description: "이진 트리의 루트가 주어질 때, 루트에서 가장 깊은 리프 노드까지의 깊이를 구하시오.",
		examples: [{
			input: "root=[3,9,20,null,null,15,7]",
			output: "3"
		}],
		constraints: ["0 ≤ 노드 수 ≤ 10⁴"],
		categoryKnown: true
	},
	{
		title: "피보나치 수",
		difficulty: "LV1",
		category: "DP",
		description: "F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1 일 때 F(n)을 구하시오.",
		examples: [{
			input: "n = 10",
			output: "55"
		}],
		constraints: ["0 ≤ n ≤ 30"],
		categoryKnown: true
	},
	{
		title: "배열 회전",
		difficulty: "LV1",
		category: "Array",
		description: "정수 배열을 오른쪽으로 k번 회전한 결과를 반환하시오.",
		examples: [{
			input: "nums=[1,2,3,4,5], k=2",
			output: "[4,5,1,2,3]"
		}],
		constraints: ["1 ≤ nums.length ≤ 10⁵"],
		categoryKnown: true
	},
	{
		title: "두 포인터 합",
		difficulty: "LV2",
		category: "Two Pointer",
		description: "정렬된 배열에서 합이 target이 되는 두 수가 존재하면 true를 반환하시오.",
		examples: [{
			input: "nums=[1,2,3,4,6], target=6",
			output: "true"
		}],
		constraints: ["2 ≤ nums.length ≤ 10⁴"],
		categoryKnown: true
	}
];
function seeded(n) {
	const x = Math.sin(n + 1) * 43758.5453;
	return x - Math.floor(x);
}
function todaySeed() {
	const d = new Date();
	return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate();
}
function getDailyProblems() {
	const seed = todaySeed();
	const picked = [];
	let s = seed;
	while (picked.length < 5) {
		const idx = Math.floor(seeded(s++) * POOL.length);
		if (!picked.includes(idx)) picked.push(idx);
	}
	return picked.map((idx, i) => ({
		...POOL[idx],
		id: `daily_${seed}_${i}`
	}));
}
// ─── Heatmap (20 weeks = 140 cells, col-major: col 0 = oldest week) ───────────
const WEEKS = 20;
const TOTAL_CELLS = WEEKS * 7;
function getHeatmapData() {
	const seed = todaySeed();
	return Array.from({ length: TOTAL_CELLS }, (_, i) => {
		const v = seeded(seed + i * 7);
		if (v < .45) return 0;
		if (v < .65) return 1;
		if (v < .8) return 2;
		if (v < .92) return 3;
		return 4;
	});
}
function cellDate(cellIndex) {
	// cellIndex 0 = oldest cell (top-left), TOTAL_CELLS-1 = today or close
	const daysAgo = TOTAL_CELLS - 1 - cellIndex;
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	return d;
}
// Returns month label per column (week): { col, label } only when month changes
function getMonthLabels() {
	const MONTH_SHORT = [
		"JAN",
		"FEB",
		"MAR",
		"APR",
		"MAY",
		"JUN",
		"JUL",
		"AUG",
		"SEP",
		"OCT",
		"NOV",
		"DEC"
	];
	const labels = [];
	let lastMonth = -1;
	for (let col = 0; col < WEEKS; col++) {
		const d = cellDate(col * 7);
		const m = d.getMonth();
		if (m !== lastMonth) {
			labels.push({
				col,
				label: MONTH_SHORT[m]
			});
			lastMonth = m;
		}
	}
	return labels;
}
const HEAT_BG = [
	"#1A1A2E",
	"rgba(124,58,237,0.22)",
	"rgba(124,58,237,0.45)",
	"rgba(168,85,247,0.68)",
	"#A855F7"
];
// ─── Diff / cat ───────────────────────────────────────────────────────────────
const DIFF_STYLE = {
	LV1: {
		text: "text-sky-400",
		bg: "bg-sky-500/15",
		border: "border-sky-500/30",
		dot: "#38bdf8"
	},
	LV2: {
		text: "text-emerald-400",
		bg: "bg-emerald-500/15",
		border: "border-emerald-500/30",
		dot: "#34d399"
	},
	LV3: {
		text: "text-amber-400",
		bg: "bg-amber-500/15",
		border: "border-amber-500/30",
		dot: "#fbbf24"
	},
	LV4: {
		text: "text-orange-400",
		bg: "bg-orange-500/15",
		border: "border-orange-500/30",
		dot: "#fb923c"
	},
	LV5: {
		text: "text-rose-400",
		bg: "bg-rose-500/15",
		border: "border-rose-500/30",
		dot: "#fb7185"
	}
};
const CAT_COLORS = {
	Array: "bg-violet-500/15 text-violet-300 border-violet-500/25",
	String: "bg-sky-500/15 text-sky-300 border-sky-500/25",
	DP: "bg-amber-500/15 text-amber-300 border-amber-500/25",
	Graph: "bg-teal-500/15 text-teal-300 border-teal-500/25",
	Tree: "bg-green-500/15 text-green-300 border-green-500/25",
	Greedy: "bg-orange-500/15 text-orange-300 border-orange-500/25",
	"Stack/Queue": "bg-pink-500/15 text-pink-300 border-pink-500/25",
	"Two Pointer": "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
	Math: "bg-rose-500/15 text-rose-300 border-rose-500/25"
};
function todayDateLabel() {
	const d = new Date();
	const days = [
		"일",
		"월",
		"화",
		"수",
		"목",
		"금",
		"토"
	];
	return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}
const SOLVED_KEY = `cosmos_solved_${todaySeed()}`;
// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DailyPage() {
	const navigate = useNavigate();
	const problems = getDailyProblems();
	const heatmap = getHeatmapData();
	const user = getStoredUser() || {};
	const [solved] = useState(() => {
		try {
			return new Set(JSON.parse(localStorage.getItem(SOLVED_KEY) || "[]"));
		} catch {
			return new Set();
		}
	});
	const [cardIndex, setCardIndex] = useState(0);
	const [heatTip, setHeatTip] = useState(null);
	const solvedCount = problems.filter((p) => solved.has(p.id)).length;
	const currentProblem = problems[cardIndex];
	const ds = DIFF_STYLE[currentProblem.difficulty] || DIFF_STYLE["LV1"];
	const catStyle = CAT_COLORS[currentProblem.category] || "bg-[#1A1A2E] text-[#6B6890] border-[#2A2845]";
	const isSolved = solved.has(currentProblem.id);
	const circumference = 2 * Math.PI * 14;
	function handleSolve() {
		setCurrentProblem(currentProblem);
		navigate("/solve");
	}
	return <div className="h-full flex flex-col bg-[#05050F] overflow-y-auto">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 28% at 50% 0%, rgba(124,58,237,0.11) 0%, transparent 60%)" }} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="relative z-50 px-5 pt-10 pb-3 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-[#4A4870] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {todayDateLabel()}
            </p>
            <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span className="text-[#8B7FC4]">안녕하세요, </span>
              <span className="text-[#C084FC]">{user.name || "코스모스"}님</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress ring */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="relative w-11 h-11">
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="22" cy="22" r="14" stroke="#1E1D35" strokeWidth="3.5" fill="none" />
                  <circle cx="22" cy="22" r="14" stroke="url(#pr)" strokeWidth="3.5" fill="none" strokeDasharray={`${solvedCount / 5 * circumference} ${circumference}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
                  <defs>
                    <linearGradient id="pr" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#E2E0F0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {solvedCount}/5
                </span>
              </div>
              <span className="text-[9px] text-[#4A4870]" style={{ fontFamily: "'Outfit', sans-serif" }}>오늘 진행</span>
            </div>

            <UserMenu />
          </div>
        </div>
      </div>

      {/* ── Heatmap ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-5 mb-4 shrink-0">
        <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              학습 기록
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#3A3860]" style={{ fontFamily: "'Outfit', sans-serif" }}>적게</span>
              {HEAT_BG.map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-[3px]" style={{
		background: c,
		border: "1px solid rgba(255,255,255,0.04)"
	}} />)}
              <span className="text-[10px] text-[#3A3860]" style={{ fontFamily: "'Outfit', sans-serif" }}>많이</span>
            </div>
          </div>
          {/* Grid: 20 cols × 7 rows */}
          <div className="flex gap-[3px]">
            {Array.from({ length: WEEKS }, (_, col) => <div key={col} className="flex flex-col gap-[3px] flex-1">
                {Array.from({ length: 7 }, (_, row) => {
		const i = col * 7 + row;
		const v = heatmap[i];
		const d = cellDate(i);
		const label = `${d.getMonth() + 1}월 ${d.getDate()}일`;
		const count = v === 0 ? 0 : v === 1 ? 1 : v === 2 ? 3 : v === 3 ? 6 : 10;
		return <button key={row} onClick={(e) => {
			e.stopPropagation();
			const rect = e.target.getBoundingClientRect();
			setHeatTip((t) => t?.label === label ? null : {
				label,
				count,
				x: rect.left + rect.width / 2,
				y: rect.top - 8
			});
		}} className="rounded-[2px] transition-all duration-100 hover:brightness-150 active:scale-90" style={{
			aspectRatio: "1",
			background: HEAT_BG[v],
			border: heatTip?.label === label ? "1px solid rgba(168,85,247,0.7)" : "1px solid rgba(255,255,255,0.03)"
		}} />;
	})}
              </div>)}
          </div>

          {/* Month labels below grid */}
          <div className="relative h-4 mt-1.5">
            {getMonthLabels().map(({ col, label }) => <span key={label + col} className="absolute text-[9px] font-medium tracking-wide" style={{
		left: `${col / WEEKS * 100}%`,
		color: "#3A3860",
		fontFamily: "'JetBrains Mono', monospace",
		transform: "translateX(-0%)"
	}}>
                {label}
              </span>)}
          </div>
        </div>
      </div>

      {/* ── Problem carousel ─────────────────────────────────────────────────── */}
      <div className="relative z-10 px-5 pb-8 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#A855F7]" style={{ boxShadow: "0 0 6px rgba(168,85,247,0.8)" }} />
          <span className="text-sm font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            오늘의 문제
          </span>
        </div>

        <div className="rounded-2xl border overflow-hidden transition-all duration-300" style={{
		borderColor: isSolved ? "rgba(168,85,247,0.3)" : "#1E1D35",
		background: "#0D0D1F",
		boxShadow: isSolved ? "0 0 28px rgba(124,58,237,0.1)" : "none"
	}}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #7C3AED, #A855F7 60%, transparent)" }} />

          <div className="p-4">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ds.text} ${ds.bg} ${ds.border}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ds.dot }} />
                {currentProblem.difficulty}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${catStyle}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                {currentProblem.category}
              </span>
              {isSolved && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border text-[#A855F7] bg-[#7C3AED]/12 border-[#7C3AED]/25" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  ✓ 완료
                </span>}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold mb-2 leading-snug" style={{
		fontFamily: "'Outfit', sans-serif",
		color: isSolved ? "#8B7FC4" : "#E2E0F0"
	}}>
              {currentProblem.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-[#6B6890] leading-relaxed mb-4" style={{
		fontFamily: "'Outfit', sans-serif",
		display: "-webkit-box",
		WebkitLineClamp: 3,
		WebkitBoxOrient: "vertical",
		overflow: "hidden"
	}}>
              {currentProblem.description}
            </p>

            {/* Example box */}
            <div className="rounded-xl border border-[#1A1A30] bg-[#08081A] p-3 mb-4">
              <p className="text-[10px] text-[#4A4870] mb-2 font-semibold tracking-wider uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                입력 예시
              </p>
              {currentProblem.examples.slice(0, 1).map((ex, i) => <div key={i} className="flex flex-col gap-1">
                  <p className="text-xs text-[#8B7FC4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span className="text-[#4A4870] mr-1">입력</span>{ex.input}
                  </p>
                  <p className="text-xs text-[#C084FC]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span className="text-[#4A4870] mr-1">출력</span>{ex.output}
                  </p>
                </div>)}
            </div>

            {/* CTA */}
            <button onClick={handleSolve} className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-150" style={{
		fontFamily: "'Outfit', sans-serif",
		background: isSolved ? "rgba(124,58,237,0.12)" : "linear-gradient(135deg, #7C3AED, #A855F7)",
		color: isSolved ? "#A855F7" : "white",
		boxShadow: isSolved ? "none" : "0 4px 18px rgba(124,58,237,0.4)",
		border: isSolved ? "1px solid rgba(124,58,237,0.28)" : "none"
	}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <path d="M2.5 2l8 4.5-8 4.5V2z" />
              </svg>
              {isSolved ? "다시 풀기" : "오늘의 문제 풀기"}
            </button>
          </div>

          {/* Carousel nav */}
          <div className="flex items-center justify-between px-4 pb-4">
            <button onClick={() => setCardIndex((i) => Math.max(0, i - 1))} disabled={cardIndex === 0} className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-25" style={{ background: "#151525" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="#8B7FC4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              {problems.map((p, i) => <button key={p.id} onClick={() => setCardIndex(i)} className="rounded-full transition-all duration-200" style={{
		width: i === cardIndex ? 20 : 6,
		height: 6,
		background: i === cardIndex ? "linear-gradient(90deg, #7C3AED, #A855F7)" : solved.has(p.id) ? "rgba(168,85,247,0.4)" : "#2A2845"
	}} />)}
            </div>

            <button onClick={() => setCardIndex((i) => Math.min(4, i + 1))} disabled={cardIndex === 4} className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-25" style={{ background: "#151525" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l5 5-5 5" stroke="#8B7FC4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {solvedCount === 5 && <div className="mt-3 rounded-2xl border border-[#7C3AED]/25 p-3.5 flex items-center gap-3" style={{ background: "rgba(124,58,237,0.06)" }}>
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-bold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>오늘 챌린지 완료!</p>
              <p className="text-xs text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>내일 새로운 5문제가 기다려요</p>
            </div>
          </div>}
      </div>

      {/* Heatmap tooltip backdrop */}
      {heatTip && <div className="fixed inset-0 z-[290]" onClick={() => setHeatTip(null)} />}

      {/* Heatmap tooltip */}
      {heatTip && <div className="fixed z-[300] pointer-events-none px-3 py-2 rounded-xl text-xs" style={{
		left: heatTip.x,
		top: heatTip.y,
		transform: "translate(-50%, -100%)",
		background: "#0F0E1E",
		border: "1px solid rgba(168,85,247,0.3)",
		boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
		fontFamily: "'Outfit', sans-serif",
		whiteSpace: "nowrap"
	}} onClick={() => setHeatTip(null)}>
          <p className="text-[#8B7FC4] mb-0.5">{heatTip.label}</p>
          <p className="font-semibold" style={{ color: heatTip.count > 0 ? "#C084FC" : "#4A4870" }}>
            {heatTip.count > 0 ? `${heatTip.count}개 풀이` : "풀이 없음"}
          </p>
        </div>}
    </div>;
}
