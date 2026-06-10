const { slugify, formatTagCounts } = require("./helpers");

describe("Slugify", () => {
  const stringsArray = [
    "  Hello World  ",
    "  Hello WORLD  ",
    " HELLO WORLD",
    "Hello World",
    "Hello_world ",
    "Hello-world",
  ];

  test.each(stringsArray)("%p", (string) => {
    expect(slugify(string)).toBe("hello-world");
  });
});

describe("formatTagCounts", () => {
  it("should return top 10 items sorted by count descending", () => {
    const result = formatTagCounts([
      { name: "svelte", count: 0 },
      { name: "nodejs", count: 20 },
      { name: "react", count: 30 },
      { name: "angular", count: 1 },
    ]);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ name: "react", count: 30 });
    expect(result[1]).toEqual({ name: "nodejs", count: 20 });
    expect(result[3]).toEqual({ name: "svelte", count: 0 });
  });

  it("should limit to top 10 items", () => {
    const items = Array.from({ length: 15 }, (_, i) => ({ name: `tag${i}`, count: i }));
    expect(formatTagCounts(items)).toHaveLength(10);
  });

  it("should handle empty array", () => {
    expect(formatTagCounts([])).toEqual([]);
  });

  it("should handle non-array input", () => {
    expect(formatTagCounts(null)).toEqual([]);
    expect(formatTagCounts(undefined)).toEqual([]);
  });
});
