import { useEffect, useState } from "react";
import { getRankings } from "../../api/rankingApi.js";
import { CATEGORY_TO_API } from "../../constants/problemOptions.js";

export function useRankingPage() {
  const [rankTab, setRankTab] = useState("난이도");
  const [rankFilter, setRankFilter] = useState("전체");
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = `${rankTab}:${rankFilter}:${retryCount}`;
  const [rankingResult, setRankingResult] = useState({
    requestKey: null,
    rankings: [],
    myRanking: null,
    error: false,
  });
  const rankingLoading = rankingResult.requestKey !== requestKey;
  const rankingError = !rankingLoading && rankingResult.error;
  const rankings = rankingLoading ? [] : rankingResult.rankings;
  const myRanking = rankingLoading ? null : rankingResult.myRanking;

  useEffect(() => {
    let active = true;
    const filters = {};

    if (rankFilter !== "전체") {
      if (rankTab === "난이도") filters.difficulty = rankFilter;
      else filters.category = CATEGORY_TO_API[rankFilter] ?? rankFilter;
    }

    getRankings(filters)
      .then((response) => {
        if (!active) return;
        setRankingResult({
          requestKey,
          rankings: response.rankings,
          myRanking: response.myRanking,
          error: false,
        });
      })
      .catch(() => {
        if (!active) return;
        setRankingResult({
          requestKey,
          rankings: [],
          myRanking: null,
          error: true,
        });
      });

    return () => {
      active = false;
    };
  }, [rankFilter, rankTab, requestKey]);

  const selectRankTab = (tab) => {
    setRankTab(tab);
    setRankFilter("전체");
  };

  return {
    rankFilter,
    rankTab,
    rankings,
    rankingError,
    rankingLoading,
    retryRankings: () => setRetryCount((count) => count + 1),
    selectRankTab,
    setRankFilter,
    myRanking,
  };
}
