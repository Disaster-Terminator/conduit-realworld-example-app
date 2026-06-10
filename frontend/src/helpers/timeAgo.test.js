import { describe, it, expect } from 'vitest';
import timeAgo from './timeAgo';

describe('timeAgo', () => {
  const base = new Date('2024-06-15T12:00:00Z');

  it('returns "" for null/undefined', () => {
    expect(timeAgo(null)).toBe('');
    expect(timeAgo(undefined)).toBe('');
  });

  it('returns "" for invalid date', () => {
    expect(timeAgo('not-a-date')).toBe('');
  });

  it('returns "刚刚" for < 60 seconds', () => {
    expect(timeAgo('2024-06-15T12:00:00Z', base)).toBe('刚刚');
  });

  it('returns "X 分钟前" for < 60 minutes', () => {
    expect(timeAgo('2024-06-15T11:55:00Z', base)).toBe('5 分钟前');
  });

  it('returns "1 分钟前" at boundary (60s)', () => {
    expect(timeAgo('2024-06-15T11:59:00Z', base)).toBe('1 分钟前');
  });

  it('returns "X 小时前" for < 24 hours', () => {
    expect(timeAgo('2024-06-15T09:00:00Z', base)).toBe('3 小时前');
  });

  it('returns "1 小时前" at boundary (60 min)', () => {
    expect(timeAgo('2024-06-15T11:00:00Z', base)).toBe('1 小时前');
  });

  it('returns "X 天前" for < 30 days', () => {
    expect(timeAgo('2024-06-08T12:00:00Z', base)).toBe('7 天前');
  });

  it('returns "1 天前" at boundary (24h)', () => {
    expect(timeAgo('2024-06-14T12:00:00Z', base)).toBe('1 天前');
  });

  it('returns absolute date for >= 30 days', () => {
    // 35 days ago — must fall back to absolute date
    const result = timeAgo('2024-05-11T12:00:00Z', base);
    expect(result).not.toMatch(/\d+\s*天前/);
    expect(result).toMatch(/\d+/); // contains digits (a date)
  });

  it('returns absolute date at exact 30 day boundary', () => {
    const result = timeAgo('2024-05-16T12:00:00Z', base);
    expect(result).not.toMatch(/\d+\s*天前/);
    expect(result).toMatch(/\d+/);
  });
});
