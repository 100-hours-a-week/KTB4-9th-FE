import { NavLink } from "react-router";

function SparkIcon({ active }) {
  const color = active ? "#C084FC" : "#6B6890";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={active ? color : "none"} fillOpacity="0.22" />
    </svg>
  );
}

function BattleIcon({ active }) {
  const color = active ? "#C084FC" : "#6B6890";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4.5 13.5H11L10 22l9.5-12H13V2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={active ? color : "none"} fillOpacity="0.22" />
    </svg>
  );
}

function HomeIcon({ active }) {
  const color = active ? "#FFFFFF" : "#6B6890";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1v-9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={active ? "rgba(255,255,255,0.16)" : "none"} />
    </svg>
  );
}

function BookIcon({ active }) {
  const color = active ? "#C084FC" : "#6B6890";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h7v16H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm7 0h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-7V4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={active ? color : "none"} fillOpacity="0.16" />
    </svg>
  );
}

function RankingIcon({ active }) {
  const colors = active
    ? ["#A855F7", "#C084FC", "#9333EA"]
    : ["#3A3860", "#4A4870", "#2E2C50"];

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="11" width="6" height="9" rx="1" fill={colors[0]} />
      <rect x="9" y="6" width="6" height="14" rx="1" fill={colors[1]} />
      <rect x="16" y="13" width="6" height="7" rx="1" fill={colors[2]} />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: "/generate", label: "생성", Icon: SparkIcon },
  { to: "/battle", label: "배틀", Icon: BattleIcon },
  { to: "/home", label: "홈", Icon: HomeIcon },
  { to: "/mypage", label: "내 문제", Icon: BookIcon },
  { to: "/rankings", label: "랭킹", Icon: RankingIcon },
];

export default function BottomNavigation() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="relative z-[100] flex shrink-0 items-center justify-around border-t border-[#1E1D35] bg-[#08081A]/95 px-1 pt-2.5 backdrop-blur-md"
      style={{ paddingBottom: "calc(0.75rem + var(--sab))" }}
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center gap-0.5 transition-all duration-200 ${isActive ? "text-[#A855F7]" : "text-[#6B6890]"}`}
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${isActive ? "bg-[#2A1355] shadow-[0_0_18px_rgba(124,58,237,0.18)]" : ""}`}
              >
                <Icon active={isActive} />
              </span>
              <span className="whitespace-nowrap text-[10px] font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
