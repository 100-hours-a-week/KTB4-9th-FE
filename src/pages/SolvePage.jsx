import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getApiErrorMessage,
  getHintByStage,
  getProblem,
  submitApproach,
  submitCode,
  USE_REAL_APPROACH,
  USE_REAL_CODE,
  USE_REAL_HINT,
  USE_REAL_PROBLEM
} from "../api/problemApi.js";
import { getCurrentProblem } from "../store.js";
import CodeEditor from "../components/CodeEditor.jsx";
import ApproachResult from "../components/ApproachResult.jsx";
import MathText from "../components/common/MathText.jsx";
import {
  ExecutionLimitsCard,
  ProblemConditions,
} from "../components/ProblemSpecifications.jsx";
import { APPROACH_KEYWORDS } from "../constants/approachKeywords.js";
import {
  createMockApproachEvaluation,
  normalizeApproachEvaluation,
} from "../features/approach/approachEvaluation.js";
import {
  loadApproachResult,
  markApproachAnswerRevealed,
  saveApproachResult,
} from "../features/approach/approachResultStorage.js";
import { markDailyProblemSolved } from "../features/home/dailyProgress.js";
import {
  DIFFICULTY_BADGE_CLASSES,
  PROBLEM_CATEGORIES,
} from "../constants/problemOptions.js";
const LANG_STARTERS = {
  Python: "import sys\ninput = sys.stdin.readline\n\n# 여기에 코드를 작성하세요\n",
  JavaScript: "const lines = require(\"fs\").readFileSync(0, \"utf8\").split(\"\\n\");\n\n// 여기에 코드를 작성하세요\n",
  Java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // 여기에 코드를 작성하세요\n    }\n}\n",
  "C++": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // 여기에 코드를 작성하세요\n    return 0;\n}\n"
};
// 언어별 한 줄 주석 기호
const COMMENT_MARKER = { Python: "#", JavaScript: "//", Java: "//", "C++": "//" };
// 힌트 내용을 선택된 언어의 주석 형식으로 감쌈 (이미 주석이거나 빈 줄이면 그대로 둠)
function toComment(text, language) {
  const marker = COMMENT_MARKER[language] ?? "//";
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      return !trimmed || trimmed.startsWith(marker) ? line : `${marker} ${line}`;
    })
    .join("\n");
}
// 채점 결과 종류별 화면 문구
const CODE_RESULT_LABEL = {
  WRONG_ANSWER: "오답",
  COMPILE_ERROR: "컴파일 오류",
  RUNTIME_ERROR: "런타임 오류",
  TIME_LIMIT_EXCEEDED: "시간 초과"
};
const SUPPORTED_LANGUAGES = ["Python", "JavaScript", "Java", "C++"];
const HINTS = {
  DP: {
    hint: {
      Python: `# ===================== AI 힌트 =====================
# [핵심 아이디어] 다이나믹 프로그래밍 (DP)
#
#  dp[i] = i번째 위치에서의 최적값
#
#  점화식:
#    dp[i] = min(dp[i-1], dp[i-2]) + cost[i]
#            ↑ 1칸 전        ↑ 2칸 전
#
#  순서: dp 배열을 앞에서부터 채워나가세요.
#  마지막: min(dp[n-1], dp[n-2]) 가 정답입니다.
# ====================================================

def solution(cost):
    # 여기에 코드를 작성하세요
    pass
`,
      JavaScript: `// =================== AI 힌트 ===================
// [핵심 아이디어] 다이나믹 프로그래밍 (DP)
//
//  dp[i] = i번째 위치에서의 최적값
//
//  점화식:
//    dp[i] = Math.min(dp[i-1], dp[i-2]) + cost[i]
//
//  순서: dp 배열을 앞에서부터 채워나가세요.
//  마지막: Math.min(dp[n-1], dp[n-2]) 가 정답입니다.
// ================================================

function solution(cost) {
  // 여기에 코드를 작성하세요
}
`,
      Java: `// =================== AI 힌트 ===================
// [핵심 아이디어] 다이나믹 프로그래밍 (DP)
//
//  dp[i] = i번째 위치에서의 최적값
//  dp[i] = Math.min(dp[i-1], dp[i-2]) + cost[i]
//
//  마지막: Math.min(dp[n-1], dp[n-2]) 가 정답
// ================================================
class Solution {
    public int solution(int[] cost) {
        // 여기에 코드를 작성하세요
        return 0;
    }
}
`,
      "C++": `// =================== AI 힌트 ===================
// [핵심 아이디어] 다이나믹 프로그래밍 (DP)
//
//  dp[i] = i번째 위치에서의 최적값
//  dp[i] = min(dp[i-1], dp[i-2]) + cost[i]
//
//  마지막: min(dp[n-1], dp[n-2]) 가 정답
// ================================================
int solution(vector<int> cost) {
    // 여기에 코드를 작성하세요
    return 0;
}
`
    },
    answer: {
      Python: `# ===================== 정답 공개 =====================
def solution(cost):
    n = len(cost)
    dp = [0] * n
    dp[0] = cost[0]
    dp[1] = cost[1]
    for i in range(2, n):
        dp[i] = min(dp[i-1], dp[i-2]) + cost[i]
    return min(dp[n-1], dp[n-2])
`,
      JavaScript: `// =================== 정답 공개 ===================
function solution(cost) {
  const n = cost.length;
  const dp = new Array(n).fill(0);
  dp[0] = cost[0];
  dp[1] = cost[1];
  for (let i = 2; i < n; i++) {
    dp[i] = Math.min(dp[i-1], dp[i-2]) + cost[i];
  }
  return Math.min(dp[n-1], dp[n-2]);
}
`,
      Java: `// =================== 정답 공개 ===================
class Solution {
    public int solution(int[] cost) {
        int n = cost.length;
        int[] dp = new int[n];
        dp[0] = cost[0];
        dp[1] = cost[1];
        for (int i = 2; i < n; i++) {
            dp[i] = Math.min(dp[i-1], dp[i-2]) + cost[i];
        }
        return Math.min(dp[n-1], dp[n-2]);
    }
}
`,
      "C++": `// =================== 정답 공개 ===================
int solution(vector<int> cost) {
    int n = cost.size();
    vector<int> dp(n);
    dp[0] = cost[0];
    dp[1] = cost[1];
    for (int i = 2; i < n; i++) {
        dp[i] = min(dp[i-1], dp[i-2]) + cost[i];
    }
    return min(dp[n-1], dp[n-2]);
}
`
    }
  },
  Graph: {
    hint: {
      Python: `# ===================== AI 힌트 =====================
# [핵심 아이디어] 다익스트라 알고리즘
#
#  1. 우선순위 큐(min-heap)를 사용합니다.
#  2. (거리, 노드) 형태로 큐에 넣습니다.
#  3. 꺼낸 노드의 거리 > 저장된 거리면 스킵.
#  4. 인접 노드를 탐색하며 최단 거리를 갱신합니다.
#
#  import heapq  ← 필수!
# ====================================================
def solution(n, edges, src):
    # 여기에 코드를 작성하세요
    pass
`,
      JavaScript: `// =================== AI 힌트 ===================
// [핵심 아이디어] 다익스트라 알고리즘
//
//  1. 우선순위 큐(Min-Heap) 활용
//  2. [거리, 노드] 형태로 큐에 삽입
//  3. 꺼낸 거리 > dist[node] 이면 스킵
//  4. 인접 노드 거리 갱신 후 큐에 삽입
// ================================================
function solution(n, edges, src) {
  // 여기에 코드를 작성하세요
}
`,
      Java: `// =================== AI 힌트 ===================
// 다익스트라: PriorityQueue<int[]> 사용
// new int[]{dist, node} 형태로 삽입
// ================================================
class Solution {
    public int[] solution(int n, int[][] edges, int src) {
        // 여기에 코드를 작성하세요
        return new int[n];
    }
}
`,
      "C++": `// =================== AI 힌트 ===================
// 다익스트라: priority_queue<pair<int, int>> 활용
// {dist, node} 형태로 삽입
// ================================================
vector<int> solution(int n, vector<vector<int>> edges, int src) {
    // 여기에 코드를 작성하세요
    return vector<int>(n);
}
`
    },
    answer: {
      Python: `# ===================== 정답 공개 =====================
import heapq

def solution(n, edges, src):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((w, v))

    dist = [float('inf')] * n
    dist[src] = 0
    heap = [(0, src)]

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for w, v in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))

    return [-1 if d == float('inf') else d for d in dist]
`,
      JavaScript: `// =================== 정답 공개 ===================
function solution(n, edges, src) {
  const graph = Array.from({length: n}, () => []);
  for (const [u, v, w] of edges) graph[u].push([v, w]);

  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const pq = [[0, src]]; // [dist, node]

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist.map(d => d === Infinity ? -1 : d);
}
`,
      Java: `// =================== 정답 공개 ===================
import java.util.*;
class Solution {
    public int[] solution(int n, int[][] edges, int src) {
        List<int[]>[] graph = new List[n];
        for (int i = 0; i < n; i++) graph[i] = new ArrayList<>();
        for (int[] e : edges) graph[e[0]].add(new int[]{e[1], e[2]});
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.offer(new int[]{0, src});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            if (cur[0] > dist[cur[1]]) continue;
            for (int[] next : graph[cur[1]]) {
                if (dist[cur[1]] + next[1] < dist[next[0]]) {
                    dist[next[0]] = dist[cur[1]] + next[1];
                    pq.offer(new int[]{dist[next[0]], next[0]});
                }
            }
        }
        for (int i = 0; i < n; i++) if (dist[i] == Integer.MAX_VALUE) dist[i] = -1;
        return dist;
    }
}
`,
      "C++": `// =================== 정답 공개 ===================
vector<int> solution(int n, vector<vector<int>> edges, int src) {
    vector<vector<pair<int, int>>> graph(n);
    for (auto &e : edges) graph[e[0]].push_back({e[1], e[2]});
    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : graph[u]) {
            if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
        }
    }
    for (int &d : dist) if (d == INT_MAX) d = -1;
    return dist;
}
`
    }
  },
  Greedy: {
    hint: {
      Python: `# ===================== AI 힌트 =====================
# [핵심 아이디어] 그리디 — 종료 시간 기준 정렬
#
#  1. 회의를 종료 시간 기준으로 오름차순 정렬
#  2. 가장 일찍 끝나는 회의를 먼저 선택
#  3. 현재 회의 시작 >= 마지막 선택 종료 이면 선택
#
#  왜? 일찍 끝날수록 다음 회의를 더 많이 넣을 수 있음
# ====================================================
def solution(meetings):
    # 여기에 코드를 작성하세요
    pass
`,
      JavaScript: `// =================== AI 힌트 ===================
// [핵심 아이디어] 그리디 — 종료 시간 기준 정렬
//
//  meetings.sort((a, b) => a[1] - b[1])
//  종료 시간이 이른 회의부터 탐욕적으로 선택
// ================================================
function solution(meetings) {
  // 여기에 코드를 작성하세요
}
`,
      Java: `// =================== AI 힌트 ===================
// 종료 시간 기준 정렬 후 그리디 선택
// ================================================
class Solution {
    public int solution(int[][] meetings) {
        // 여기에 코드를 작성하세요
        return 0;
    }
}
`,
      "C++": `// =================== AI 힌트 ===================
// 종료 시간 기준 정렬 후 그리디 선택
// ================================================
int solution(vector<vector<int>> meetings) {
    // 여기에 코드를 작성하세요
    return 0;
}
`
    },
    answer: {
      Python: `# ===================== 정답 공개 =====================
def solution(meetings):
    meetings.sort(key=lambda x: x[1])
    count = 0
    end = -1
    for start, finish in meetings:
        if start >= end:
            count += 1
            end = finish
    return count
`,
      JavaScript: `// =================== 정답 공개 ===================
function solution(meetings) {
  meetings.sort((a, b) => a[1] - b[1]);
  let count = 0, end = -1;
  for (const [start, finish] of meetings) {
    if (start >= end) {
      count++;
      end = finish;
    }
  }
  return count;
}
`,
      Java: `// =================== 정답 공개 ===================
import java.util.*;
class Solution {
    public int solution(int[][] meetings) {
        Arrays.sort(meetings, (a, b) -> a[1] - b[1]);
        int count = 0, end = -1;
        for (int[] m : meetings) {
            if (m[0] >= end) { count++; end = m[1]; }
        }
        return count;
    }
}
`,
      "C++": `// =================== 정답 공개 ===================
int solution(vector<vector<int>> meetings) {
    sort(meetings.begin(), meetings.end(), [](auto &a, auto &b) { return a[1] < b[1]; });
    int count = 0, end = -1;
    for (auto &meeting : meetings) {
        if (meeting[0] >= end) { count++; end = meeting[1]; }
    }
    return count;
}
`
    }
  }
};
const FALLBACK_HINTS = {
  Python: `# ===================== AI 힌트 =====================
# 이 문제의 카테고리: {CATEGORY}
#
# [접근 방법]
#  1. 입력 조건과 범위를 먼저 파악하세요.
#  2. 예시 케이스를 손으로 직접 따라가 보세요.
#  3. 브루트포스로 먼저 풀고, 최적화를 고민하세요.
#
# [자주 쓰는 패턴]
#  - 반복문 내에서 상태를 누적하거나 갱신합니다.
#  - 이전 결과를 재활용할 수 있는지 확인하세요.
# ====================================================
def solution(nums):
    # 여기에 코드를 작성하세요
    pass
`,
  JavaScript: `// =================== AI 힌트 ===================
// 이 문제의 카테고리: {CATEGORY}
//
// [접근 방법]
//  1. 입력 조건과 범위를 먼저 파악하세요.
//  2. 예시 케이스를 손으로 직접 따라가 보세요.
//  3. 브루트포스로 먼저 풀고, 최적화를 고민하세요.
// ================================================
function solution(nums) {
  // 여기에 코드를 작성하세요
}
`,
  Java: `// =================== AI 힌트 ===================
// 카테고리: {CATEGORY}
// 입력 범위 확인 → 예시 트레이싱 → 최적화 순으로!
// ================================================
class Solution {
    public int solution(int[] nums) {
        // 여기에 코드를 작성하세요
        return 0;
    }
}
`,
  "C++": `// =================== AI 힌트 ===================
// 카테고리: {CATEGORY}
// 입력 범위 확인 → 예시 트레이싱 → 최적화 순으로!
// ================================================
int solution(vector<int> nums) {
    // 여기에 코드를 작성하세요
    return 0;
}
`
};
function getHint(category, lang) {
  return HINTS[category]?.hint[lang] ?? FALLBACK_HINTS[lang]?.replace("{CATEGORY}", category) ?? "";
}
function getAnswer(category, lang) {
  return HINTS[category]?.answer[lang] ?? `# 이 카테고리(${category})의 정답 코드를 준비 중입니다.
`;
}
const INITIAL_LANG = "Python";
function SolvePage() {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [problem, setProblem] = useState(() => {
    const storedProblem = getCurrentProblem();
    return !problemId || String(storedProblem?.id) === String(problemId) ? storedProblem : null;
  });
  const [problemLoading, setProblemLoading] = useState(!problem && USE_REAL_PROBLEM && !!problemId);
  const [initialResult] = useState(() => loadApproachResult(problemId ?? problem?.id));
  const [selectedCat, setSelectedCat] = useState(initialResult?.selectedCategory ?? null);
  const categoryKnown = initialResult?.categoryKnown ?? !!problem?.categoryKnown;
  const [approach, setApproach] = useState(initialResult?.approach ?? "");
  const [submitStage, setSubmitStage] = useState(initialResult ? "done" : "idle");
  const [evaluation, setEvaluation] = useState(initialResult?.evaluation ?? null);
  const [answerRevealed, setAnswerRevealed] = useState(initialResult?.answerRevealed ?? false);
  const [apiError, setApiError] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [lang, setLang] = useState(INITIAL_LANG);
  const [code, setCode] = useState(LANG_STARTERS[INITIAL_LANG]);
  const [codeResult, setCodeResult] = useState("idle");
  const [codeReport, setCodeReport] = useState(null);
  const [submittedCount, setSubmittedCount] = useState(null);
  // 코드에디터 하단 결과 영역 탭: "test"(테스트 결과) | "examples"(예시 실행 결과)
  const [resultTab, setResultTab] = useState("test");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintLoading, setHintLoading] = useState(false);
  const resultRef = useRef(null);
  const approachInputRef = useRef(null);
  const [codePos, setCodePos] = useState({ x: 16, y: 120 });
  const [codeCollapsed, setCodeCollapsed] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const floatRef = useRef(null);
  const onDragStart = useCallback((cx, cy) => {
    dragging.current = true;
    dragOffset.current = { x: cx - codePos.x, y: cy - codePos.y };
  }, [codePos]);
  const onDragMove = useCallback((cx, cy) => {
    if (!dragging.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pw = floatRef.current?.offsetWidth || 300;
    const ph = floatRef.current?.offsetHeight || 300;
    setCodePos({
      x: Math.max(0, Math.min(w - pw, cx - dragOffset.current.x)),
      y: Math.max(0, Math.min(h - ph - 10, cy - dragOffset.current.y))
    });
  }, []);
  const onDragEnd = useCallback(() => {
    dragging.current = false;
  }, []);
  useEffect(() => {
    // 1. 실제 문제 API 모드가 아니거나 문제 id가 없으면 하지 않음
    if (!USE_REAL_PROBLEM || !problemId) return undefined;

    let cancelled = false;
    getProblem(problemId)
      .then(async (loadedProblem) => {
        if (cancelled) return;
        // 2. 목록·생성 화면에서 저장한 기본 정보에 상세 조회 결과를 합쳐 제약조건까지 최신화
        setProblem((prev) => prev
          ? {
              ...prev,
              ...loadedProblem,
              categoryKnown: prev.categoryKnown ?? loadedProblem.categoryKnown,
            }
          : loadedProblem);
        // 3. 힌트를 연 적이 있으면 횟수를 채우고, 현재 언어의 힌트를 에디터에 표시
        if (USE_REAL_HINT && loadedProblem.usedHintStage >= 1) {
          setHintsUsed(loadedProblem.usedHintStage);
          setHintLoading(true);
          const hint = await getHintByStage(problemId, loadedProblem.usedHintStage, INITIAL_LANG);
          if (!cancelled) setCode(hint.content);
        }
      })
      .catch((error) => {
        if (!cancelled) setApiError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) {
          setProblemLoading(false);
          setHintLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [problemId]);
  if (problemLoading) {
    return <div className="h-full flex items-center justify-center bg-[#05050F] text-sm text-[#6B6890]">
        문제를 불러오고 있어요...
      </div>;
  }
  if (!problem) {
    return <div className="h-full flex flex-col items-center justify-center gap-4 bg-[#05050F] px-6 text-center">
        <p className="text-sm text-rose-400">{apiError || "문제 정보가 없습니다."}</p>
        <button onClick={() => navigate("/")} className="rounded-xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white">
          문제 생성 화면으로
        </button>
      </div>;
  }
  const p = problem;
  const badge = DIFFICULTY_BADGE_CLASSES[p.difficulty] || "";
  const keywords = APPROACH_KEYWORDS[p.category] || [];
  const canSubmit = (categoryKnown || selectedCat !== null) && approach.trim().length > 0 && submitStage === "idle";
  // 코드 제출 버튼이 막히는 이유는 두 가지: 제출 횟수 소진, 정답 힌트 확인
  const submissionLimitReached = submittedCount != null && submittedCount >= 5;
  const answerHintUsed = hintsUsed >= 2;
  const codeSubmitDisabled = codeResult === "running" || submissionLimitReached || answerHintUsed;
  const codeSubmitLabel = codeResult === "running"
    ? "채점 중..."
    : submissionLimitReached
      ? "제출불가(5/5)"
      : answerHintUsed
        ? "제출불가"
        : submittedCount != null
          ? `제출(${submittedCount}/5)`
          : "제출";
  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitStage("grading");
    setApiError("");
    try {
      let nextEvaluation;
      if (!USE_REAL_APPROACH) {
        await new Promise((r) => setTimeout(r, 1400));
        nextEvaluation = createMockApproachEvaluation(p, selectedCat, approach, keywords);
      } else {
        const submission = await submitApproach(p.id, {
          selectedCategory: categoryKnown ? p.category : selectedCat,
          approach
        }, crypto.randomUUID());
        nextEvaluation = normalizeApproachEvaluation(submission, p);
      }
      setEvaluation(nextEvaluation);
      setAnswerRevealed(false);
      saveApproachResult(p.id, {
        selectedCategory: categoryKnown ? p.category : selectedCat,
        categoryKnown,
        approach,
        evaluation: nextEvaluation,
        answerRevealed: false,
      });
      if (
        p.isDailyProblem &&
        nextEvaluation.status === "completed" &&
        nextEvaluation.categoryCorrect &&
        nextEvaluation.approachScore === 100
      ) {
        markDailyProblemSolved(p.id);
      }
      setSubmitStage("done");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (error) {
      setApiError(getApiErrorMessage(error));
      setSubmitStage("idle");
    }
  }
  function handleRetry() {
    setSubmitStage("idle");
    setApiError("");
    setTimeout(() => approachInputRef.current?.focus(), 0);
  }
  // 힌트 로딩 실패 시 표시할 문구 (단계별로 다름, 알려진 에러 코드가 있으면 그 메시지를 우선함)
  function hintErrorMessage(stage, error) {
    if (error?.code) return getApiErrorMessage(error);
    return stage === 1 ? "힌트를 불러오지 못했습니다." : "정답을 불러오지 못했습니다.";
  }
  // 단계(1: 주석, 2: 정답)와 언어에 맞는 힌트를 가져옴
  async function fetchHint(stage, language) {
    // 1. 목 모드면 화면에 있는 목 힌트를 반환
    if (!USE_REAL_HINT) {
      await new Promise((r) => setTimeout(r, 900));
      return { content: stage === 1 ? getHint(p.category, language) : getAnswer(p.category, language), stage };
    }
    // 2. 실제 API 모드면 서버에서 받아서 반환 (stage는 서버가 알려준 값)
    const hint = await getHintByStage(p.id, stage, language);
    return { content: hint.content, stage: hint.hint_stage };
  }
  async function handleLangChange(l) {
    if (hintLoading) return;
    // 1. 언어와 시작 코드를 바꿈 (사용 횟수는 그대로)
    setLang(l);
    const starter = LANG_STARTERS[l];
    setCode(starter);
    setCodeResult("idle");
    // 2. 이미 힌트를 연 적이 있으면 새 언어의 같은 단계 힌트를 표시
    if (hintsUsed < 1) return;
    setHintLoading(true);
    setApiError("");
    try {
      const hint = await fetchHint(hintsUsed, l);
      // 3. 주석 힌트는 새 언어 시작 코드 위에 주석으로 얹고, 정답 힌트는 통째로 교체
      setCode(hintsUsed === 1 ? `${toComment(hint.content, l)}\n\n${starter}` : hint.content);
    } catch (error) {
      // 4. 실패하면 에러만 표시 (시작 코드·사용 횟수 유지)
      setApiError(hintErrorMessage(hintsUsed, error));
    } finally {
      setHintLoading(false);
    }
  }
  async function handleHint() {
    if (hintsUsed >= 2 || hintLoading) return;
    setHintLoading(true);
    setApiError("");
    try {
      // 1. 다음 단계의 힌트를 요청
      const hint = await fetchHint(hintsUsed + 1, lang);
      // 2. 주석 힌트는 지금 쓰던 코드 위에 주석으로 얹고, 정답 힌트는 통째로 교체
      setCode(hint.stage === 1 ? `${toComment(hint.content, lang)}\n\n${code}` : hint.content);
      // 3. 사용 횟수를 서버가 알려준 단계로 맞춤
      setHintsUsed(hint.stage);
    } catch (error) {
      // 4. 실패하면 에러만 표시 (횟수와 에디터는 그대로, 요청했던 단계 기준으로 문구를 고름)
      setApiError(hintErrorMessage(hintsUsed + 1, error));
    } finally {
      setHintLoading(false);
    }
  }
  async function handleCodeSubmit() {
    setCodeResult("running");
    setApiError("");
    try {
      if (!USE_REAL_CODE) {
        await new Promise((r) => setTimeout(r, 1600));
        const isStarterCode = code.includes("여기에 코드를 작성하세요") || code.includes("pass");
        setCodeReport(null);
        setCodeResult(isStarterCode ? "fail" : "pass");
      } else {
        // 1. 코드를 제출하고 채점 결과를 받음
        const result = await submitCode(p.id, {
          language: lang,
          sourceCode: code
        }, crypto.randomUUID());
        // 2. 결과 종류와 통과 개수, 테스트별 판정을 저장 (화면에 함께 표시)
        setCodeReport({
          result: result.judging_result,
          passed: result.passed_test_count,
          total: result.total_test_count,
          testResults: result.test_results ?? null
        });
        // 3. 이번까지 사용한 제출 횟수를 저장 (버튼의 n/5 표시에 사용)
        setSubmittedCount(result.submitted_count);
        setCodeResult(result.judging_result === "CORRECT" ? "pass" : "fail");
      }
    } catch (error) {
      setApiError(error?.code ? getApiErrorMessage(error) : "코드를 제출하지 못했습니다.");
      // 제출 횟수를 다 썼다는 오류면, 버튼이 계속 5/5로 보이도록 횟수를 저장
      if (error.code === "submission_limit_exceeded" && error.data?.submitted_count != null) {
        setSubmittedCount(error.data.submitted_count);
      }
      setCodeResult("idle");
    }
  }
  return <div className="h-full flex flex-col bg-[#05050F] overflow-hidden">
      {
    /* Header */
  }
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[#1E1D35] shrink-0">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-lg text-[#6B6890] active:text-[#A855F7]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {p.difficulty}
          </span>
          {categoryKnown && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-[#7C3AED]/20 text-[#C084FC] border-[#7C3AED]/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {p.category}
            </span>}
        </div>
        <div className="w-8" aria-hidden="true" />
      </div>

      {
    /* Scrollable body */
  }
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="px-4 pt-5 pb-8 flex flex-col gap-5">

          {
    /* Problem */
  }
          <div className="rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4">
            <h2 className="text-base font-bold text-[#E2E0F0] mb-3 leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {p.title}
            </h2>
            <p className="text-sm text-[#A89EC4] leading-relaxed whitespace-pre-line mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <MathText text={p.description} />
            </p>
            {p.examples.map((ex, i) => <div key={i} className="mb-2 rounded-xl bg-[#06060E] border border-[#1E1D35] p-3">
                <p className="text-[10px] text-[#6B6890] mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>예시 {i + 1}</p>
                <p className="text-xs text-[#C8B8F8] mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>입력: {ex.input}</p>
                <p className="text-xs text-[#C8B8F8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>출력: {ex.output}</p>
                {ex.explanation && <p className="text-[11px] text-[#6B6890] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}><MathText text={ex.explanation} /></p>}
              </div>)}
            <ProblemConditions
              inputFormat={p.inputFormat}
              outputFormat={p.outputFormat}
              inputConstraints={p.inputConstraints}
              legacyConstraints={p.constraints}
            />
          </div>

          <ExecutionLimitsCard limits={p.executionLimits} />

          {
    /* Category — only shown when category was not pre-selected */
  }
          {!categoryKnown && <div>
              <label className="block text-xs font-medium text-[#6B6890] mb-2.5 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                어떤 알고리즘으로 풀까요?
              </label>
              <div className="flex flex-wrap gap-2">
                {PROBLEM_CATEGORIES.map((c) => <button
    key={c}
    onClick={() => submitStage === "idle" && setSelectedCat(c)}
    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${selectedCat === c ? "bg-[#7C3AED]/25 text-[#C084FC] border-[#7C3AED]/50 scale-105" : "bg-[#0D0D1F] text-[#6B6890] border-[#1E1D35]"}`}
    style={{ fontFamily: "'Outfit', sans-serif" }}
  >
                    {c}
                  </button>)}
              </div>
            </div>}

          {
    /* Approach */
  }
          <div>
            <label className="block text-xs font-medium text-[#6B6890] mb-2.5 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              접근 방식을 자연어로 작성하세요
            </label>
            <textarea
    ref={approachInputRef}
    value={approach}
    onChange={(e) => {
      if (submitStage === "idle") setApproach(e.target.value);
    }}
    placeholder="예) 배열을 정렬한 뒤 양 끝에서 포인터를 좁혀가며 합을 비교합니다..."
    readOnly={submitStage !== "idle"}
    className="w-full min-h-[120px] rounded-2xl border border-[#1E1D35] bg-[#0D0D1F] p-4 text-sm text-[#E2E0F0] resize-none placeholder:text-[#2A2845] leading-relaxed"
    style={{ fontFamily: "'Outfit', sans-serif", caretColor: "#A855F7", outline: "none" }}
  />
          </div>

          {
    /* Submit */
  }
          {submitStage !== "done" && <button
    onClick={handleSubmit}
    disabled={!canSubmit}
    className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
    style={{ fontFamily: "'Outfit', sans-serif", background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)", boxShadow: canSubmit ? "0 4px 20px rgba(124,58,237,0.35)" : "none" }}
  >
              {submitStage === "grading" ? "채점 중..." : "접근 방식 제출"}
            </button>}

          {apiError && <p className="text-center text-xs text-rose-400" role="alert">{apiError}</p>}

          {
    /* Result */
  }
          {submitStage === "done" && evaluation && (
            <div ref={resultRef}>
              <ApproachResult
                evaluation={evaluation}
                categoryKnown={categoryKnown}
                selectedCategory={selectedCat}
                answerRevealed={answerRevealed}
                onRevealAnswer={() => {
                  setAnswerRevealed(true);
                  markApproachAnswerRevealed(p.id);
                }}
                showCode={showCode}
                onWriteCode={() => setShowCode((value) => !value)}
                onRetry={handleRetry}
                onNewProblem={() => navigate("/problems/new")}
              />
            </div>
          )}

        </div>
      </div>

      {
    /* Floating draggable code editor */
  }
      {showCode && <div
    ref={floatRef}
    className="absolute z-40 rounded-2xl border border-[#2A2845] overflow-hidden select-none"
    style={{
      left: codePos.x,
      top: codePos.y,
      width: "min(calc(100vw - 32px), 398px)",
      background: "rgba(10,10,26,0.95)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.15) inset",
      touchAction: "none"
    }}
    onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
    onMouseMove={(e) => onDragMove(e.clientX, e.clientY)}
    onMouseUp={onDragEnd}
    onMouseLeave={onDragEnd}
    onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
    onTouchMove={(e) => {
      e.preventDefault();
      onDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }}
    onTouchEnd={onDragEnd}
  >
          {
    /* Drag handle row — grab here */
  }
          <div className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-[#1E1D35] bg-[#0A0A1E]">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#3A3860]" />
              <div className="w-4 h-1 rounded-full bg-[#3A3860]" />
              <div className="w-1 h-1 rounded-full bg-[#3A3860]" />
            </div>
            <span className="text-[10px] text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>code editor</span>
            <div className="flex items-center gap-1">
              <button
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
    onClick={() => setCodeCollapsed((v) => !v)}
    className="p-1.5 text-[#6B6890] active:text-[#C084FC]"
  >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d={codeCollapsed ? "M2 8l4.5-4.5L11 8" : "M2 5l4.5 4.5L11 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
    onClick={() => setShowCode(false)}
    className="p-1.5 text-[#4A4870] active:text-rose-400"
  >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {
    /* Language tabs row */
  }
          {!codeCollapsed && <div
    className="flex gap-1 px-3 py-1.5 border-b border-[#1E1D35] overflow-x-auto"
    style={{ scrollbarWidth: "none" }}
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
  >
              {SUPPORTED_LANGUAGES.map((l) => <button
    key={l}
    onClick={() => handleLangChange(l)}
    disabled={hintLoading}
    className={`px-2.5 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-all ${lang === l ? "bg-[#7C3AED]/30 text-[#C084FC]" : "text-[#4A4870]"}`}
    style={{ fontFamily: "'JetBrains Mono', monospace" }}
  >
                  {l}
                </button>)}
            </div>}

          {!codeCollapsed && <>
              <div style={{ height: 240 }} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                <CodeEditor value={code} onChange={setCode} lang={lang} />
              </div>
              <div
    className="px-3 py-2.5 border-t border-[#1E1D35] flex flex-col gap-2"
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
  >
                <div className="flex gap-2">
                  {
    /* Hint button */
  }
                  <button
    onClick={handleHint}
    disabled={hintsUsed >= 2 || hintLoading}
    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5"
    style={{
      fontFamily: "'Outfit', sans-serif",
      background: hintsUsed >= 2 ? "#1A1A2E" : "rgba(124,58,237,0.15)",
      border: `1px solid ${hintsUsed >= 2 ? "#1E1D35" : "rgba(124,58,237,0.35)"}`,
      color: hintsUsed >= 2 ? "#3A3860" : "#C084FC"
    }}
  >
                    {hintLoading ? <span style={{ animation: "pulse-glow 0.8s ease infinite" }}>AI 분석 중...</span> : hintsUsed === 0 ? <>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="#C084FC" strokeWidth="1.3" />
                          <path d="M6 4v.5M6 6v2.5" stroke="#C084FC" strokeWidth="1.3" strokeLinecap="round" />
                          <circle cx="6" cy="4" r="0.5" fill="#C084FC" />
                        </svg>
                        힌트 1/2
                      </> : hintsUsed === 1 ? <>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M6 1l1.2 3.6H11l-3 2.2 1.1 3.5L6 8.7l-3.1 1.6 1.1-3.5-3-2.2h3.8L6 1z" fill="#C084FC" fillOpacity="0.8" />
                        </svg>
                        정답 공개
                      </> : "힌트 소진"}
                  </button>

                  {
    /* Submit button */
  }
                  <button
    onClick={handleCodeSubmit}
    disabled={codeSubmitDisabled}
    className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
    style={{ fontFamily: "'Outfit', sans-serif", background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
  >
                    {codeSubmitLabel}
                  </button>
                </div>

                {
    /* Hint usage indicator */
  }
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#3A3860]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>힌트</span>
                  <div className="flex gap-1">
                    {[0, 1].map((i) => <div
    key={i}
    className="w-3.5 h-1.5 rounded-full transition-all duration-300"
    style={{ background: i < hintsUsed ? "#7C3AED" : "#1E1D35" }}
  />)}
                  </div>
                  <span className="text-[10px] text-[#3A3860]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {hintsUsed === 0 ? "2회 남음" : hintsUsed === 1 ? "1회 남음" : "소진"}
                  </span>
                </div>
              </div>

              {
    /* 테스트 결과 / 예시 실행 결과 탭 */
  }
              <div className="border-t border-[#1E1D35]" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                <div className="flex">
                  {[{ key: "test", label: "테스트 결과" }, { key: "examples", label: "예시 실행 결과" }].map((tab) => <button
    key={tab.key}
    onClick={() => setResultTab(tab.key)}
    className="flex-1 py-2 text-[11px] font-semibold border-b-2 transition-all"
    style={{
      fontFamily: "'Outfit', sans-serif",
      color: resultTab === tab.key ? "#C084FC" : "#4A4870",
      borderColor: resultTab === tab.key ? "#7C3AED" : "transparent"
    }}
  >
                      {tab.label}
                    </button>)}
                </div>

                <div className="px-3 py-2.5 max-h-[180px] overflow-y-auto">
                  {resultTab === "test" ? (
                    codeResult === "running" ? <div className="flex flex-col gap-1">
                        <p className="text-[11px] text-[#A89EC4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>채점 중입니다</p>
                        <p className="text-[10px] text-[#6B6890]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>최대 20개의 비공개 테스트를 실행하고 있어요.</p>
                        <p className="text-[10px] text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>안내: 입력값과 기대 출력값은 공개되지 않아요.</p>
                      </div>
                    : codeReport?.testResults ? <>
                        {
    /* 1. 테스트케이스 순서대로 통과/실패 표시 */
  }
                        <ul className="flex flex-col gap-1 mb-2">
                          {codeReport.testResults.map((verdict, i) => <li key={i} className="flex items-center gap-1.5 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              <span style={{ color: verdict === "CORRECT" ? "#34D399" : "#F87171" }}>{verdict === "CORRECT" ? "✓" : "✗"}</span>
                              <span className="text-[#A89EC4]">테스트 {i + 1}</span>
                            </li>)}
                        </ul>
                        {
    /* 2. 전체 결과 요약 */
  }
                        <p className="text-[11px] animate-fadeIn" style={{ fontFamily: "'JetBrains Mono', monospace", color: codeResult === "pass" ? "#34D399" : "#F87171" }}>
                          {codeResult === "pass" ? "모든 테스트를 통과했어요!" : `${CODE_RESULT_LABEL[codeReport.result] ?? "오답"} (${codeReport.passed}/${codeReport.total} 통과)`}
                        </p>
                      </>
                    : codeResult === "pass" ? <p className="text-emerald-400 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>✓ 정답</p>
                    : codeResult === "fail" ? <p className="text-rose-400 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>✗ 오답 — 다시 시도해 보세요</p>
                    : <p className="text-[11px] text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>아직 제출하지 않았어요</p>
                  ) : p.examples.length === 0 ? (
                    <p className="text-[11px] text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>등록된 예시가 없습니다.</p>
                  ) : (
                    p.examples.map((ex, i) => <div key={i} className="mb-2 last:mb-0">
                        <p className="text-[10px] text-[#6B6890] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>예시 {i + 1}</p>
                        <p className="text-[11px] text-[#C8B8F8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>입력: {ex.input}</p>
                        <p className="text-[11px] text-[#C8B8F8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>출력: {ex.output}</p>
                      </div>)
                  )}
                </div>
              </div>
            </>}
        </div>}

    </div>;
}
export {
  SolvePage as default
};
