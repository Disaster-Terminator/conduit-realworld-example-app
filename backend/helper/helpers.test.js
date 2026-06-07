const { Op } = require("sequelize");
const { isSlugTaken, slugify } = require("./helpers");

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

describe("isSlugTaken", () => {
  const makeArticle = (rows) => ({
    findOne: vi.fn(async ({ where }) => {
      return rows.find((row) => row.slug === where.slug && row.status === where.status) || null;
    }),
  });

  test("returns true when a published slug is already taken", async () => {
    const Article = makeArticle([{ slug: "hello-world", status: "published" }]);

    await expect(
      isSlugTaken({ Article, slug: "hello-world", status: "published" }),
    ).resolves.toBe(true);
    expect(Article.findOne).toHaveBeenCalledWith({
      where: { slug: "hello-world", status: "published" },
    });
  });

  test("returns false when same slug exists only as draft", async () => {
    const Article = makeArticle([{ slug: "hello-world", status: "draft" }]);

    await expect(
      isSlugTaken({ Article, slug: "hello-world", status: "published" }),
    ).resolves.toBe(false);
  });

  test("returns true when a draft slug is already taken", async () => {
    const Article = makeArticle([{ slug: "hello-world", status: "draft" }]);

    await expect(
      isSlugTaken({ Article, slug: "hello-world", status: "draft" }),
    ).resolves.toBe(true);
  });

  test("excludes the article id when excludeId is provided", async () => {
    const Article = makeArticle([]);

    await isSlugTaken({
      Article,
      excludeId: 42,
      slug: "hello-world",
      status: "published",
    });
    expect(Article.findOne).toHaveBeenCalledWith({
      where: { slug: "hello-world", status: "published", id: { [Op.ne]: 42 } },
    });
  });
});
