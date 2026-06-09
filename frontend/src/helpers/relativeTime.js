const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

export default function relativeTime(date, now) {
  const dateMs = new Date(date).getTime();
  const nowMs = now ? new Date(now).getTime() : Date.now();

  const diffSeconds = Math.floor((nowMs - dateMs) / 1000);

  if (diffSeconds < 0) return "just now";
  if (diffSeconds < MINUTE) return "just now";

  const minutes = Math.floor(diffSeconds / MINUTE);
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  const hours = Math.floor(diffSeconds / HOUR);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(diffSeconds / DAY);
  if (days < 7) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  const weeks = Math.floor(diffSeconds / WEEK);
  if (weeks < 4) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  const months = Math.floor(diffSeconds / MONTH);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
