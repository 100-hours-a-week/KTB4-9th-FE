import { request } from './httpClient.js'
import {
  CATEGORY_FROM_API,
  CATEGORY_TO_API,
  RANDOM_CATEGORY,
} from '../constants/problemOptions.js'

const LANGUAGE_TO_API = {
  Python: 'PYTHON',
  JavaScript: 'JAVASCRIPT',
  Java: 'JAVA',
  'C++': 'CPP',
}

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'
// 기능별로 진짜 API를 켜는 스위치. USE_MOCKS가 false면 전부 켜짐
export const USE_REAL_PROBLEM = !USE_MOCKS || import.meta.env.VITE_USE_REAL_PROBLEM === 'true'
export const USE_REAL_APPROACH = !USE_MOCKS || import.meta.env.VITE_USE_REAL_APPROACH === 'true'

const LANGUAGE_FROM_API = Object.fromEntries(
  Object.entries(LANGUAGE_TO_API).map(([label, value]) => [value, label]),
)

// 문제 상세 응답(inputFormat 등)을 화면의 제약사항 문자열 목록으로 변환
function buildConstraints(raw) {
  if (raw.constraints) return raw.constraints

  const lines = []
  if (raw.inputFormat) lines.push(`입력 형식: ${raw.inputFormat}`)
  if (raw.outputFormat) lines.push(`출력 형식: ${raw.outputFormat}`)

  for (const c of raw.inputConstraints ?? []) {
    const range = c.minValue != null && c.maxValue != null ? `${c.minValue} ~ ${c.maxValue} ` : ''
    const conditions = c.specialConditions?.length ? ` · ${c.specialConditions.join(', ')}` : ''
    lines.push(`${c.scope === 'OUTPUT' ? '[출력] ' : ''}${c.target}: ${range}(${c.dataType})${conditions}`)
  }

  for (const limit of raw.executionLimits ?? []) {
    const language = LANGUAGE_FROM_API[limit.language] ?? limit.language
    lines.push(`${language} 시간 ${limit.timeLimitMs / 1000}초 · 메모리 ${Math.round(limit.memoryLimitKb / 1024)}MB`)
  }

  return lines
}

export function toApiCategory(category) {
  return CATEGORY_TO_API[category] ?? category
}

function normalizeProblem(raw) {
  const level = raw.level ?? raw.difficulty

  return {
    id: String(raw.problemId ?? raw.problem_id ?? raw.id),
    title: raw.title,
    difficulty: String(level).startsWith('LV') ? String(level) : `LV${level}`,
    category: CATEGORY_FROM_API[raw.category] ?? raw.category,
    description: raw.content ?? raw.description ?? '',
    examples: (raw.examples ?? []).map((example) => ({
      ...example,
      explanation: example.explanation ?? example.description ?? null,
    })),
    constraints: buildConstraints(raw),
    categoryKnown: true,
  }
}

function idempotencyHeaders(requestId = crypto.randomUUID()) {
  return { 'Idempotency-Key': requestId }
}

export async function createProblem({ difficulty, category }) {
  const query = new URLSearchParams({
    level: difficulty.replace('LV', ''),
    category: toApiCategory(category),
  })
  const payload = await request(`/problems?${query}`)

  return {
    problem: {
      ...normalizeProblem(payload.data.problem),
      categoryKnown: category !== RANDOM_CATEGORY,
    },
    dailyUsage: payload.data.dailyUsage,
  }
}

export async function getProblem(problemId) {
  const payload = await request(`/problems/${problemId}`)
  return normalizeProblem(payload.data.problem)
}

export async function submitApproach(
  problemId,
  { selectedCategory, approach },
  requestId,
) {
  const payload = await request(`/problems/${problemId}/solution-submissions`, {
    method: 'POST',
    headers: idempotencyHeaders(requestId),
    body: JSON.stringify({
      selectedCategory: toApiCategory(selectedCategory),
      approach,
    }),
  })

  return payload.data
}

export async function submitCode(problemId, { language, sourceCode }, requestId) {
  const payload = await request(`/problems/${problemId}/code-submissions`, {
    method: 'POST',
    headers: idempotencyHeaders(requestId),
    body: JSON.stringify({
      language: LANGUAGE_TO_API[language] ?? language,
      source_code: sourceCode,
    }),
  })

  return payload.data
}

async function requestHint(problemId, hintType, language) {
  const payload = await request(`/problems/${problemId}/hints/${hintType}`, {
    method: 'POST',
    body: JSON.stringify({
      language: LANGUAGE_TO_API[language] ?? language,
    }),
  })

  return payload.data
}

export function getCommentHint(problemId, language) {
  return requestHint(problemId, 'comment', language)
}

export function getAnswerHint(problemId, language) {
  return requestHint(problemId, 'answer', language)
}

export function getApiErrorMessage(error) {
  const messages = {
    problem_level_is_required: '난이도를 선택해 주세요.',
    invalid_problem_level: '지원하지 않는 난이도입니다.',
    invalid_problem_category: '지원하지 않는 카테고리입니다.',
    matching_problem_not_found: '조건에 맞는 문제를 찾지 못했습니다.',
    problem_not_found: '문제를 찾을 수 없습니다.',
    daily_problem_limit_exceeded: '오늘의 문제 생성 횟수를 모두 사용했습니다.',
    daily_solution_submission_limit_exceeded: '오늘의 풀이 제출 횟수를 모두 사용했습니다.',
    submission_limit_exceeded: '이 문제의 코드 제출 횟수를 모두 사용했습니다.',
    judge_server_unavailable: '채점 서버를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    access_token_expired: '로그인이 만료되었습니다.',
    access_token_missing: '로그인이 필요합니다.',
    access_token_invalid: '로그인 정보가 올바르지 않습니다.',
    unauthorized: '로그인이 필요합니다.',
  }

  return messages[error?.code] ?? '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
