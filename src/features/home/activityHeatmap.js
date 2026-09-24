export const ACTIVITY_DAYS = 140;

const pad = (value) => String(value).padStart(2, "0");

function parseDate(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey ?? "")) return null;

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getActivityLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function createActivityHeatmap(data = {}) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const endDate = parseDate(data.endDate) ?? today;
  const expectedStartDate = addDays(endDate, -(ACTIVITY_DAYS - 1));
  const responseStartDate = parseDate(data.startDate);
  const startDate =
    responseStartDate &&
    Math.round((endDate - responseStartDate) / 86_400_000) === ACTIVITY_DAYS - 1
      ? responseStartDate
      : expectedStartDate;

  const countByDate = new Map(
    (data.activities ?? []).map((activity) => [
      activity.activityDate,
      Math.max(0, Number(activity.correctProblemCount) || 0),
    ]),
  );

  return Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
    const date = addDays(startDate, index);
    const dateKey = formatDate(date);
    const correctProblemCount = countByDate.get(dateKey) ?? 0;

    return {
      date: dateKey,
      label: `${date.getMonth() + 1}월 ${date.getDate()}일`,
      monthIndex: date.getMonth(),
      correctProblemCount,
      level: getActivityLevel(correctProblemCount),
    };
  });
}
