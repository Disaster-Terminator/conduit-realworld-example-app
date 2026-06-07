import dateFormatter from "./dateFormatter";
import timeAgo from "./timeAgo";

const FIXED_NOW = new Date("2026-06-07T12:00:00.000Z").getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FIXED_NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

it("returns '刚刚' for less than 60 seconds ago", () => {
  const past = new Date(FIXED_NOW - 5 * 1000);
  expect(timeAgo(past)).toBe("刚刚");
});

it("returns '{n} 分钟前' for less than 60 minutes", () => {
  const past = new Date(FIXED_NOW - 30 * 60 * 1000);
  expect(timeAgo(past)).toBe("30 分钟前");
});

it("returns '{n} 小时前' for less than 24 hours", () => {
  const past = new Date(FIXED_NOW - 3 * 60 * 60 * 1000);
  expect(timeAgo(past)).toBe("3 小时前");
});

it("returns '{n} 天前' for less than 30 days", () => {
  const past = new Date(FIXED_NOW - 2 * 24 * 60 * 60 * 1000);
  expect(timeAgo(past)).toBe("2 天前");
});

it("returns '{n} 个月前' for less than 12 months", () => {
  const past = new Date(FIXED_NOW - 65 * 24 * 60 * 60 * 1000);
  expect(timeAgo(past)).toBe("2 个月前");
});

it("falls back to dateFormatter for dates older than 12 months", () => {
  const past = new Date(FIXED_NOW - 400 * 24 * 60 * 60 * 1000);
  expect(timeAgo(past)).toBe(dateFormatter(past));
});

it("throws RangeError for invalid date strings", () => {
  expect(() => timeAgo("not-a-date")).toThrow(RangeError);
});
