import dateFormatter, { relativeTime } from "./dateFormatter";

it("should format an ISO string", () => {
  const ISOString = "2020-01-01T12:11:08.212Z";

  expect(dateFormatter(ISOString)).toBe("January 1, 2020");
});

describe("relativeTime", () => {
  const now = "2026-06-08T12:00:00.000Z";

  it('should return "刚刚" for less than 1 minute', () => {
    expect(relativeTime("2026-06-08T11:59:45.000Z", now)).toBe("刚刚");
  });

  it('should return "X 分钟前" for less than 1 hour', () => {
    expect(relativeTime("2026-06-08T11:30:00.000Z", now)).toBe("30 分钟前");
  });

  it('should return "X 小时前" for less than 24 hours', () => {
    expect(relativeTime("2026-06-08T06:00:00.000Z", now)).toBe("6 小时前");
  });

  it('should return "X 天前" for less than 30 days', () => {
    expect(relativeTime("2026-05-25T12:00:00.000Z", now)).toBe("14 天前");
  });

  it("should fall back to dateFormatter for dates older than 30 days", () => {
    const oldDate = "2026-01-01T12:00:00.000Z";
    expect(relativeTime(oldDate, now)).toBe("January 1, 2026");
  });
});
