import { useState, useEffect, useRef } from "react";
import CosmosLogo from "../components/common/CosmosLogo.jsx";
import { getStoredUser } from "../services/auth.js";
// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function seeded(n) {
	const x = Math.sin(n + 1) * 43758.5453;
	return x - Math.floor(x);
}
function todaySeed() {
	const d = new Date();
	return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate();
}
// ─── Battle time: seeded hour 9–20, consistent per day ───────────────────────
function getBattleWindow() {
	const seed = todaySeed();
	const hour = 9 + Math.floor(seeded(seed) * 11);
	const minute = Math.floor(seeded(seed * 3) * 60);
	const start = new Date();
	start.setHours(hour, minute, 0, 0);
	const end = new Date(start.getTime() + 10 * 60 * 1e3);
	return {
		start,
		end
	};
}
// ─── Daily problem pool ───────────────────────────────────────────────────────
const PROBLEMS = [
	{
		title: "피보나치 수열의 합",
		category: "DP",
		difficulty: "LV2",
		description: "정수 N이 주어질 때, F(1)+F(2)+…+F(N)을 구하시오.\nF(1)=1, F(2)=1, F(n)=F(n-1)+F(n-2)",
		testCases: [
			{
				input: "5",
				output: "12"
			},
			{
				input: "10",
				output: "143"
			},
			{
				input: "1",
				output: "1"
			}
		]
	},
	{
		title: "소수 판별",
		category: "Math",
		difficulty: "LV1",
		description: "정수 N이 주어질 때, N이 소수이면 YES, 아니면 NO를 출력하시오.",
		testCases: [
			{
				input: "7",
				output: "YES"
			},
			{
				input: "12",
				output: "NO"
			},
			{
				input: "2",
				output: "YES"
			}
		]
	},
	{
		title: "배열 회전",
		category: "Array",
		difficulty: "LV2",
		description: "정수 배열 A와 정수 K가 주어질 때, A를 오른쪽으로 K번 회전한 결과를 공백으로 구분해 출력하시오.",
		testCases: [
			{
				input: "[1,2,3,4,5] K=2",
				output: "4 5 1 2 3"
			},
			{
				input: "[10,20,30] K=1",
				output: "30 10 20"
			},
			{
				input: "[1] K=5",
				output: "1"
			}
		]
	},
	{
		title: "괄호 유효성 검사",
		category: "Stack/Queue",
		difficulty: "LV2",
		description: "괄호 문자열 S가 주어질 때, 올바른 괄호 문자열이면 YES, 아니면 NO를 출력하시오.",
		testCases: [
			{
				input: "(())()",
				output: "YES"
			},
			{
				input: "(()",
				output: "NO"
			},
			{
				input: "()()()()",
				output: "YES"
			}
		]
	},
	{
		title: "최빈값 구하기",
		category: "Array",
		difficulty: "LV1",
		description: "정수 배열이 주어질 때 가장 많이 등장하는 수를 출력하시오. 동률이면 더 작은 수를 출력하시오.",
		testCases: [
			{
				input: "[1,2,2,3,3,3]",
				output: "3"
			},
			{
				input: "[4,4,5,5,6]",
				output: "4"
			},
			{
				input: "[7]",
				output: "7"
			}
		]
	}
];
function getDailyProblem() {
	return PROBLEMS[todaySeed() % PROBLEMS.length];
}
// ─── Mock leaderboard entries ─────────────────────────────────────────────────
const MOCK_NAMES = [
	"김지훈",
	"이서연",
	"박민준",
	"최유진",
	"강현우",
	"오다은",
	"윤준혁"
];
const MOCK_AVATARS = [
	"JH",
	"SY",
	"MJ",
	"YJ",
	"HW",
	"DE",
	"JH"
];
function getMockBoard(userTime) {
	const seed = todaySeed();
	const entries = Array.from({ length: 4 }, (_, i) => ({
		rank: 0,
		name: MOCK_NAMES[Math.floor(seeded(seed + i * 7) * MOCK_NAMES.length)],
		avatar: MOCK_AVATARS[Math.floor(seeded(seed + i * 7) * MOCK_AVATARS.length)],
		time: Math.floor(30 + seeded(seed + i * 13) * 300)
	}));
	const user = getStoredUser() || {};
	if (userTime !== null) {
		entries.push({
			rank: 0,
			name: user.name || "나",
			avatar: (user.name || "나")[0],
			time: userTime,
			isMe: true
		});
	}
	entries.sort((a, b) => a.time - b.time);
	entries.forEach((e, i) => {
		e.rank = i + 1;
	});
	return entries.slice(0, 5);
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(sec) {
	const m = Math.floor(sec / 60).toString().padStart(2, "0");
	const s = (sec % 60).toString().padStart(2, "0");
	return `${m}:${s}`;
}
function fmtCountdown(ms) {
	if (ms <= 0) return "00:00:00";
	const h = Math.floor(ms / 36e5).toString().padStart(2, "0");
	const m = Math.floor(ms % 36e5 / 6e4).toString().padStart(2, "0");
	const s = Math.floor(ms % 6e4 / 1e3).toString().padStart(2, "0");
	return `${h}:${m}:${s}`;
}
const RANK_MEDAL = [
	"🥇",
	"🥈",
	"🥉",
	"4",
	"5"
];
const DIFF_BADGE = {
	LV1: "text-sky-400 bg-sky-500/15 border-sky-500/30",
	LV2: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
	LV3: "text-amber-400 bg-amber-500/15 border-amber-500/30",
	LV4: "text-orange-400 bg-orange-500/15 border-orange-500/30",
	LV5: "text-rose-400 bg-rose-500/15 border-rose-500/30"
};
// ─── Main Component ───────────────────────────────────────────────────────────
export default function BattlePage() {
	const problem = getDailyProblem();
	const { start } = getBattleWindow();
	const [state, setState] = useState("active");
	const [countdown, setCountdown] = useState(Math.max(0, start.getTime() - Date.now()));
	const [elapsed, setElapsed] = useState(0);
	const [answers, setAnswers] = useState(problem.testCases.map(() => ""));
	const [userTime, setUserTime] = useState(null);
	const [board, setBoard] = useState([]);
	const [gradingDots, setGradingDots] = useState(0);
	const [pendingLeft, setPendingLeft] = useState(0);
	const elapsedRef = useRef(0);
	// Countdown timer
	useEffect(() => {
		if (state !== "waiting") return;
		const iv = setInterval(() => {
			const left = start.getTime() - Date.now();
			if (left <= 0) {
				clearInterval(iv);
				sessionStorage.removeItem("battle_preview");
				setState("active");
				setCountdown(0);
			} else {
				setCountdown(left);
			}
		}, 1e3);
		return () => clearInterval(iv);
	}, [state, start]);
	// Elapsed timer
	useEffect(() => {
		if (state !== "active") return;
		const base = Date.now();
		const iv = setInterval(() => {
			const e = Math.floor((Date.now() - base) / 1e3);
			elapsedRef.current = e;
			setElapsed(e);
			// Auto-end after 10 min
			if (e >= 600) {
				clearInterval(iv);
				finishBattle(e);
			}
		}, 1e3);
		return () => clearInterval(iv);
	}, [state]);
	// Grading dots animation
	useEffect(() => {
		if (state !== "submitted") return;
		let d = 0;
		const iv = setInterval(() => {
			d = (d + 1) % 4;
			setGradingDots(d);
		}, 350);
		return () => clearInterval(iv);
	}, [state]);
	// Pending countdown
	useEffect(() => {
		if (state !== "pending") return;
		const iv = setInterval(() => {
			setPendingLeft((s) => {
				if (s <= 1) {
					clearInterval(iv);
					setState("ended");
					return 0;
				}
				return s - 1;
			});
		}, 1e3);
		return () => clearInterval(iv);
	}, [state]);
	function finishBattle(time) {
		const remaining = Math.max(0, 600 - time);
		setUserTime(time);
		setBoard(getMockBoard(time));
		setPendingLeft(remaining);
		setState(remaining > 0 ? "pending" : "ended");
		sessionStorage.removeItem("battle_preview");
	}
	async function handleSubmit() {
		if (state !== "active") return;
		setState("submitted");
		await new Promise((r) => setTimeout(r, 2e3));
		finishBattle(elapsedRef.current);
	}
	function handleForfeit() {
		if (state !== "active") return;
		finishBattle(elapsedRef.current);
	}
	// ── Waiting ─────────────────────────────────────────────────────────────────
	if (state === "waiting") {
		const battleHour = start.getHours().toString().padStart(2, "0");
		const battleMin = start.getMinutes().toString().padStart(2, "0");
		return <div className="h-full flex flex-col bg-[#05050F] overflow-y-auto">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />

        <div className="relative z-10 px-5 pt-12 pb-4">
          <h2 className="text-lg font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>데일리 배틀</h2>
          <p className="text-xs text-[#6B6890] mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>하루 한 번, 같은 문제 · 빠른 풀이 승부</p>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 gap-8 pb-10">
          {/* Orb */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full" style={{
			background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
			animation: "pulse-glow 2.5s ease-in-out infinite"
		}} />
            <div className="w-24 h-24 rounded-full border-2 border-[#7C3AED]/40 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.08))" }}>
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                <path d="M19 4 L22 14 L32 14 L24 20 L27 30 L19 24 L11 30 L14 20 L6 14 L16 14 Z" stroke="#A855F7" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
                <circle cx="19" cy="19" r="3" fill="#A855F7" fillOpacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-xs text-[#6B6890] mb-2 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              오늘의 배틀까지
            </p>
            <p className="text-5xl font-bold text-[#E2E0F0] tracking-widest tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtCountdown(countdown)}
            </p>
            <p className="text-sm text-[#6B6890] mt-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
              오늘 <span className="text-[#C084FC] font-semibold">{battleHour}:{battleMin}</span> 에 문제가 공개돼요
            </p>
          </div>

          {/* Info card */}
          <div className="w-full rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4 flex flex-col gap-3">
            {[
			{
				icon: "⚡",
				title: "같은 문제, 동시 시작",
				desc: "모든 참여자가 정확히 같은 문제를 받아요"
			},
			{
				icon: "🎯",
				title: "OUTPUT만 제출",
				desc: "테스트 케이스 입력을 보고 정답 출력값을 입력하세요"
			},
			{
				icon: "🏆",
				title: "빠른 순서 TOP 5",
				desc: "가장 빠르게 정답 제출한 5명이 랭킹에 올라요"
			}
		].map(({ icon, title, desc }) => <div key={title} className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</p>
                  <p className="text-xs text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>{desc}</p>
                </div>
              </div>)}
          </div>

        </div>
        <style>{`@keyframes pulse-glow { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }`}</style>
      </div>;
	}
	// ── Active / Submitting ───────────────────────────────────────────────────────
	if (state === "active" || state === "submitted") {
		const remaining = Math.max(0, 600 - elapsed);
		const isSubmitting = state === "submitted";
		const canSubmit = answers.some((a) => a.trim().length > 0) && !isSubmitting;
		return <div className="h-full flex flex-col bg-[#05050F] overflow-hidden">
        {/* Header */}
        <div className="px-5 pb-4 flex flex-col items-center border-b border-[#1E1D35] shrink-0 relative" style={{ paddingTop: "calc(var(--sat) + 52px)" }}>
          {/* LIVE badge */}
          <div className="absolute left-5 flex items-center gap-2" style={{ bottom: 14 }}>
            <div className="w-2 h-2 rounded-full bg-rose-500" style={{ animation: "live-pulse 1.2s ease-in-out infinite" }} />
            <span className="text-xs font-bold text-rose-400 tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
          </div>
          {/* Remaining */}
          <div className="absolute right-5 flex flex-col items-end" style={{ bottom: 10 }}>
            <span className="text-[10px] text-[#4A4870]" style={{ fontFamily: "'Outfit', sans-serif" }}>남은 시간</span>
            <span className="text-sm font-bold text-[#6B6890]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmt(remaining)}
            </span>
          </div>
          {/* Date */}
          {(() => {
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
			return <p className="text-[11px] text-[#4A4870] mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {d.getMonth() + 1}월 {d.getDate()}일 ({days[d.getDay()]})
              </p>;
		})()}
          {/* Timer */}
          <span className="text-3xl font-bold tabular-nums tracking-widest" style={{
			fontFamily: "'JetBrains Mono', monospace",
			color: elapsed > 480 ? "#ef4444" : "#E2E0F0",
			textShadow: elapsed > 480 ? "0 0 16px rgba(239,68,68,0.4)" : "0 0 16px rgba(168,85,247,0.2)"
		}}>
            {fmt(elapsed)}
          </span>
        </div>

        {/* Grading overlay */}
        {isSubmitting && <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05050F]">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#7C3AED]/30" style={{ animation: "spin 2s linear infinite" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <CosmosLogo size={42} />
              </div>
            </div>
            <p className="text-[#A855F7] text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              채점 중{".".repeat(gradingDots)}
            </p>
            <p className="text-[#4A4870] text-sm mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>제출 시간 {fmt(elapsed)}</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="px-4 pt-4 pb-8 flex flex-col gap-4">

            {/* Problem card */}
            <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${DIFF_BADGE[problem.difficulty] || ""}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {problem.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-[#7C3AED]/20 text-[#C084FC] border-[#7C3AED]/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {problem.category}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#E2E0F0] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {problem.title}
              </h2>
              <p className="text-sm text-[#A89EC4] leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {problem.description}
              </p>
            </div>

            {/* Test cases */}
            <div>
              <label className="block text-xs font-medium text-[#6B6890] mb-2.5 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                테스트 케이스 — 출력값을 입력하세요
              </label>
              <div className="flex flex-col gap-3">
                {problem.testCases.map((tc, i) => <div key={i} className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-3.5">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] text-[#6B6890] font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        케이스 {i + 1}
                      </span>
                    </div>
                    {/* Input */}
                    <div className="rounded-xl bg-[#06060E] border border-[#1A1A2E] p-2.5 mb-2.5">
                      <p className="text-[10px] text-[#4A4870] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>INPUT</p>
                      <p className="text-xs text-[#C8B8F8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{tc.input}</p>
                    </div>
                    {/* Output input */}
                    <div className="rounded-xl bg-[#06060E] border border-[#1E1D35] focus-within:border-[#7C3AED]/50 transition-colors p-2.5">
                      <p className="text-[10px] text-[#4A4870] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>OUTPUT</p>
                      <input value={answers[i]} onChange={(e) => {
			if (isSubmitting) return;
			const next = [...answers];
			next[i] = e.target.value;
			setAnswers(next);
		}} readOnly={isSubmitting} placeholder="정답 출력값 입력..." className="w-full bg-transparent text-xs text-[#E2E0F0] placeholder:text-[#2A2845] outline-none" style={{
			fontFamily: "'JetBrains Mono', monospace",
			caretColor: "#A855F7"
		}} />
                    </div>
                  </div>)}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button onClick={handleForfeit} className="flex-none px-5 py-4 rounded-2xl text-sm font-semibold transition-all active:scale-95" style={{
			fontFamily: "'Outfit', sans-serif",
			background: "transparent",
			border: "1px solid #2A2845",
			color: "#6B6890"
		}}>
                포기
              </button>
              <button onClick={handleSubmit} disabled={!canSubmit} className="flex-1 py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40" style={{
			fontFamily: "'Outfit', sans-serif",
			background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
			boxShadow: canSubmit ? "0 4px 20px rgba(124,58,237,0.4)" : "none"
		}}>
                제출하기
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes live-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        `}</style>
      </div>;
	}
	// ── Pending + Ended / Leaderboard ────────────────────────────────────────────
	const myEntry = board.find((e) => e.isMe);
	return <div className="h-full flex flex-col bg-[#05050F] overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%)" }} />

      <div className="relative z-10 px-5 pt-12 pb-4 shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-[#6B6890] tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            오늘의 배틀 종료
          </span>
        </div>
        <h2 className="text-lg font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {problem.title}
        </h2>
      </div>

      <div className="relative z-10 px-5 flex-1 flex flex-col gap-4 pb-8">

        {/* Pending banner */}
        {state === "pending" && <div className="rounded-2xl border border-[#7C3AED]/30 p-4 flex items-center gap-4" style={{ background: "rgba(124,58,237,0.1)" }}>
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#A855F7" strokeWidth="1.6" />
                <path d="M12 7v5l3 3" stroke="#A855F7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                배틀 진행 중
              </p>
              <p className="text-xs text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                제출 시간 <span className="text-[#A855F7] font-mono font-semibold">{fmt(userTime ?? 0)}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold tabular-nums text-[#C084FC]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmt(pendingLeft)}
              </p>
              <p className="text-[10px] text-[#4A4870]" style={{ fontFamily: "'Outfit', sans-serif" }}>후 결과 공개</p>
            </div>
          </div>}

        {/* Results — blurred while pending */}
        <div style={{
		filter: state === "pending" ? "blur(4px)" : "none",
		pointerEvents: state === "pending" ? "none" : "auto",
		transition: "filter 0.6s ease"
	}}>

        {/* My result */}
        {myEntry && <div className="rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/8 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/25 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-[#C084FC]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {myEntry.rank <= 3 ? RANK_MEDAL[myEntry.rank - 1] : `#${myEntry.rank}`}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {myEntry.rank}위 달성!
              </p>
              <p className="text-xs text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                제출 시간 <span className="text-[#A855F7] font-semibold font-mono">{fmt(myEntry.time)}</span>
              </p>
            </div>
          </div>}

        {/* Leaderboard */}
        <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1E1D35] flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.5 4H13l-3.6 2.6 1.4 4.3L7 9.5l-3.8 2.4 1.4-4.3L1 5h4.5L7 1z" fill="#F59E0B" fillOpacity="0.9" />
            </svg>
            <span className="text-xs font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              TOP 5 랭킹
            </span>
          </div>
          <div className="flex flex-col">
            {board.map((entry, idx) => <div key={idx} className={`flex items-center gap-3 px-4 py-3.5 ${idx < board.length - 1 ? "border-b border-[#1A1A2E]" : ""} ${entry.isMe ? "bg-[#7C3AED]/6" : ""}`}>
                {/* Rank */}
                <div className="w-7 text-center shrink-0">
                  {entry.rank <= 3 ? <span className="text-base">{RANK_MEDAL[entry.rank - 1]}</span> : <span className="text-sm font-bold text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {entry.rank}
                    </span>}
                </div>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${entry.isMe ? "bg-[#7C3AED]/30 text-[#C084FC]" : "bg-[#1A1A2E] text-[#6B6890]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {entry.avatar}
                </div>
                {/* Name */}
                <span className={`flex-1 text-sm font-medium ${entry.isMe ? "text-[#C084FC]" : "text-[#B0A8D0]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {entry.name} {entry.isMe && <span className="text-[10px] text-[#7C3AED] ml-1">나</span>}
                </span>
                {/* Time */}
                <div className="text-right">
                  <span className={`text-sm font-bold tabular-nums ${entry.rank === 1 ? "text-amber-400" : entry.isMe ? "text-[#A855F7]" : "text-[#6B6890]"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(entry.time)}
                  </span>
                </div>
              </div>)}
          </div>
        </div>

        {/* Problem answer reveal */}
        <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
          <p className="text-xs text-[#6B6890] mb-3 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            정답 확인
          </p>
          <div className="flex flex-col gap-2.5">
            {problem.testCases.map((tc, i) => {
		const userAns = answers[i]?.trim();
		const correct = userAns === tc.output;
		return <div key={i} className={`rounded-xl border p-3 ${userAns ? correct ? "border-emerald-500/25 bg-emerald-500/6" : "border-rose-500/25 bg-rose-500/6" : "border-[#1A1A2E] bg-[#06060E]"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>케이스 {i + 1}</span>
                    {userAns && <span className={`text-[10px] font-semibold ${correct ? "text-emerald-400" : "text-rose-400"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {correct ? "✓ 정답" : "✗ 오답"}
                      </span>}
                  </div>
                  <div className="flex gap-2 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span className="text-[#4A4870]">IN</span>
                    <span className="text-[#C8B8F8] flex-1">{tc.input}</span>
                  </div>
                  <div className="flex gap-2 text-xs mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span className="text-[#4A4870]">정답</span>
                    <span className="text-emerald-400">{tc.output}</span>
                    {userAns && !correct && <span className="text-rose-400 ml-2">내 답: {userAns}</span>}
                  </div>
                </div>;
	})}
          </div>
        </div>

        <p className="text-center text-xs text-[#3A3860] pb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          내일 또 다른 문제가 기다리고 있어요 🚀
        </p>

        </div>{/* end blur wrapper */}
      </div>
    </div>;
}
