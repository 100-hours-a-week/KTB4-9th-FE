import { request } from "./httpClient.js";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
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
