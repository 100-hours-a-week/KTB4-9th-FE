import { request } from "./httpClient.js";

function normalizeRanking(ranking) {
  if (!ranking) return null;

  return {
    userId: ranking.userId ?? ranking.user_id ?? null,
    username: ranking.username ?? ranking.name ?? "사용자",
    profileImageUrl:
      ranking.profileImageUrl ??
      ranking.userProfileUrl ??
      ranking.profile_image_url ??
      ranking.user_profile_url ??
      null,
    rank: Number(ranking.rank ?? 0),
    point: Number(ranking.point ?? 0),
  };
}

export async function getRankings({ difficulty, category } = {}) {
  const query = new URLSearchParams();

  if (difficulty) query.set("difficulty", difficulty);
  else if (category) query.set("category", category);

  const queryString = query.toString();
  const payload = await request(
    queryString ? `/rankings?${queryString}` : "/rankings",
  );
  const response = payload?.data ?? payload ?? {};

  if (!Array.isArray(response.rankings)) {
    throw new Error("invalid_rankings_response");
  }

  const rankings = response.rankings;
  const filter = response.filter ?? {};

  return {
    filter: {
      level: filter.level ?? filter.difficulty ?? null,
      category: filter.category ?? null,
    },
    myRanking: normalizeRanking(
      response.myRanking ?? response.my_ranking ?? null,
    ),
    rankings: Array.isArray(rankings)
      ? rankings.map(normalizeRanking).filter(Boolean)
      : [],
  };
}
