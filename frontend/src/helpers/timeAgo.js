/**
 * 将日期转换为中文相对时间字符串
 * @param {string|Date} date - ISO 日期字符串或 Date 对象
 * @param {Date} [now] - 可选当前时间（仅测试注入，默认 new Date()）
 * @returns {string} 相对时间描述或绝对日期
 */
export default function timeAgo(date, now) {
  if (date == null) return '';

  const then = new Date(date);
  if (isNaN(then.getTime())) return '';

  now = now || new Date();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return '刚刚';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} 分钟前`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} 天前`;

  // 超过 30 天回退到绝对日期
  return then.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
