import relativeTimeFormatter from "./relativeTimeFormatter";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

describe("relativeTimeFormatter", () => {
  const now = new Date("2026-06-07T12:00:00.000Z");
  const fixedNow = () => now.getTime();

  it("returns 'just now' for less than 1 minute", () => {
    const date = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("just now");
  });

  it("returns 'X minutes ago' for less than 1 hour", () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("5 minutes ago");
  });

  it("uses singular 'minute' for exactly 1 minute", () => {
    const date = new Date(now.getTime() - 1 * 60 * 1000).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("1 minute ago");
  });

  it("returns 'X hours ago' for less than 24 hours", () => {
    const date = new Date(now.getTime() - 2 * HOUR).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("2 hours ago");
  });

  it("uses singular 'hour' for exactly 1 hour", () => {
    const date = new Date(now.getTime() - 1 * HOUR).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("1 hour ago");
  });

  it("returns 'X days ago' for less than 30 days", () => {
    const date = new Date(now.getTime() - 3 * DAY).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("3 days ago");
  });

  it("returns 'X months ago' for less than 365 days", () => {
    const date = new Date(now.getTime() - 2 * MONTH).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("2 months ago");
  });

  it("returns 'X years ago' for 365 days or more", () => {
    const date = new Date(now.getTime() - 2 * YEAR).toISOString();
    expect(relativeTimeFormatter(date, fixedNow())).toBe("2 years ago");
  });

  it("accepts a Date object as input", () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000);
    expect(relativeTimeFormatter(date, fixedNow())).toBe("5 minutes ago");
  });

  it("defaults `now` to Date.now() when not provided", () => {
    const date = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    expect(relativeTimeFormatter(date)).toBe("2 minutes ago");
  });
});
