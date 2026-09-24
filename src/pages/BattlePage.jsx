import CosmosLogo from "../components/common/CosmosLogo.jsx";

export default function BattlePage() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#05050F] px-6 pb-10 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.06) 30%, transparent 62%)",
        }}
      />

      <div className="pointer-events-none absolute left-[13%] top-[18%] h-1 w-1 rounded-full bg-[#C084FC] opacity-70 shadow-[0_0_8px_#A855F7]" />
      <div className="pointer-events-none absolute right-[18%] top-[27%] h-1.5 w-1.5 rounded-full bg-[#8B7FC4] opacity-50 shadow-[0_0_10px_#7C3AED]" />
      <div className="pointer-events-none absolute bottom-[24%] left-[22%] h-1 w-1 rounded-full bg-white opacity-35" />

      <section className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <div
          className="mb-7 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#7C3AED]/40 bg-[#121126]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(168,85,247,0.08), 0 18px 60px rgba(124,58,237,0.28)",
          }}
        >
          <CosmosLogo size={58} color="#C084FC" />
        </div>

        <p
          className="mb-9 text-3xl font-bold tracking-[0.22em] text-[#E2E0F0]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          COSMOS
        </p>

        <h1
          className="text-2xl font-bold text-[#F2F0FA]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          배틀 기능 준비 중...
        </h1>

        <p
          className="mt-4 text-sm leading-6 text-[#8B87A8]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          매일 오후 12시, 가장 빨리 문제를 푸는
          <br />
          TOP 5가 되어볼 수 있습니다!
        </p>
      </section>
    </div>
  );
}
