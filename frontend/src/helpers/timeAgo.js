import dateFormatter from "./dateFormatter";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Convert a date to a relative time string (e.g. "3 小时前").
 * Falls back to absolute date format for dates >= 7 days ago or in the future.
 *
 * @param {string|Date|null|undefined} dateString - ISO date string or Date object
 * @param {Date} [nowOverride] - Optional fixed "now" for testing
 * @returns {string} Relative time string, formatted date, or empty string on invalid input
 */
export default function timeAgo(dateString, nowOverride) {
  if (dateString == null || dateString === "") {
    return "";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "";
  }

  const now = nowOverride || new Date();
  const diffMs = now.getTime() - date.getTime();

  // Future date or equal: fall back to formatted date
  if (diffMs < 0) {
    return dateFormatter(date);
  }

  if (diffMs < MINUTE) {
    return "刚刚";
  }

  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE);
    return `${minutes} 分钟前`;
  }

  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return `${hours} 小时前`;
  }

  if (diffMs < 7 * DAY) {
    const days = Math.floor(diffMs / DAY);
    return `${days} 天前`;
  }

  // >= 7 days
  return dateFormatter(date);
}
