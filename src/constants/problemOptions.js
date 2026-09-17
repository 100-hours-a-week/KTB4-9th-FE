export const RANDOM_CATEGORY = "랜덤";

export const PROBLEM_DIFFICULTIES = ["LV1", "LV2", "LV3", "LV4", "LV5"];

export const PROBLEM_CATEGORIES = [
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
  "완전탐색",
  "Math",
];

export const CATEGORIES_WITH_RANDOM = [RANDOM_CATEGORY, ...PROBLEM_CATEGORIES];

export const DIFFICULTY_COLORS = {
  LV1: { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/30" },
  LV2: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  LV3: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  LV4: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  LV5: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30" },
};

export const DIFFICULTY_BADGE_CLASSES = Object.fromEntries(
  Object.entries(DIFFICULTY_COLORS).map(([level, colors]) => [
    level,
    `${colors.text} ${colors.bg} ${colors.border}`,
  ]),
);

export const CATEGORY_TO_API = {
  [RANDOM_CATEGORY]: "RANDOM",
  Array: "ARRAY",
  String: "STRING",
  DP: "DP",
  Graph: "GRAPH",
  Tree: "TREE",
  "Stack/Queue": "STACK_QUEUE",
  "Binary Search": "BINARY_SEARCH",
  Greedy: "GREEDY",
  Backtracking: "BACKTRACKING",
  "Two Pointer": "TWO_POINTER",
  Hash: "HASH",
  Heap: "HEAP",
  Sorting: "SORTING",
  구현: "IMPLEMENTATION",
  완전탐색: "BRUTE_FORCE",
  Math: "MATH",
};

export const CATEGORY_FROM_API = Object.fromEntries(
  Object.entries(CATEGORY_TO_API).map(([label, value]) => [value, label]),
);
