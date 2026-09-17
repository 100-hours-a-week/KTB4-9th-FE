import { useState } from "react";
import { getStoredUser } from "../../services/auth.js";

export function useRankingPage() {
  const [rankTab, setRankTab] = useState("난이도");
  const [rankFilter, setRankFilter] = useState("전체");
  const user = getStoredUser() || {};

  const selectRankTab = (tab) => {
    setRankTab(tab);
    setRankFilter("전체");
  };

  return {
    rankFilter,
    rankTab,
    selectRankTab,
    setRankFilter,
    user,
  };
}
