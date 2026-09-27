import { useState } from "react";
import { useNavigate } from "react-router";
import UserMenu from "../components/common/UserMenu.jsx";
import { useAuth } from "../features/auth/authContext.js";

const LEVELS = ["LV1", "LV2", "LV3", "LV4", "LV5"];

const LEVEL_COLORS = {
  LV1: "#22D3EE",
  LV2: "#2DD4BF",
  LV3: "#FACC15",
  LV4: "#FB923C",
  LV5: "#FB7185",
};

export default function MyPage() {
  const navigate = useNavigate();
  const { user = {} } = useAuth();
  const [filter, setFilter] = useState("전체");

  return (
    <div className="h-full overflow-y-auto bg-[#05050F] px-5 pb-8">
      <header className="flex items-center gap-4 pb-7 pt-8">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#7C3AED]/70 bg-[#24103F] text-xl font-bold text-[#C084FC]">
          {(user.name || "?")[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-[#E2E0F0]">
            {user.name || "사용자"}
          </p>
          <p className="mt-1 truncate text-sm text-[#77739A]">
            {user.email || "로그인 계정"}
          </p>
        </div>
        <UserMenu menuIcon rounded="rounded-2xl" />
      </header>

      <main className="space-y-5">
        <section className="grid grid-cols-3 gap-2.5">
          {["전체", ...LEVELS].map((level) => (
            <div key={level} className="flex min-h-[86px] flex-col items-center justify-center rounded-2xl border border-[#252342] bg-[#0D0D1F]">
              <strong
                className="text-2xl font-semibold"
                style={{
                  color: level === "전체" ? "#C084FC" : LEVEL_COLORS[level],
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                0
              </strong>
              <span className="mt-1 text-xs text-[#77739A]">{level}</span>
            </div>
          ))}
        </section>

        <section className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["전체", ...LEVELS].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFilter(level)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                filter === level
                  ? "border-[#7C3AED] bg-[#351060] text-[#D8B4FE]"
                  : "border-[#252342] bg-[#0D0D1F] text-[#77739A]"
              }`}
            >
              {level}
            </button>
          ))}
        </section>

        <section>
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#252342] px-6 py-12 text-center">
            <h2 className="text-lg font-bold text-[#F2F0FA]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              문제 저장 기능 준비 중
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#8B87A8]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              마음에 드는 문제를 저장해두고
              <br />
              언제든 다시 풀어볼 수 있어요!
            </p>
            <button
              type="button"
              onClick={() => navigate("/problems/new")}
              className="mt-6 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white"
            >
              문제 생성하기
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
