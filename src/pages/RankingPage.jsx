import { Link } from "react-router";
import PageHeader from "../components/common/PageHeader.jsx";
import { PROBLEM_CATEGORIES, PROBLEM_DIFFICULTIES } from "../constants/problemOptions.js";
import { useRankingPage } from "../features/ranking/useRankingPage.js";
export default function RankingPage() {
	const {
		myRanking,
		rankFilter,
		rankings,
		rankingError,
		rankingLoading,
		rankTab,
		retryRankings,
		selectRankTab,
		setRankFilter
	} = useRankingPage();
	const hasRankingData = rankings.length > 0;
	return <div className="h-full flex flex-col bg-[#05050F] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-44 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 65%)" }} />

      <PageHeader eyebrow="Global Ranking" title="랭킹" subtitle="문제를 풀고 순위를 올려보세요" />

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-8">

        {/* Tabs */}
        <div className="mb-3">
          <div className="flex rounded-xl overflow-hidden border border-[#1E1D35]" style={{ background: "#08081A" }}>
            {["난이도", "카테고리"].map((tab) => <button key={tab} onClick={() => selectRankTab(tab)} className="flex-1 py-2.5 text-sm font-semibold transition-all duration-150" style={{
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
          {(rankTab === "난이도" ? ["전체", ...PROBLEM_DIFFICULTIES] : ["전체", ...PROBLEM_CATEGORIES]).map((f) => <button key={f} onClick={() => setRankFilter(f)} className={`${rankTab === "난이도" ? "w-full px-0" : "px-3"} py-1.5 rounded-full text-[11px] font-medium border transition-all duration-150`} style={{
		fontFamily: rankTab === "난이도" ? "'JetBrains Mono', monospace" : "'Outfit', sans-serif",
		background: rankFilter === f ? "rgba(124,58,237,0.25)" : "transparent",
		borderColor: rankFilter === f ? "rgba(168,85,247,0.5)" : "#2A2845",
		color: rankFilter === f ? "#C084FC" : "#4A4870"
	}}>
              {f}
            </button>)}
        </div>

        {rankingLoading ? <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4" aria-label="랭킹을 불러오는 중">
            {[0, 1, 2, 3].map((item) => <div key={item} className="flex animate-pulse items-center gap-3 border-b border-[#1A1A2E] py-3 last:border-b-0">
                <div className="h-4 w-6 rounded bg-[#1A1A2E]" />
                <div className="h-9 w-9 rounded-xl bg-[#1A1A2E]" />
                <div className="h-4 flex-1 rounded bg-[#1A1A2E]" />
                <div className="h-4 w-14 rounded bg-[#1A1A2E]" />
              </div>)}
          </div> : rankingError ? <div className="mt-8 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] px-6 text-center">
            <p className="text-sm font-semibold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>랭킹을 불러오지 못했습니다</p>
            <p className="mt-2 text-xs text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>잠시 후 다시 시도해 주세요.</p>
            <button type="button" onClick={retryRankings} className="mt-6 rounded-xl border border-[#7C3AED]/40 bg-[#7C3AED]/20 px-6 py-2.5 text-sm font-semibold text-[#C084FC]">
              다시 시도
            </button>
          </div> : <>
        {myRanking && <>
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
			{myRanking.profileImageUrl ? <img src={myRanking.profileImageUrl} alt={`${myRanking.username} 프로필`} className="h-full w-full rounded-xl object-cover" /> : myRanking.username[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#4A4870] mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>내 순위</p>
            <p className="text-sm font-semibold text-[#C084FC]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {myRanking.username} · {myRanking.point.toLocaleString()}pt
            </p>
          </div>
          <span className="text-2xl font-black text-[#E2E0F0] shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            #{myRanking.rank}
          </span>
        </div>
        </>}

        {/* Leaderboard */}
        {hasRankingData ? <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] overflow-hidden">
          {rankings.map((entry, i) => <div key={`${entry.username}-${entry.rank}-${i}`} className="flex items-center gap-3 px-4 py-3.5" style={{
		borderBottom: i < rankings.length - 1 ? "1px solid #1A1A2E" : "none",
		background: myRanking?.username === entry.username ? "rgba(124,58,237,0.10)" : "transparent"
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
				{entry.profileImageUrl ? <img src={entry.profileImageUrl} alt={`${entry.username} 프로필`} className="h-full w-full rounded-xl object-cover" /> : entry.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#E2E0F0] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>{entry.username}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-[#E2E0F0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {entry.point.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#4A4870] ml-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>pt</span>
              </div>
            </div>)}
        </div> : <div className="mt-8 flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] px-6 py-10 text-center">
            <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#2A2845] bg-[#151525]">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <rect x="5" y="21" width="7" height="9" rx="2" fill="#4A4870" />
                <rect x="14.5" y="13" width="7" height="17" rx="2" fill="#7C3AED" />
                <rect x="24" y="17" width="7" height="13" rx="2" fill="#8B7FC4" />
                <path d="M5 32H31" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              아직 랭킹 데이터가 없습니다
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              문제를 푼 사용자가 아직 없어요.<br />
              첫 번째 랭커가 되어보세요!
            </p>

            <Link to="/problems/new" className="mt-8 w-full max-w-[210px] rounded-xl border border-[#7C3AED]/40 bg-[#7C3AED]/20 py-3 text-sm font-semibold text-[#C084FC] transition-all active:scale-[0.97]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              문제 풀기
            </Link>
          </div>}
        </>}
      </div>
    </div>;
}
