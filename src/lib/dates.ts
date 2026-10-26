export function todayKey(now = new Date()) {
  return toDayKey(now);
}

export function toDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDayKey(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDay(day: string, locale = "vi-VN") {
  return parseDayKey(day).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDayShort(day: string, locale = "vi-VN") {
  return parseDayKey(day).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function weekStartKey(from = new Date()) {
  const date = new Date(from);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return toDayKey(date);
}

export function daysBetween(startDay: string, endDay = todayKey()) {
  const start = parseDayKey(startDay);
  const end = parseDayKey(endDay);
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function isValidDayKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
