import { request } from './httpClient.js'
import { USE_REAL_PROBLEM, USE_REAL_SAVED, getProblem } from './problemApi.js'
import { CATEGORY_FROM_API } from '../constants/problemOptions.js'
import {
  isProblemSaved,
  loadSavedProblems,
  toggleSavedProblem,
} from '../features/saved-problems/savedProblemStorage.js'

// 저장 문제 목록 조회 (최근 저장순)
export async function fetchSavedProblems() {
  // 1. 목업 모드면 브라우저에 저장된 목록을 사용
  if (!USE_REAL_SAVED) return loadSavedProblems()

  // 2. 서버 응답을 화면에서 쓰는 모양으로 변환
  const payload = await request('/saved-problems')
  return payload.data.problems.map((item) => ({
    id: String(item.problemId),
    title: item.title,
    difficulty: item.difficulty,
    category: CATEGORY_FROM_API[item.category] ?? item.category,
    savedAt: item.savedAt,
    // 서버가 내려주면 카드에 표시 (아직 없으면 미제출, 풀이 없음으로 보임)
    status: item.status ?? 'NOT_SUBMITTED',
    solution: item.solution ?? null,
  }))
}

// 펼친 카드에 보여줄 문제 설명 조회
export async function fetchProblemDescription(item) {
  // 1. 서버 모드면 문제 상세에서 설명을 가져오고, 목업 모드면 저장해 둔 설명을 사용
  const description = USE_REAL_PROBLEM ? (await getProblem(item.id)).description : item.description
  // 2. 설명이 없으면 불러오지 못한 것으로 처리
  if (!description) throw new Error('description_unavailable')
  return description
}

// 문제를 저장(saved=true)하거나 해제(saved=false)
export async function setProblemSaved(problem, saved) {
  // 1. 목업 모드면 이미 원하는 상태가 아닐 때만 토글
  if (!USE_REAL_SAVED) {
    if (isProblemSaved(problem.id) !== saved) toggleSavedProblem(problem)
    return
  }

  // 2. 저장은 POST, 해제는 DELETE
  await request(`/problems/${problem.id}/saved`, { method: saved ? 'POST' : 'DELETE' })
}

// 풀이 화면에서 처음 보여줄 저장 여부 (서버 모드는 문제 상세 응답의 saved 값)
export function readSavedFlag(problemId, savedFlag) {
  return USE_REAL_SAVED ? savedFlag === true : isProblemSaved(problemId)
}
