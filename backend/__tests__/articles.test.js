const {
  allArticles,
  createArticle,
  singleArticle,
  updateArticle,
  articlesFeed,
} = require("../controllers/articles");

// Mock the models
jest.mock("../models", () => ({
  Article: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Tag: {
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
  },
}));

jest.mock("../helper/helpers", () => ({
  appendTagList: jest.fn(),
  appendFavorites: jest.fn(),
  appendFollowers: jest.fn(),
  slugify: jest.fn((title) => title.toLowerCase().replace(/\s+/g, "-")),
}));

jest.mock("../helper/customErrors", () => {
  class UnauthorizedError extends Error {
    constructor(msg) {
      super(msg);
      this.status = 401;
    }
  }
  class NotFoundError extends Error {
    constructor(msg) {
      super(msg);
      this.status = 404;
    }
  }
  class ForbiddenError extends Error {
    constructor(msg) {
      super(msg);
      this.status = 403;
    }
  }
  class FieldRequiredError extends Error {
    constructor(msg) {
      super(msg);
      this.status = 422;
    }
  }
  class AlreadyTakenError extends Error {
    constructor(msg) {
      super(msg);
      this.status = 422;
    }
  }
  class ValidationError extends Error {
    constructor(msg) {
      super(msg);
      this.status = 422;
    }
  }
  return {
    UnauthorizedError,
    NotFoundError,
    ForbiddenError,
    FieldRequiredError,
    AlreadyTakenError,
    ValidationError,
  };
});

const { Article, Tag, User } = require("../models");

describe("allArticles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("默认过滤草稿，只返回 published 文章", async () => {
    const publishedArticles = [
      { id: 1, slug: "test-1", status: "published", dataValues: {}, getTagList: jest.fn().mockResolvedValue([]) },
      { id: 2, slug: "test-2", status: "published", dataValues: {}, getTagList: jest.fn().mockResolvedValue([]) },
    ];

    Article.findAndCountAll.mockResolvedValue({
      rows: publishedArticles,
      count: 2,
    });

    const req = { query: {}, loggedUser: undefined };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await allArticles(req, res, next);

    expect(Article.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "published" },
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      articles: publishedArticles,
      articlesCount: 2,
    });
  });

  it("传 status=draft 且 author 匹配 loggedUser 时返回草稿", async () => {
    const draftArticles = [
      { id: 3, slug: "draft-1", status: "draft", dataValues: {}, getTagList: jest.fn().mockResolvedValue([]) },
    ];

    Article.findAndCountAll.mockResolvedValue({
      rows: draftArticles,
      count: 1,
    });

    const req = {
      query: { status: "draft", author: "testuser" },
      loggedUser: { id: 1, username: "testuser" },
    };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await allArticles(req, res, next);

    expect(Article.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "draft" },
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      articles: draftArticles,
      articlesCount: 1,
    });
  });

  it("传 status=draft 但 loggedUser 不匹配 author 时返回空", async () => {
    Article.findAndCountAll.mockResolvedValue({
      rows: [],
      count: 0,
    });

    const req = {
      query: { status: "draft", author: "otheruser" },
      loggedUser: { id: 1, username: "testuser" },
    };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await allArticles(req, res, next);

    // Should NOT have status filter - should be empty because user can't see drafts
    expect(res.json).toHaveBeenCalledWith({
      articles: [],
      articlesCount: 0,
    });
  });
});

describe("createArticle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("不传 status 时默认为 draft", async () => {
    Article.findOne.mockResolvedValue(null);
    Article.create.mockResolvedValue({
      id: 1,
      slug: "test-article",
      title: "Test Article",
      status: "draft",
      setAuthor: jest.fn(),
      addTagList: jest.fn(),
      dataValues: {},
      getTagList: jest.fn().mockResolvedValue([]),
    });

    const req = {
      body: { article: { title: "Test Article", description: "Desc", body: "Body", tagList: [] } },
      loggedUser: { id: 1, username: "testuser", dataValues: {} },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await createArticle(req, res, next);

    expect(Article.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "draft" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("传 status=draft 时创建草稿", async () => {
    Article.findOne.mockResolvedValue(null);
    Article.create.mockResolvedValue({
      id: 1,
      slug: "draft-article",
      title: "Draft Article",
      status: "draft",
      setAuthor: jest.fn(),
      addTagList: jest.fn(),
      dataValues: {},
      getTagList: jest.fn().mockResolvedValue([]),
    });

    const req = {
      body: { article: { title: "Draft Article", description: "Desc", body: "Body", tagList: [], status: "draft" } },
      loggedUser: { id: 1, username: "testuser", dataValues: {} },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await createArticle(req, res, next);

    expect(Article.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "draft" })
    );
  });

  it("传 status=published 时创建已发布文章", async () => {
    Article.findOne.mockResolvedValue(null);
    Article.create.mockResolvedValue({
      id: 1,
      slug: "published-article",
      title: "Published Article",
      status: "published",
      setAuthor: jest.fn(),
      addTagList: jest.fn(),
      dataValues: {},
      getTagList: jest.fn().mockResolvedValue([]),
    });

    const req = {
      body: { article: { title: "Published Article", description: "Desc", body: "Body", tagList: [], status: "published" } },
      loggedUser: { id: 1, username: "testuser", dataValues: {} },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await createArticle(req, res, next);

    expect(Article.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published" })
    );
  });
});

describe("updateArticle - published→draft protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("已发布文章不可退回草稿（返回 422）", async () => {
    Article.findOne.mockResolvedValue({
      id: 1,
      slug: "published-article",
      title: "Published Article",
      status: "published",
      author: { id: 1, username: "testuser" },
      tagList: [],
      save: jest.fn(),
      dataValues: {},
      getTagList: jest.fn().mockResolvedValue([]),
    });

    const req = {
      params: { slug: "published-article" },
      body: { article: { status: "draft" } },
      loggedUser: { id: 1, username: "testuser" },
    };
    const res = {};
    const next = jest.fn();

    await updateArticle(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 422 })
    );
  });

  it("草稿可以发布为 published", async () => {
    const mockArticle = {
      id: 2,
      slug: "draft-article",
      title: "Draft Article",
      status: "draft",
      author: { id: 1, username: "testuser" },
      tagList: [],
      save: jest.fn(),
      dataValues: {},
      getTagList: jest.fn().mockResolvedValue([]),
    };
    Article.findOne.mockResolvedValue(mockArticle);

    const req = {
      params: { slug: "draft-article" },
      body: { article: { status: "published" } },
      loggedUser: { id: 1, username: "testuser" },
    };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await updateArticle(req, res, next);

    expect(mockArticle.status).toBe("published");
    expect(mockArticle.save).toHaveBeenCalled();
  });
});

describe("singleArticle - draft access control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("作者可以查看自己的草稿", async () => {
    Article.findOne.mockResolvedValue({
      id: 1,
      slug: "my-draft",
      status: "draft",
      author: { id: 1, username: "testuser" },
      tagList: [
        { id: 1, name: "test", ArticleTagList: { articleId: 1, tagName: "test" } },
      ],
      getTagList: jest.fn().mockResolvedValue([]),
    });

    const req = {
      params: { slug: "my-draft" },
      loggedUser: { id: 1, username: "testuser" },
    };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await singleArticle(req, res, next);

    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("非作者查看草稿返回 404", async () => {
    Article.findOne.mockResolvedValue({
      id: 1,
      slug: "my-draft",
      status: "draft",
      author: { id: 1, username: "testuser" },
      tagList: [
        { id: 1, name: "test", ArticleTagList: { articleId: 1, tagName: "test" } },
      ],
      getTagList: jest.fn().mockResolvedValue([]),
    });

    const req = {
      params: { slug: "my-draft" },
      loggedUser: { id: 2, username: "otheruser" },
    };
    const res = {};
    const next = jest.fn();

    await singleArticle(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 404 })
    );
  });

  it("已发布文章任何人都可以查看", async () => {
    Article.findOne.mockResolvedValue({
      id: 2,
      slug: "public-article",
      status: "published",
      author: { id: 1, username: "testuser" },
      tagList: [
        { id: 1, name: "test", ArticleTagList: { articleId: 2, tagName: "test" } },
      ],
      getTagList: jest.fn().mockResolvedValue([]),
    });

    const req = {
      params: { slug: "public-article" },
      loggedUser: undefined,
    };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await singleArticle(req, res, next);

    expect(res.json).toHaveBeenCalled();
  });
});

describe("articlesFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("feed 只返回 published 文章", async () => {
    Article.findAndCountAll.mockResolvedValue({
      rows: [
        { id: 1, slug: "feed-1", status: "published", dataValues: {}, getTagList: jest.fn().mockResolvedValue([]) },
      ],
      count: 1,
    });

    const req = {
      query: {},
      loggedUser: {
        id: 1,
        getFollowing: jest.fn().mockResolvedValue([{ id: 2 }, { id: 3 }]),
      },
    };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await articlesFeed(req, res, next);

    expect(Article.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: [2, 3],
          status: "published",
        },
      })
    );
  });
});
