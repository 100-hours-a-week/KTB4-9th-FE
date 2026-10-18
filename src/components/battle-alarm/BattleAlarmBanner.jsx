// 배틀 알림을 확인하는 동안 / 확인에 실패했을 때 화면 위쪽에 잠깐 보이는 안내 띠
export default function BattleAlarmBanner({ banner, onRetry }) {
  const failed = banner === "failed";

  return (
    <div
      role="status"
      className="fixed left-1/2 top-3 z-[110] flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#1E1D35] bg-[#0D0D1F] px-4 py-2 text-xs text-[#A89EC4] shadow-lg"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {!failed && <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />}
      <span>{failed ? "배틀 정보를 확인하지 못했습니다." : "배틀 정보를 확인하고 있습니다."}</span>
      {failed && (
        <button type="button" onClick={onRetry} className="font-semibold text-[#7C3AED]">
          다시 시도하기
        </button>
      )}
    </div>
  );
}
