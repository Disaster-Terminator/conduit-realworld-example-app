import timeAgo from "./timeAgo";

// Fixed reference date: 2026-06-10T12:00:00.000Z
const NOW = new Date("2026-06-10T12:00:00.000Z");

describe("timeAgo", () => {
  describe("invalid inputs", () => {
    test("null returns empty string", () => {
      expect(timeAgo(null)).toBe("");
    });

    test("undefined returns empty string", () => {
      expect(timeAgo(undefined)).toBe("");
    });

    test("empty string returns empty string", () => {
      expect(timeAgo("")).toBe("");
    });

    test("invalid date string returns empty string", () => {
      expect(timeAgo("not-a-date")).toBe("");
    });
  });

  describe("relative time formatting", () => {
    test('seconds ago returns "刚刚"', () => {
      const date = new Date("2026-06-10T11:59:45.000Z"); // 15 seconds ago
      expect(timeAgo(date, NOW)).toBe("刚刚");
    });

    test('minutes ago returns "X 分钟前"', () => {
      const date = new Date("2026-06-10T11:30:00.000Z"); // 30 minutes ago
      expect(timeAgo(date, NOW)).toBe("30 分钟前");
    });

    test('hours ago returns "X 小时前"', () => {
      const date = new Date("2026-06-10T09:00:00.000Z"); // 3 hours ago
      expect(timeAgo(date, NOW)).toBe("3 小时前");
    });

    test('days ago returns "X 天前"', () => {
      const date = new Date("2026-06-07T12:00:00.000Z"); // 3 days ago
      expect(timeAgo(date, NOW)).toBe("3 天前");
    });

    test("7 or more days returns formatted date", () => {
      const date = new Date("2026-06-03T12:00:00.000Z"); // 7 days ago
      expect(timeAgo(date, NOW)).toBe("June 3, 2026");
    });

    test("future date falls back to formatted date", () => {
      const date = new Date("2026-06-11T12:00:00.000Z"); // 1 day in the future
      expect(timeAgo(date, NOW)).toBe("June 11, 2026");
    });
  });

  describe("edge cases", () => {
    test("exactly 60 seconds is 1 minute ago", () => {
      const date = new Date("2026-06-10T11:59:00.000Z"); // 60 seconds ago
      expect(timeAgo(date, NOW)).toBe("1 分钟前");
    });

    test("exactly 60 minutes is 1 hour ago", () => {
      const date = new Date("2026-06-10T11:00:00.000Z"); // 60 minutes ago
      expect(timeAgo(date, NOW)).toBe("1 小时前");
    });

    test("exactly 24 hours is 1 day ago", () => {
      const date = new Date("2026-06-09T12:00:00.000Z"); // 24 hours ago
      expect(timeAgo(date, NOW)).toBe("1 天前");
    });

    test("exactly 7 days shows date", () => {
      const date = new Date("2026-06-03T12:00:00.000Z"); // 7 days ago
      expect(timeAgo(date, NOW)).toBe("June 3, 2026");
    });

    test("less than 60 seconds boundary shows 刚刚", () => {
      const date = new Date("2026-06-10T11:59:59.000Z"); // 1 second ago
      expect(timeAgo(date, NOW)).toBe("刚刚");
    });
  });
});
