const { Article, sequelize } = require("../models/index");

beforeAll(async () => {
  await sequelize.sync({ alter: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Article model", () => {
  describe("coverImage field", () => {
    test("is defined in the model schema", () => {
      expect(Article.rawAttributes).toHaveProperty("coverImage");
    });

    test("is of type STRING", () => {
      expect(Article.rawAttributes.coverImage.type.constructor.key).toBe(
        "STRING",
      );
    });

    test("does not have NOT NULL constraint (allows null)", () => {
      // Sequelize defaults allowNull to true when not explicitly set
      expect(Article.rawAttributes.coverImage.allowNull).not.toBe(false);
    });
  });

  describe("creating articles with coverImage", () => {
    const baseArticle = {
      slug: "test-cover-image-" + Date.now(),
      title: "Test Cover Image",
      description: "Testing coverImage field",
      body: "Test body",
    };

    test("can create an article with a coverImage URL", async () => {
      const article = await Article.create({
        ...baseArticle,
        slug: baseArticle.slug + "-with",
        coverImage: "https://example.com/cover.jpg",
      });

      expect(article.coverImage).toBe("https://example.com/cover.jpg");

      await article.destroy();
    });

    test("can create an article without a coverImage", async () => {
      const article = await Article.create({
        ...baseArticle,
        slug: baseArticle.slug + "-without",
      });

      expect(article.coverImage).toBeNull();

      await article.destroy();
    });

    test("toJSON includes coverImage field", async () => {
      const article = await Article.create({
        ...baseArticle,
        slug: baseArticle.slug + "-json",
        coverImage: "https://example.com/cover.jpg",
      });

      const json = article.toJSON();
      expect(json).toHaveProperty("coverImage");
      expect(json.coverImage).toBe("https://example.com/cover.jpg");

      await article.destroy();
    });

    test("toJSON sets id and userId to undefined", async () => {
      const article = await Article.create({
        ...baseArticle,
        slug: baseArticle.slug + "-json2",
      });

      const json = article.toJSON();
      expect(json.id).toBeUndefined();
      expect(json.userId).toBeUndefined();

      await article.destroy();
    });
  });
});
