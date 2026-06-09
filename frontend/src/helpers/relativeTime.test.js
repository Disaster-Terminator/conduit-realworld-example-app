import relativeTime from "./relativeTime";

it("returns 'just now' for less than a minute", () => {
  const now = "2026-06-09T12:00:00.000Z";
  const date = "2026-06-09T12:00:30.000Z";
  expect(relativeTime(date, now)).toBe("just now");
});

it("returns '1 minute ago' for one minute", () => {
  const now = "2026-06-09T12:05:00.000Z";
  const date = "2026-06-09T12:04:00.000Z";
  expect(relativeTime(date, now)).toBe("1 minute ago");
});

it("returns 'X minutes ago' for multiple minutes", () => {
  const now = "2026-06-09T12:05:00.000Z";
  const date = "2026-06-09T12:02:00.000Z";
  expect(relativeTime(date, now)).toBe("3 minutes ago");
});

it("returns '1 hour ago' for one hour", () => {
  const now = "2026-06-09T14:00:00.000Z";
  const date = "2026-06-09T13:00:00.000Z";
  expect(relativeTime(date, now)).toBe("1 hour ago");
});

it("returns 'X hours ago' for multiple hours", () => {
  const now = "2026-06-09T18:00:00.000Z";
  const date = "2026-06-09T14:00:00.000Z";
  expect(relativeTime(date, now)).toBe("4 hours ago");
});

it("returns '1 day ago' for one day", () => {
  const now = "2026-06-10T12:00:00.000Z";
  const date = "2026-06-09T12:00:00.000Z";
  expect(relativeTime(date, now)).toBe("1 day ago");
});

it("returns 'X days ago' for multiple days", () => {
  const now = "2026-06-15T12:00:00.000Z";
  const date = "2026-06-09T12:00:00.000Z";
  expect(relativeTime(date, now)).toBe("6 days ago");
});

it("returns '1 week ago' for one week", () => {
  const now = "2026-06-16T12:00:00.000Z";
  const date = "2026-06-09T12:00:00.000Z";
  expect(relativeTime(date, now)).toBe("1 week ago");
});

it("returns 'X weeks ago' for multiple weeks", () => {
  const now = "2026-06-30T12:00:00.000Z";
  const date = "2026-06-09T12:00:00.000Z";
  expect(relativeTime(date, now)).toBe("3 weeks ago");
});

it("returns '1 month ago' for about one month", () => {
  const now = "2026-07-09T12:00:00.000Z";
  const date = "2026-06-09T12:00:00.000Z";
  expect(relativeTime(date, now)).toBe("1 month ago");
});

it("returns 'X months ago' for multiple months", () => {
  const now = "2026-09-09T12:00:00.000Z";
  const date = "2026-06-09T12:00:00.000Z";
  expect(relativeTime(date, now)).toBe("3 months ago");
});
