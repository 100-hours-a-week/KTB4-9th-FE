import { request } from "./httpClient.js";

let activitiesRequest = null;

async function fetchMyActivities() {
  const payload = await request("/activities/me");
  const data = payload?.data ?? payload;

  return {
    startDate: data?.startDate ?? data?.start_date ?? null,
    endDate: data?.endDate ?? data?.end_date ?? null,
    activities: Array.isArray(data?.activities)
      ? data.activities.map((activity) => ({
          activityDate: activity.activityDate ?? activity.activity_date,
          correctProblemCount:
            activity.correctProblemCount ?? activity.correct_problem_count ?? 0,
        }))
      : [],
  };
}

export function getMyActivities() {
  if (!activitiesRequest) {
    activitiesRequest = fetchMyActivities().finally(() => {
      activitiesRequest = null;
    });
  }

  return activitiesRequest;
}
