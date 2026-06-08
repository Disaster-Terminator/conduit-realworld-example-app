import { afterAll, beforeAll, expect, it } from "vitest";
import timeAgo from "./timeAgo";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
});

afterAll(() => {
  vi.useRealTimers();
});

it('should return "刚刚" for a date less than 1 minute ago', () => {
  const date = new Date("2024-06-15T11:59:30Z").toISOString();
  expect(timeAgo(date)).toBe("刚刚");
});

it('should return "3 分钟前" for a date 3 minutes ago', () => {
  const date = new Date("2024-06-15T11:57:00Z").toISOString();
  expect(timeAgo(date)).toBe("3 分钟前");
});

it('should return "5 小时前" for a date 5 hours ago', () => {
  const date = new Date("2024-06-15T07:00:00Z").toISOString();
  expect(timeAgo(date)).toBe("5 小时前");
});

it('should return "2 天前" for a date 2 days ago', () => {
  const date = new Date("2024-06-13T12:00:00Z").toISOString();
  expect(timeAgo(date)).toBe("2 天前");
});

it('should return "1 个月前" for a date 1 month ago', () => {
  const date = new Date("2024-05-15T12:00:00Z").toISOString();
  expect(timeAgo(date)).toBe("1 个月前");
});

it('should return "2 年前" for a date 2 years ago', () => {
  const date = new Date("2022-06-15T12:00:00Z").toISOString();
  expect(timeAgo(date)).toBe("2 年前");
});
