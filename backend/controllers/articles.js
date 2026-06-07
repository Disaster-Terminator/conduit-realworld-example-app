const {
  AlreadyTakenError,
  FieldRequiredError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} = require("../helper/customErrors");
const {
  appendFollowers,
  appendFavorites,
  appendTagList,
  slugify,
} = require("../helper/helpers");
const { Article, Tag, User } = require("../models");

const includeOptions = [
  { model: Tag, as: "tagList", attributes: ["name"] },
  { model: User, as: "author", attributes: { exclude: ["email"] } },
];

const VALID_STATUSES = new Set(["draft", "published"]);
const DEFAULT_STATUS = "published";

const resolveStatus = (rawStatus) =>
  VALID_STATUSES.has(rawStatus) ? rawStatus : DEFAULT_STATUS;

const buildStatusWhere = (status) => ({ status });

//? All Articles - by Author/by Tag/Favorited by user
const allArticles = async (req, res, next) => {
  try {
    const { loggedUser } = req;

    const { author, tag, favorited, limit = 3, offset = 0 } = req.query;
    const status = resolveStatus(req.query.status);

    if (status === "draft") {
      if (!loggedUser) throw new UnauthorizedError();
      if (author && author !== loggedUser.username) {
        throw new ForbiddenError("article");
      }
    }

    const effectiveAuthor = status === "draft" ? loggedUser.username : author;

    const searchOptions = {
      include: [
        {
          model: Tag,
          as: "tagList",
          attributes: ["name"],
          ...(tag && { where: { name: tag } }),
        },
        {
          model: User,
          as: "author",
          attributes: { exclude: ["email"] },
          ...(effectiveAuthor && { where: { username: effectiveAuthor } }),
        },
      ],
      where: buildStatusWhere(status),
      limit: parseInt(limit),
      offset: offset * limit,
      order: status === "draft" ? [["updatedAt", "DESC"]] : [["createdAt", "DESC"]],
    };

    let articles = { rows: [], count: 0 };
    if (favorited) {
      const user = await User.findOne({ where: { username: favorited } });

      articles.rows = await user.getFavorites(searchOptions);
      articles.count = await user.countFavorites();
    } else {
      articles = await Article.findAndCountAll(searchOptions);
    }

    for (let article of articles.rows) {
      const articleTags = await article.getTagList();

      appendTagList(articleTags, article);
      await appendFollowers(loggedUser, article);
      await appendFavorites(loggedUser, article);

      delete article.dataValues.Favorites;
    }

    res.json({ articles: articles.rows, articlesCount: articles.count });
  } catch (error) {
    next(error);
  }
};

//* Create Article
const createArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { title, description, body, tagList } = req.body.article;
    const status = resolveStatus(req.body.article?.status);

    if (!title) throw new FieldRequiredError("A title");

    if (status === "published") {
      if (!description) throw new FieldRequiredError("A description");
      if (!body) throw new FieldRequiredError("An article body");
    }

    const slug = slugify(title);
    const slugInDB = await Article.findOne({ where: { slug: slug } });
    if (slugInDB) throw new AlreadyTakenError("Title");

    const article = await Article.create({
      slug: slug,
      title: title,
      description: description,
      body: body,
      status,
    });

    for (const tag of tagList) {
      const tagInDB = await Tag.findByPk(tag.trim());

      if (tagInDB) {
        await article.addTagList(tagInDB);
      } else if (tag.length > 2) {
        const newTag = await Tag.create({ name: tag.trim() });

        await article.addTagList(newTag);
      }
    }

    delete loggedUser.dataValues.token;

    article.dataValues.tagList = tagList;
    article.setAuthor(loggedUser);
    article.dataValues.author = loggedUser;
    await appendFollowers(loggedUser, loggedUser);
    await appendFavorites(loggedUser, article);

    res.status(201).json({ article });
  } catch (error) {
    next(error);
  }
};

//* Feed
const articlesFeed = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { limit = 3, offset = 0 } = req.query;
    const authors = await loggedUser.getFollowing();

    const articles = await Article.findAndCountAll({
      include: includeOptions,
      where: {
        ...buildStatusWhere(DEFAULT_STATUS),
        userId: authors.map((author) => author.id),
      },
      limit: parseInt(limit),
      offset: offset * limit,
      order: [["createdAt", "DESC"]],
    });

    for (let article of articles.rows) {
      const articleTags = await article.getTagList();

      appendTagList(articleTags, article);
      await appendFollowers(loggedUser, article);
      await appendFavorites(loggedUser, article);
    }

    res.json({ articles: articles.rows, articlesCount: articles.count });
  } catch (error) {
    next(error);
  }
};

// Single Article by slug
const singleArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new NotFoundError("Article");

    if (
      article.status === "draft" &&
      (!loggedUser || article.author.id !== loggedUser.id)
    ) {
      throw new NotFoundError("Article");
    }

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

//* Update Article
const updateArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new NotFoundError("Article");

    if (loggedUser.id !== article.author.id) {
      throw new ForbiddenError("article");
    }

    const { title, description, body } = req.body.article;
    const targetStatus =
      req.body.article && "status" in req.body.article
        ? resolveStatus(req.body.article.status)
        : article.status;

    if (title) {
      article.slug = slugify(title);
      article.title = title;
    }
    if (description) article.description = description;
    if (body) article.body = body;

    if (targetStatus === "published") {
      const finalDescription = description ?? article.description;
      const finalBody = body ?? article.body;
      if (!finalDescription) throw new FieldRequiredError("A description");
      if (!finalBody) throw new FieldRequiredError("An article body");
    }

    article.status = targetStatus;
    await article.save();

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

//* Delete Article
const deleteArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new NotFoundError("Article");

    if (loggedUser.id !== article.author.id) {
      throw new ForbiddenError("article");
    }

    await article.destroy();

    res.json({ message: { body: ["Article deleted successfully"] } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  allArticles,
  createArticle,
  singleArticle,
  updateArticle,
  deleteArticle,
  articlesFeed,
};
