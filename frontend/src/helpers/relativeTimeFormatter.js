const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function plural(n, singular, pluralForm) {
  return n === 1 ? `${n} ${singular}` : `${n} ${pluralForm}`;
}

export default function relativeTimeFormatter(date, now = Date.now()) {
  const then = new Date(date).getTime();
  const seconds = Math.max(0, Math.floor((now - then) / 1000));

  if (seconds < MINUTE) return "just now";
  if (seconds < HOUR) return `${plural(Math.floor(seconds / MINUTE), "minute", "minutes")} ago`;
  if (seconds < DAY) return `${plural(Math.floor(seconds / HOUR), "hour", "hours")} ago`;
  if (seconds < MONTH) return `${plural(Math.floor(seconds / DAY), "day", "days")} ago`;
  if (seconds < YEAR) return `${plural(Math.floor(seconds / MONTH), "month", "months")} ago`;
  return `${plural(Math.floor(seconds / YEAR), "year", "years")} ago`;
}
