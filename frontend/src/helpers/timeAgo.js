import dateFormatter from "./dateFormatter";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

export default function timeAgo(input) {
  const timestamp = new Date(input).getTime();

  if (Number.isNaN(timestamp)) {
    throw new RangeError("timeAgo: invalid date");
  }

  const diff = Date.now() - timestamp;

  if (diff < MINUTE) return "刚刚";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} 分钟前`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`;
  if (diff < MONTH) return `${Math.floor(diff / DAY)} 天前`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)} 个月前`;

  return dateFormatter(new Date(timestamp));
}
