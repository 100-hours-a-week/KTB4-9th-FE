import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import UserMenu from "../components/common/UserMenu.jsx";
import ProfileAvatar from "../components/common/ProfileAvatar.jsx";
import { useAuth } from "../features/auth/authContext.js";
import DeleteSavedProblemModal from "../components/saved/DeleteSavedProblemModal.jsx";
import SavedProblemCard from "../components/saved/SavedProblemCard.jsx";
import { fetchSavedProblems, setProblemSaved } from "../api/savedProblemApi.js";

// 한 페이지에 보여줄 저장 문제 수
const PAGE_SIZE = 5;

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
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  // 삭제 확인 모달 상태: 대상 문제, 진행 중 여부, 실패 여부
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  // 1. 저장한 문제 목록을 불러옴 (처음 열 때와 "다시 시도"에서 사용)
  function loadSaved() {
    setLoading(true);
    setLoadError(false);
    fetchSavedProblems()
      .then(setSaved)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let cancelled = false;
    fetchSavedProblems()
      .then((list) => { if (!cancelled) setSaved(list); })
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // 2. 선택한 레벨의 문제만 보여주고, 페이지 단위로 자름
  const visible = filter === "전체" ? saved : saved.filter((item) => item.difficulty === filter);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  // 3. 레벨별 저장 개수 (상단 카드에 표시)
  const countOf = (level) => level === "전체" ? saved.length : saved.filter((item) => item.difficulty === level).length;

  function handleFilter(level) {
    setFilter(level);
    setPage(1);
    setExpandedId(null);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setDeleteError(false);
  }

  async function handleConfirmDelete() {
    // 1. 서버에서 삭제하고 진행 중 표시
    setDeleting(true);
    setDeleteError(false);
    try {
      await setProblemSaved(deleteTarget, false);
      // 2. 성공하면 목록에서 빼고 모달을 닫음
      setSaved((list) => list.filter((entry) => entry.id !== deleteTarget.id));
      setExpandedId(null);
      closeDeleteModal();
    } catch {
      // 3. 실패하면 모달에 실패 안내를 보여주고 다시 삭제할 수 있게 함
      setDeleteError(true);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#05050F] px-5 pb-8">
      <header className="flex items-center gap-4 pb-7 pt-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#7C3AED]/70 bg-[#24103F] text-xl font-bold text-[#C084FC]">
          <ProfileAvatar
            src={user.profileImageUrl}
            name={user.name}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-[#E2E0F0]">
            {user.name || "사용자"}
          </p>
          <p className="mt-1 truncate text-sm text-[#77739A]">
            {user.email || "로그인 계정"}
          </p>
        </div>
        <UserMenu menuIcon />
      </header>

      <main className="space-y-5">
        <section className="grid grid-cols-3 gap-2.5">
          {["전체", ...LEVELS].map((level) => (
            <div key={level} className="flex min-h-[86px] flex-col items-center justify-center rounded-2xl border border-[#252342] bg-[#0D0D1F]">
              <strong
                className="text-2xl font-semibold"
                style={{
                  color: level === "전체" ? "var(--cosmos-accent-text)" : LEVEL_COLORS[level],
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {countOf(level)}
              </strong>
              <span className="mt-1 text-xs text-[#77739A]">{level}</span>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-6 gap-2">
          {["전체", ...LEVELS].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleFilter(level)}
              className={`rounded-full border py-2 text-xs font-medium transition-colors ${
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
          {loading ? (
            <p className="py-12 text-center text-sm text-[#77739A]">불러오는 중...</p>
          ) : loadError ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#252342] px-6 py-12 text-center">
              <h2 className="text-base font-bold text-[#F2F0FA]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                저장 문제를 불러오지 못했습니다.
              </h2>
              <p className="mt-2 text-sm text-[#8B87A8]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                잠시 후 다시 시도해 주세요.
              </p>
              <button type="button" onClick={loadSaved} className="mt-5 rounded-xl border border-[#252342] px-4 py-2.5 text-xs font-semibold text-[#A89EC4]">
                다시 시도
              </button>
            </div>
          ) : saved.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#252342] px-6 py-12 text-center">
              <h2 className="text-base font-bold text-[#F2F0FA]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                저장된 문제가 없습니다.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#8B87A8]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                문제 풀이 화면의 북마크로
                <br />
                마음에 드는 문제를 저장해 보세요.
              </p>
              <button type="button" onClick={() => navigate("/problems/new")} className="mt-6 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white">
                문제 생성하기
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-[#252342] px-6 py-12 text-center">
              <h2 className="text-base font-bold text-[#F2F0FA]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                해당 난이도에 저장된 문제가 없습니다.
              </h2>
              <p className="mt-2 text-sm text-[#8B87A8]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                다른 난이도를 선택해 보세요.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-2.5">
                {pageItems.map((item) => (
                  <SavedProblemCard
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    onRetake={() => navigate(`/problems/${item.id}`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                ))}
              </ul>
              {totalPages > 1 && (
                <nav className="mt-5 flex items-center justify-center gap-1.5" aria-label="페이지">
                  <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="이전 페이지" className="h-9 w-9 rounded-lg border border-[#252342] text-[#A89EC4] disabled:opacity-30">‹</button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => { setPage(number); setExpandedId(null); }}
                      aria-current={number === currentPage ? "page" : undefined}
                      className={`h-9 w-9 rounded-lg border text-sm ${number === currentPage ? "border-[#7C3AED] bg-[#351060] text-[#D8B4FE]" : "border-[#252342] text-[#77739A]"}`}
                    >
                      {number}
                    </button>
                  ))}
                  <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="다음 페이지" className="h-9 w-9 rounded-lg border border-[#252342] text-[#A89EC4] disabled:opacity-30">›</button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>

      {deleteTarget && (
        <DeleteSavedProblemModal
          error={deleteError}
          deleting={deleting}
          onCancel={closeDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
