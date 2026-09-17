import { useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import { getStoredUser } from "../services/auth.js";
const RANK_DATA = [
	{
		rank: 1,
		name: "김민준",
		initial: "김",
		solved: 312,
		streak: 90,
		pts: 11480
	},
	{
		rank: 2,
		name: "이서연",
		initial: "이",
		solved: 287,
		streak: 61,
		pts: 10254
	},
	{
		rank: 3,
		name: "박지호",
		initial: "박",
		solved: 253,
		streak: 45,
		pts: 8820
	},
	{
		rank: 4,
		name: "윤소율",
		initial: "윤",
		solved: 171,
		streak: 28,
		pts: 6013
	},
	{
		rank: 5,
		name: "최유진",
		initial: "최",
		solved: 149,
		streak: 14,
		pts: 5356
	},
	{
		rank: 6,
		name: "강태영",
		initial: "강",
		solved: 157,
		streak: 22,
		pts: 5348
	},
	{
		rank: 7,
		name: "조현우",
		initial: "조",
		solved: 153,
		streak: 30,
		pts: 5340
	},
	{
		rank: 8,
		name: "나",
		initial: "나",
		solved: 134,
		streak: 17,
		pts: 4691
	},
	{
		rank: 9,
		name: "한지수",
		initial: "한",
		solved: 128,
		streak: 11,
		pts: 4412
	},
	{
		rank: 10,
		name: "오승현",
		initial: "오",
		solved: 119,
		streak: 9,
		pts: 4105
	},
	{
		rank: 11,
		name: "임채원",
		initial: "임",
		solved: 115,
		streak: 20,
		pts: 3980
	},
	{
		rank: 12,
		name: "신다은",
		initial: "신",
		solved: 108,
		streak: 6,
		pts: 3764
	},
	{
		rank: 13,
		name: "문준혁",
		initial: "문",
		solved: 103,
		streak: 14,
		pts: 3640
	},
	{
		rank: 14,
		name: "배수빈",
		initial: "배",
		solved: 99,
		streak: 8,
		pts: 3501
	},
	{
		rank: 15,
		name: "황지민",
		initial: "황",
		solved: 95,
		streak: 12,
		pts: 3388
	},
	{
		rank: 16,
		name: "전유나",
		initial: "전",
		solved: 92,
		streak: 5,
		pts: 3245
	},
	{
		rank: 17,
		name: "류성민",
		initial: "류",
		solved: 89,
		streak: 18,
		pts: 3120
	},
	{
		rank: 18,
		name: "고아름",
		initial: "고",
		solved: 86,
		streak: 7,
		pts: 3010
	},
	{
		rank: 19,
		name: "남기현",
		initial: "남",
		solved: 83,
		streak: 3,
		pts: 2890
	},
	{
		rank: 20,
		name: "서예원",
		initial: "서",
		solved: 80,
		streak: 10,
		pts: 2775
	},
	{
		rank: 21,
		name: "장민석",
		initial: "장",
		solved: 77,
		streak: 15,
		pts: 2660
	},
	{
		rank: 22,
		name: "권하늘",
		initial: "권",
		solved: 74,
		streak: 4,
		pts: 2548
	},
	{
		rank: 23,
		name: "유정호",
		initial: "유",
		solved: 71,
		streak: 9,
		pts: 2440
	},
	{
		rank: 24,
		name: "노은지",
		initial: "노",
		solved: 68,
		streak: 13,
		pts: 2335
	},
	{
		rank: 25,
		name: "송재원",
		initial: "송",
		solved: 65,
		streak: 2,
		pts: 2230
	},
	{
		rank: 26,
		name: "안지현",
		initial: "안",
		solved: 63,
		streak: 7,
		pts: 2140
	},
	{
		rank: 27,
		name: "백승우",
		initial: "백",
		solved: 61,
		streak: 11,
		pts: 2055
	},
	{
		rank: 28,
		name: "진수연",
		initial: "진",
		solved: 59,
		streak: 5,
		pts: 1970
	},
	{
		rank: 29,
		name: "홍민재",
		initial: "홍",
		solved: 57,
		streak: 8,
		pts: 1890
	},
	{
		rank: 30,
		name: "차도현",
		initial: "차",
		solved: 55,
		streak: 16,
		pts: 1812
	},
	{
		rank: 31,
		name: "표지은",
		initial: "표",
		solved: 53,
		streak: 3,
		pts: 1735
	},
	{
		rank: 32,
		name: "방준서",
		initial: "방",
		solved: 51,
		streak: 6,
		pts: 1660
	},
	{
		rank: 33,
		name: "위소현",
		initial: "위",
		solved: 49,
		streak: 10,
		pts: 1588
	},
	{
		rank: 34,
		name: "엄태양",
		initial: "엄",
		solved: 47,
		streak: 4,
		pts: 1518
	},
	{
		rank: 35,
		name: "곽다인",
		initial: "곽",
		solved: 45,
		streak: 7,
		pts: 1450
	},
	{
		rank: 36,
		name: "탁승진",
		initial: "탁",
		solved: 44,
		streak: 2,
		pts: 1395
	},
	{
		rank: 37,
		name: "민해린",
		initial: "민",
		solved: 43,
		streak: 9,
		pts: 1342
	},
	{
		rank: 38,
		name: "설준영",
		initial: "설",
		solved: 42,
		streak: 5,
		pts: 1290
	},
	{
		rank: 39,
		name: "도하연",
		initial: "도",
		solved: 41,
		streak: 11,
		pts: 1240
	},
	{
		rank: 40,
		name: "석윤호",
		initial: "석",
		solved: 40,
		streak: 3,
		pts: 1192
	},
	{
		rank: 41,
		name: "계나리",
		initial: "계",
		solved: 39,
		streak: 6,
		pts: 1145
	},
	{
		rank: 42,
		name: "봉세진",
		initial: "봉",
		solved: 38,
		streak: 8,
		pts: 1100
	},
	{
		rank: 43,
		name: "추민하",
		initial: "추",
		solved: 37,
		streak: 4,
		pts: 1056
	},
	{
		rank: 44,
		name: "소지훈",
		initial: "소",
		solved: 36,
		streak: 7,
		pts: 1014
	},
	{
		rank: 45,
		name: "변아영",
		initial: "변",
		solved: 35,
		streak: 2,
		pts: 973
	},
	{
		rank: 46,
		name: "맹재현",
		initial: "맹",
		solved: 34,
		streak: 5,
		pts: 933
	},
	{
		rank: 47,
		name: "국수빈",
		initial: "국",
		solved: 33,
		streak: 9,
		pts: 894
	},
	{
		rank: 48,
		name: "편도운",
		initial: "편",
		solved: 32,
		streak: 3,
		pts: 857
	},
	{
		rank: 49,
		name: "지혜원",
		initial: "지",
		solved: 31,
		streak: 6,
		pts: 821
	},
	{
		rank: 50,
		name: "염재성",
		initial: "염",
		solved: 30,
		streak: 4,
		pts: 786
	},
	{
		rank: 51,
		name: "원지은",
		initial: "원",
		solved: 29,
		streak: 7,
		pts: 752
	},
	{
		rank: 52,
		name: "창민호",
		initial: "창",
		solved: 28,
		streak: 2,
		pts: 719
	},
	{
		rank: 53,
		name: "구소희",
		initial: "구",
		solved: 27,
		streak: 5,
		pts: 687
	},
	{
		rank: 54,
		name: "이준서",
		initial: "이",
		solved: 26,
		streak: 8,
		pts: 656
	},
	{
		rank: 55,
		name: "김나영",
		initial: "김",
		solved: 25,
		streak: 3,
		pts: 626
	},
	{
		rank: 56,
		name: "박도윤",
		initial: "박",
		solved: 24,
		streak: 6,
		pts: 597
	},
	{
		rank: 57,
		name: "최서준",
		initial: "최",
		solved: 23,
		streak: 4,
		pts: 569
	},
	{
		rank: 58,
		name: "정하은",
		initial: "정",
		solved: 22,
		streak: 2,
		pts: 542
	},
	{
		rank: 59,
		name: "윤지안",
		initial: "윤",
		solved: 21,
		streak: 5,
		pts: 516
	},
	{
		rank: 60,
		name: "강예슬",
		initial: "강",
		solved: 20,
		streak: 7,
		pts: 491
	},
	{
		rank: 61,
		name: "조수민",
		initial: "조",
		solved: 19,
		streak: 3,
		pts: 467
	},
	{
		rank: 62,
		name: "한태양",
		initial: "한",
		solved: 18,
		streak: 4,
		pts: 444
	},
	{
		rank: 63,
		name: "오민지",
		initial: "오",
		solved: 17,
		streak: 2,
		pts: 422
	},
	{
		rank: 64,
		name: "임서현",
		initial: "임",
		solved: 16,
		streak: 6,
		pts: 401
	},
	{
		rank: 65,
		name: "신주원",
		initial: "신",
		solved: 15,
		streak: 3,
		pts: 381
	},
	{
		rank: 66,
		name: "문재호",
		initial: "문",
		solved: 14,
		streak: 1,
		pts: 362
	},
	{
		rank: 67,
		name: "배하린",
		initial: "배",
		solved: 13,
		streak: 4,
		pts: 344
	},
	{
		rank: 68,
		name: "황준수",
		initial: "황",
		solved: 12,
		streak: 2,
		pts: 327
	},
	{
		rank: 69,
		name: "전민규",
		initial: "전",
		solved: 11,
		streak: 5,
		pts: 311
	},
	{
		rank: 70,
		name: "류다현",
		initial: "류",
		solved: 10,
		streak: 3,
		pts: 296
	},
	{
		rank: 71,
		name: "고세영",
		initial: "고",
		solved: 10,
		streak: 1,
		pts: 282
	},
	{
		rank: 72,
		name: "남지호",
		initial: "남",
		solved: 9,
		streak: 4,
		pts: 269
	},
	{
		rank: 73,
		name: "서하준",
		initial: "서",
		solved: 9,
		streak: 2,
		pts: 257
	},
	{
		rank: 74,
		name: "장수아",
		initial: "장",
		solved: 8,
		streak: 3,
		pts: 246
	},
	{
		rank: 75,
		name: "권도희",
		initial: "권",
		solved: 8,
		streak: 1,
		pts: 235
	},
	{
		rank: 76,
		name: "유재민",
		initial: "유",
		solved: 7,
		streak: 2,
		pts: 225
	},
	{
		rank: 77,
		name: "노시연",
		initial: "노",
		solved: 7,
		streak: 4,
		pts: 215
	},
	{
		rank: 78,
		name: "송민기",
		initial: "송",
		solved: 7,
		streak: 1,
		pts: 206
	},
	{
		rank: 79,
		name: "안소율",
		initial: "안",
		solved: 6,
		streak: 3,
		pts: 198
	},
	{
		rank: 80,
		name: "백지혜",
		initial: "백",
		solved: 6,
		streak: 2,
		pts: 190
	},
	{
		rank: 81,
		name: "진현우",
		initial: "진",
		solved: 6,
		streak: 1,
		pts: 183
	},
	{
		rank: 82,
		name: "홍예나",
		initial: "홍",
		solved: 5,
		streak: 3,
		pts: 176
	},
	{
		rank: 83,
		name: "차승민",
		initial: "차",
		solved: 5,
		streak: 2,
		pts: 170
	},
	{
		rank: 84,
		name: "표나연",
		initial: "표",
		solved: 5,
		streak: 1,
		pts: 164
	},
	{
		rank: 85,
		name: "방지원",
		initial: "방",
		solved: 5,
		streak: 4,
		pts: 159
	},
	{
		rank: 86,
		name: "위준혁",
		initial: "위",
		solved: 4,
		streak: 2,
		pts: 154
	},
	{
		rank: 87,
		name: "엄수빈",
		initial: "엄",
		solved: 4,
		streak: 1,
		pts: 149
	},
	{
		rank: 88,
		name: "곽태현",
		initial: "곽",
		solved: 4,
		streak: 3,
		pts: 145
	},
	{
		rank: 89,
		name: "탁다연",
		initial: "탁",
		solved: 4,
		streak: 1,
		pts: 141
	},
	{
		rank: 90,
		name: "민재호",
		initial: "민",
		solved: 3,
		streak: 2,
		pts: 137
	},
	{
		rank: 91,
		name: "설하은",
		initial: "설",
		solved: 3,
		streak: 1,
		pts: 134
	},
	{
		rank: 92,
		name: "도준영",
		initial: "도",
		solved: 3,
		streak: 3,
		pts: 131
	},
	{
		rank: 93,
		name: "석나리",
		initial: "석",
		solved: 3,
		streak: 1,
		pts: 128
	},
	{
		rank: 94,
		name: "계승호",
		initial: "계",
		solved: 3,
		streak: 2,
		pts: 125
	},
	{
		rank: 95,
		name: "봉예린",
		initial: "봉",
		solved: 2,
		streak: 1,
		pts: 122
	},
	{
		rank: 96,
		name: "추도현",
		initial: "추",
		solved: 2,
		streak: 2,
		pts: 119
	},
	{
		rank: 97,
		name: "소재원",
		initial: "소",
		solved: 2,
		streak: 1,
		pts: 116
	},
	{
		rank: 98,
		name: "변민아",
		initial: "변",
		solved: 2,
		streak: 1,
		pts: 113
	},
	{
		rank: 99,
		name: "맹지수",
		initial: "맹",
		solved: 1,
		streak: 1,
		pts: 111
	},
	{
		rank: 100,
		name: "국하영",
		initial: "국",
		solved: 1,
		streak: 1,
		pts: 108
	}
];
export default function RankingPage() {
	const [rankTab, setRankTab] = useState("난이도");
	const [rankFilter, setRankFilter] = useState("전체");
	const user = getStoredUser() || {};
	return <div className="h-full flex flex-col bg-[#05050F] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-44 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 65%)" }} />

      <PageHeader eyebrow="Global Ranking" title="랭킹" subtitle="문제를 풀고 순위를 올려보세요" />

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-8">

        {/* Tabs */}
        <div className="mb-3">
          <div className="flex rounded-xl overflow-hidden border border-[#1E1D35]" style={{ background: "#08081A" }}>
            {["난이도", "카테고리"].map((tab) => <button key={tab} onClick={() => {
		setRankTab(tab);
		setRankFilter("전체");
	}} className="flex-1 py-2.5 text-sm font-semibold transition-all duration-150" style={{
		fontFamily: "'Outfit', sans-serif",
		background: rankTab === tab ? "linear-gradient(135deg, #7C3AED, #A855F7)" : "transparent",
		color: rankTab === tab ? "white" : "#4A4870",
		borderRadius: 10
	}}>
                {tab}
              </button>)}
          </div>
        </div>

        {/* Filter pills */}
        <div className={rankTab === "난이도" ? "mb-4 grid grid-cols-6 gap-1.5" : "mb-4 flex flex-wrap gap-1.5"}>
          {(rankTab === "난이도" ? [
		"전체",
		"LV1",
		"LV2",
		"LV3",
		"LV4",
		"LV5"
	] : [
		"전체",
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
	]).map((f) => <button key={f} onClick={() => setRankFilter(f)} className={`${rankTab === "난이도" ? "w-full px-0" : "px-3"} py-1.5 rounded-full text-[11px] font-medium border transition-all duration-150`} style={{
		fontFamily: rankTab === "난이도" ? "'JetBrains Mono', monospace" : "'Outfit', sans-serif",
		background: rankFilter === f ? "rgba(124,58,237,0.25)" : "transparent",
		borderColor: rankFilter === f ? "rgba(168,85,247,0.5)" : "#2A2845",
		color: rankFilter === f ? "#C084FC" : "#4A4870"
	}}>
              {f}
            </button>)}
        </div>

        {/* My rank card */}
        <div className="mb-3 rounded-2xl p-4 flex items-center gap-3" style={{
		background: "rgba(124,58,237,0.12)",
		border: "1px solid rgba(168,85,247,0.25)"
	}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{
		background: "linear-gradient(135deg, #7C3AED, #A855F7)",
		color: "white",
		fontFamily: "'Outfit', sans-serif"
	}}>
            {(user.name || "나")[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#4A4870] mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>내 순위</p>
            <p className="text-sm font-semibold text-[#C084FC]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {user.name || "개발자"} · 4,691pt
            </p>
          </div>
          <span className="text-2xl font-black text-[#E2E0F0] shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            #8
          </span>
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] overflow-hidden">
          {RANK_DATA.map((entry, i) => <div key={entry.rank} className="flex items-center gap-3 px-4 py-3.5" style={{
		borderBottom: i < RANK_DATA.length - 1 ? "1px solid #1A1A2E" : "none",
		background: entry.rank === 8 ? "rgba(124,58,237,0.10)" : "transparent"
	}}>
              <span className="w-6 text-center text-sm font-bold shrink-0" style={{
		fontFamily: "'JetBrains Mono', monospace",
		color: entry.rank === 1 ? "#FFD700" : entry.rank === 2 ? "#C0C0C0" : entry.rank === 3 ? "#CD7F32" : "#4A4870"
	}}>
                {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
              </span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{
		background: "#1E1D35",
		color: "#8B7FC4",
		fontFamily: "'Outfit', sans-serif"
	}}>
                {entry.initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#E2E0F0] leading-none mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>{entry.name}</p>
                <p className="text-[10px] text-[#4A4870]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  풀이 {entry.solved}개 · 연속 {entry.streak}일
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-[#E2E0F0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {entry.pts.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#4A4870] ml-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>pt</span>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}
