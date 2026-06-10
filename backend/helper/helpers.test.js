const { slugify } = require("./helpers");

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

  // Note: slugify replaces each special char group with "-", so consecutive
  // special chars produce consecutive dashes. This is existing behavior.
  test("handles special characters", () => {
    expect(slugify("Hello! @World #2024")).toBe("hello---world--2024");
  });

  test("handles multiple spaces", () => {
    expect(slugify("  My   Draft  Article  ")).toBe("my---draft--article");
  });

  test("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  test("handles only special characters, which become dashes", () => {
    expect(slugify("!!! ??? ___")).toBe("-----------");
  });
});
