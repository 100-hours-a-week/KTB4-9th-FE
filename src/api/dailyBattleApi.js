import { request } from "./httpClient.js";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function nullableId(value) {
  if (value == null) return null;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function parseKstServerTime(value) {
  if (!value) return new Date(Number.NaN);
  // LocalDateTime의 마이크로초가 길게 내려와도 모바일 Safari에서 파싱되도록 밀리초까지만 사용한다.
  const text = String(value).replace(/(\.\d{3})\d+/, "$1");
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(text);
  return new Date(hasTimeZone ? text : `${text}+09:00`);
}

function normalizeCase(battleCase) {
  return {
    input: battleCase?.input ?? "",
    displayOrder: Number(battleCase?.displayOrder ?? battleCase?.display_order),
  };
}

export function normalizeParticipation(payload) {
  const data = unwrap(payload) ?? {};

  return {
    category: data.category ?? null,
    battleId: Number(data.battleId ?? data.battle_id),
    participantId: Number(data.participantId ?? data.participant_id),
    battleDate: data.battleDate ?? data.battle_date ?? null,
    title: data.title ?? data.tilte ?? "오늘의 데일리 배틀",
    content: data.content ?? "",
    participationStatus: data.participationStatus ?? data.participation_status ?? "IN_PROGRESS",
    cases: (data.cases ?? []).map(normalizeCase).sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

export async function getCurrentDailyBattle() {
  const payload = await request("/daily-battles/current");
  const data = unwrap(payload) ?? {};
  const serverTime = parseKstServerTime(data.server_time ?? data.serverTime);

  if (Number.isNaN(serverTime.getTime())) {
    throw new Error("invalid_current_daily_battle_response");
  }

  return {
    serverTime,
    currentBattleId: nullableId(data.current_battle_id ?? data.currentBattleId),
    latestResultBattleId: nullableId(data.latest_result_battle_id ?? data.latestResultBattleId),
  };
}

export async function participateDailyBattle(battleId) {
  const payload = await request(`/daily-battles/${battleId}/participations`, {
    method: "POST",
  });
  return normalizeParticipation(payload);
}

export async function submitDailyBattle(battleId, answers) {
  return request(`/daily-battles/${battleId}/submissions`, {
    method: "POST",
    body: JSON.stringify({
      battleId,
      userAnswers: answers.map((answer) => ({
        battle_case_num: answer.displayOrder,
        submitted_output: answer.value.trim(),
      })),
    }),
  });
}

export async function dropOutDailyBattle(battleId) {
  return request(`/daily-battles/${battleId}/participations`, {
    method: "PATCH",
  });
}

export async function getDailyBattleResult(battleId) {
  const payload = await request(`/daily-battles/${battleId}/results`);
  if (payload?.message === "battle_results_not_retrieved_yet" || payload?.data == null) {
    return { pending: true, result: null };
  }

  return { pending: false, result: payload.data };
}
