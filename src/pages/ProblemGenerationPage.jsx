import PageHeader from "../components/common/PageHeader.jsx";
import UserMenu from "../components/common/UserMenu.jsx";
import { useProblemGenerationPage } from "../features/problem-generation/useProblemGenerationPage.js";
const DIFFICULTIES = [
	"LV1",
	"LV2",
	"LV3",
	"LV4",
	"LV5"
];
const ALL_CATEGORIES = [
	"Array",
	"String",
	"DP",
	"Graph",
	"Tree",
	"Stack/Queue",
	"Binary Search",
	"Greedy",
	"Backtracking",
	"Two Pointer",
	"Hash",
	"Heap",
	"Sorting",
	"구현",
	"완전탐색"
];
const CATEGORIES_WITH_RANDOM = ["랜덤", ...ALL_CATEGORIES];
const DIFF_COLORS = {
	LV1: {
		bg: "bg-sky-500/15",
		text: "text-sky-400",
		border: "border-sky-500/30"
	},
	LV2: {
		bg: "bg-emerald-500/15",
		text: "text-emerald-400",
		border: "border-emerald-500/30"
	},
	LV3: {
		bg: "bg-amber-500/15",
		text: "text-amber-400",
		border: "border-amber-500/30"
	},
	LV4: {
		bg: "bg-orange-500/15",
		text: "text-orange-400",
		border: "border-orange-500/30"
	},
	LV5: {
		bg: "bg-rose-500/15",
		text: "text-rose-400",
		border: "border-rose-500/30"
	}
};
const MOCK = {
	DP: [{
		id: "",
		title: "여행 경비 최적화",
		difficulty: "LV3",
		category: "DP",
		description: `A씨는 N개의 도시를 순서대로 여행할 계획이다. 각 도시 i에는 숙박비 cost[i]가 있으며, 한 번에 1칸 또는 2칸씩 이동할 수 있다. 단, 마지막 도시(N-1번)에 반드시 도착해야 한다.

여행을 시작할 때 0번 또는 1번 도시에서 출발할 수 있으며, 방문한 도시의 숙박비를 모두 지불해야 한다. A씨가 지불해야 하는 최소 총 숙박비를 구하시오.

단, 도시의 수 N은 2 이상 1,000 이하이며, 각 도시의 숙박비는 0 이상 999 이하의 정수이다.`,
		examples: [{
			input: "cost = [10, 15, 20]",
			output: "15",
			explanation: "1번 도시에서 출발해 2칸 점프로 바로 마지막 도시 도착"
		}, {
			input: "cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]",
			output: "6"
		}],
		constraints: ["2 ≤ N ≤ 1000", "0 ≤ cost[i] ≤ 999"]
	}, {
		id: "",
		title: "최장 증가 부분수열 (LIS)",
		difficulty: "LV4",
		category: "DP",
		description: `정수로 이루어진 수열 A가 주어졌을 때, 그 수열의 부분수열 중에서 원소가 엄격하게 증가하는 가장 긴 부분수열의 길이를 구하여라.

부분수열이란 수열에서 일부 원소를 제거하고 나머지를 원래 순서대로 나열한 수열이다. 예를 들어 [3, 1, 4, 1, 5, 9] 에서 [1, 4, 5, 9]는 부분수열이지만 [5, 4]는 부분수열이 아니다.

단순한 방법보다 효율적인 방법으로 해결해야 한다.`,
		examples: [{
			input: "A = [10, 9, 2, 5, 3, 7, 101, 18]",
			output: "4",
			explanation: "[2, 3, 7, 101]"
		}, {
			input: "A = [0, 1, 0, 3, 2, 3]",
			output: "4"
		}],
		constraints: ["1 ≤ N ≤ 2500", "-10⁴ ≤ A[i] ≤ 10⁴"]
	}],
	Graph: [{
		id: "",
		title: "도시 간 최단 배송 경로",
		difficulty: "LV3",
		category: "Graph",
		description: `물류 회사에서 N개의 도시 네트워크를 관리한다. 각 도시 사이에는 단방향 도로가 있으며 이동 시간(가중치)이 주어진다. 출발 도시 S에서 모든 도시까지의 최단 이동 시간을 구하시오.

도달할 수 없는 도시는 -1로 표시한다. 간선의 가중치는 항상 양수이며, 같은 도시 쌍에 여러 간선이 존재할 수 있다. 효율적인 알고리즘을 사용하여 O((V+E) log V) 이내로 해결하시오.`,
		examples: [{
			input: "N=4, edges=[[0,1,1],[0,2,4],[1,2,2],[2,3,1]], S=0",
			output: "[0, 1, 3, 4]"
		}],
		constraints: ["1 ≤ N ≤ 10⁴", "1 ≤ 가중치 ≤ 10⁶"]
	}],
	Array: [{
		id: "",
		title: "회전 배열 최댓값의 곱",
		difficulty: "LV4",
		category: "Array",
		description: `정수 배열 nums가 주어진다. 이 배열에서 연속된 부분 배열의 곱이 최대가 되는 값을 구하시오.

배열에는 음수가 포함될 수 있어 누적 곱의 부호가 바뀔 수 있음을 주의하라. 예를 들어 [2, 3, -2, 4]에서 최대 곱 부분배열은 [2, 3]이므로 답은 6이다. 단, 부분배열은 최소 1개의 원소를 포함해야 한다.`,
		examples: [{
			input: "nums = [2, 3, -2, 4]",
			output: "6",
			explanation: "[2, 3]의 곱"
		}, {
			input: "nums = [-2, 0, -1]",
			output: "0"
		}],
		constraints: ["1 ≤ nums.length ≤ 2×10⁴", "-10 ≤ nums[i] ≤ 10"]
	}],
	"Binary Search": [{
		id: "",
		title: "도서관 좌석 배치",
		difficulty: "LV3",
		category: "Binary Search",
		description: `도서관에 N개의 좌석이 일렬로 배치되어 있고, M명의 학생이 입장한다. 학생들은 서로 가장 멀리 떨어져 앉으려 한다. 학생들 사이의 최소 거리를 최대화했을 때 그 값을 구하시오.

좌석 위치는 오름차순으로 정렬된 배열로 주어진다.`,
		examples: [{
			input: "seats=[1,2,8,4,9], M=3",
			output: "3",
			explanation: "1, 4, 9에 앉으면 최소 간격 3"
		}],
		constraints: ["2 ≤ N ≤ 2×10⁵", "2 ≤ M ≤ N"]
	}],
	Greedy: [{
		id: "",
		title: "회의실 최대 예약",
		difficulty: "LV2",
		category: "Greedy",
		description: `하나의 회의실에 N개의 회의 신청이 들어왔다. 각 회의는 시작 시간과 종료 시간이 주어지며, 동시에 두 개의 회의를 진행할 수 없다. 단, 한 회의가 끝나는 시간에 다른 회의를 시작하는 것은 가능하다.

최대한 많은 회의를 진행하려 할 때 최대 회의 수를 구하시오.`,
		examples: [{
			input: "meetings=[[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11],[8,12],[2,14],[12,16]]",
			output: "4"
		}],
		constraints: ["1 ≤ N ≤ 10⁵", "0 ≤ 시작 < 종료 ≤ 10⁹"]
	}]
};
const MOCK_CATEGORIES = Object.keys(MOCK);
function getProblem(difficulty, category) {
	const requestedCat = category === "랜덤" ? MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)] : category;
	const resolvedCat = MOCK[requestedCat] ? requestedCat : "Array";
	const pool = MOCK[resolvedCat];
	const byDiff = pool.filter((p) => p.difficulty === difficulty);
	const src = byDiff.length ? byDiff[Math.floor(Math.random() * byDiff.length)] : pool[Math.floor(Math.random() * pool.length)];
	return {
		...src,
		id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
		difficulty,
		category: resolvedCat,
		categoryKnown: category !== "랜덤"
	};
}
export default function ProblemGenerationPage() {
	const {
		category,
		categoryOptions,
		difficulty,
		dots,
		errorMessage,
		handleGenerate,
		setCategory,
		setDifficulty,
		stage
	} = useProblemGenerationPage({
		categories: CATEGORIES_WITH_RANDOM,
		createMockProblem: getProblem,
		mockCategories: MOCK_CATEGORIES
	});
	return <div className="h-full flex flex-col overflow-y-auto bg-[#05050F]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%)" }} />

      {stage === "loading" && <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05050F]">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
          <div className="relative w-28 h-28 mb-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#7C3AED]/30" style={{ animation: "spin 3s linear infinite" }} />
            <div className="absolute inset-2 rounded-full border border-[#A855F7]/20" style={{ animation: "spin 2s linear infinite reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="9" stroke="#A855F7" strokeWidth="2" />
                <circle cx="22" cy="22" r="3" fill="#A855F7" />
                {[
		0,
		45,
		90,
		135,
		180,
		225,
		270,
		315
	].map((deg, i) => {
		const r = deg * Math.PI / 180;
		return <line key={i} x1={22 + 12 * Math.cos(r)} y1={22 + 12 * Math.sin(r)} x2={22 + 16 * Math.cos(r)} y2={22 + 16 * Math.sin(r)} stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />;
	})}
              </svg>
            </div>
          </div>
          <p className="text-[#A855F7] text-base font-semibold mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>문제 생성 중{".".repeat(dots)}</p>
          <p className="text-[#4A4870] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>{difficulty} · {category === "랜덤" ? "랜덤 카테고리" : category}</p>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>}

      <PageHeader eyebrow="AI Problem Generator" title="문제 생성" subtitle="난이도와 카테고리를 선택해 맞춤 문제를 만들어보세요" action={<UserMenu rounded="rounded-full" />} />

      <div className="relative z-10 px-5 flex-1">
        <div className="mb-6">
          <label className="block text-xs font-medium text-[#6B6890] mb-3 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>난이도</label>
          <div className="grid grid-cols-5 gap-2">
            {DIFFICULTIES.map((d) => {
		const c = DIFF_COLORS[d];
		return <button key={d} onClick={() => setDifficulty(d)} className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-150 ${difficulty === d ? `${c.bg} ${c.text} ${c.border} scale-105` : "bg-[#0D0D1F] text-[#4A4870] border-[#1E1D35]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {d}
                </button>;
	})}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-[#6B6890] mb-3 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>카테고리</label>
          <div className="flex flex-wrap gap-2">
	            {categoryOptions.map((c) => <button key={c} onClick={() => setCategory(c)} className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${category === c ? "bg-[#7C3AED]/25 text-[#C084FC] border-[#7C3AED]/50" : "bg-[#0D0D1F] text-[#6B6890] border-[#1E1D35]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                {c}
              </button>)}
          </div>
        </div>

        <div className="mb-7 rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l1.8 5.4H17l-4.4 3.2 1.7 5.2L10 13l-4.3 2.8 1.7-5.2L3 7.4h5.2L10 2z" fill="#A855F7" fillOpacity="0.8" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E2E0F0] mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>접근 방식 + 코드 통합 풀이</p>
            <p className="text-xs text-[#6B6890] leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
              AI가 문제를 생성하면 알고리즘 카테고리 선택 → 자연어 접근 방식 작성 → 채점 순으로 진행됩니다. 원하면 코드 에디터로도 풀어볼 수 있어요.
            </p>
          </div>
        </div>

        {errorMessage && <p className="mb-3 text-center text-xs text-rose-400" role="alert" style={{ fontFamily: "'Outfit', sans-serif" }}>{errorMessage}</p>}
        <button onClick={handleGenerate} disabled={stage !== "config"} className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-50 mb-8" style={{
		fontFamily: "'Outfit', sans-serif",
		background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
		boxShadow: "0 4px 24px rgba(124,58,237,0.4)"
	}}>
          문제 생성하기
        </button>
      </div>
    </div>;
}
