const { slugify, ARTICLE_STATUS, assertCanAccessArticle } = require("./helpers");
const { NotFoundError } = require("./customErrors");

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

describe("ARTICLE_STATUS", () => {
  test("exposes DRAFT and PUBLISHED constants", () => {
    expect(ARTICLE_STATUS.DRAFT).toBe("draft");
    expect(ARTICLE_STATUS.PUBLISHED).toBe("published");
  });

  test("is frozen so callers cannot mutate the enum", () => {
    expect(Object.isFrozen(ARTICLE_STATUS)).toBe(true);
  });
});

describe("assertCanAccessArticle", () => {
  const publishedArticle = { id: 1, userId: 42, status: "published" };
  const draftArticle = { id: 2, userId: 42, status: "draft" };
  const author = { id: 42, username: "author" };
  const stranger = { id: 99, username: "stranger" };

  test("allows any viewer when the article is published", () => {
    expect(() =>
      assertCanAccessArticle({ loggedUser: null, article: publishedArticle }),
    ).not.toThrow();
    expect(() =>
      assertCanAccessArticle({ loggedUser: stranger, article: publishedArticle }),
    ).not.toThrow();
  });

  test("throws NotFoundError for anonymous viewer of a draft", () => {
    expect(() =>
      assertCanAccessArticle({ loggedUser: null, article: draftArticle }),
    ).toThrow(NotFoundError);
  });

  test("throws NotFoundError for a non-author viewer of a draft", () => {
    expect(() =>
      assertCanAccessArticle({ loggedUser: stranger, article: draftArticle }),
    ).toThrow(NotFoundError);
  });

  test("allows the author to view their own draft", () => {
    expect(() =>
      assertCanAccessArticle({ loggedUser: author, article: draftArticle }),
    ).not.toThrow();
  });

  test("accepts an article with an included author (author.id fallback)", () => {
    const draftWithAuthor = { id: 3, status: "draft", author: { id: 42 } };
    expect(() =>
      assertCanAccessArticle({ loggedUser: author, article: draftWithAuthor }),
    ).not.toThrow();
  });
});
