const { Op } = require("sequelize");
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

// Helper: build status filter for public listing
const publicStatusFilter = () => ({
  [Op.or]: [
    { status: "published" },
    { status: "scheduled", scheduledAt: { [Op.lte]: new Date() } },
  ],
});

const includeOptions = [
  { model: Tag, as: "tagList", attributes: ["name"] },
  { model: User, as: "author", attributes: { exclude: ["email"] } },
];

//? All Articles - by Author/by Tag/Favorited by user
const allArticles = async (req, res, next) => {
  try {
    const { loggedUser } = req;

    const { author, tag, favorited, limit = 3, offset = 0, status } = req.query;

    // Build status where clause
    let statusWhere;
    if (status === "draft") {
      // Only the author themselves can request drafts
      if (!loggedUser || !author || loggedUser.username !== author) {
        return res.json({ articles: [], articlesCount: 0 });
      }
      statusWhere = { status: "draft" };
    } else if (status === "scheduled") {
      if (!loggedUser || !author || loggedUser.username !== author) {
        return res.json({ articles: [], articlesCount: 0 });
      }
      statusWhere = { status: "scheduled" };
    } else {
      // Public listing: only published or past-scheduled articles
      statusWhere = publicStatusFilter();
    }

    const searchOptions = {
      where: statusWhere,
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
          ...(author && { where: { username: author } }),
        },
      ],
      limit: parseInt(limit),
      offset: offset * limit,
      order: [["createdAt", "DESC"]],
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

    const { title, description, body, tagList, status, scheduledAt } =
      req.body.article;
    const articleStatus = status || "published";

    // Validation depends on status
    if (!title) throw new FieldRequiredError("A title");
    if (articleStatus === "scheduled" && !scheduledAt) {
      throw new FieldRequiredError("A scheduled publish time");
    }
    if (articleStatus === "published") {
      if (!description) throw new FieldRequiredError("A description");
      if (!body) throw new FieldRequiredError("An article body");
    }

    const slug = slugify(title);
    // Slug uniqueness: only enforced for published/scheduled, drafts can share slug
    if (articleStatus !== "draft") {
      const slugInDB = await Article.findOne({ where: { slug } });
      if (slugInDB) throw new AlreadyTakenError("Title");
    }

    const article = await Article.create({
      slug: slug,
      title: title,
      description: description || "",
      body: body || "",
      status: articleStatus,
      scheduledAt: articleStatus === "scheduled" ? new Date(scheduledAt) : null,
      userId: loggedUser.id,
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
      limit: parseInt(limit),
      offset: offset * limit,
      order: [["createdAt", "DESC"]],
      where: {
        [Op.and]: [
          { userId: authors.map((author) => author.id) },
          publicStatusFilter(),
        ],
      },
    });

    for (const article of articles.rows) {
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

    const isAuthor = loggedUser && loggedUser.id === article.userId;

    // Draft: only author can view
    if (article.status === "draft" && !isAuthor) {
      throw new NotFoundError("Article");
    }

    // Scheduled: only author can view before publish time
    if (
      article.status === "scheduled" &&
      article.scheduledAt &&
      new Date(article.scheduledAt) > new Date() &&
      !isAuthor
    ) {
      throw new NotFoundError("Article");
    }

    // If scheduled and past the time, auto-promote to published (lazy update)
    if (
      article.status === "scheduled" &&
      article.scheduledAt &&
      new Date(article.scheduledAt) <= new Date()
    ) {
      article.status = "published";
      article.scheduledAt = null;
      await article.save();
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

    const { title, description, body, tagList, status, scheduledAt } =
      req.body.article;

    // Apply title change
    if (title) {
      article.title = title;
      // Slug collision check only when changing to published
      const newSlug = slugify(title);
      if (status === "published") {
        const slugInDB = await Article.findOne({
          where: { slug: newSlug, id: { [Op.ne]: article.id } },
        });
        if (slugInDB) throw new AlreadyTakenError("Title");
      }
      article.slug = newSlug;
    }

    if (description !== undefined) article.description = description;
    if (body !== undefined) article.body = body;

    // Status transition
    if (status) {
      article.status = status;
      if (status === "scheduled" && scheduledAt) {
        article.scheduledAt = new Date(scheduledAt);
      } else if (status === "scheduled" && !scheduledAt && !article.scheduledAt) {
        throw new FieldRequiredError("A scheduled publish time");
      }
      if (status === "draft" || status === "published") {
        if (status === "published" && !article.description) {
          throw new FieldRequiredError("A description");
        }
        if (status === "published" && !article.body) {
          throw new FieldRequiredError("An article body");
        }
        // Only clear scheduledAt when going to draft (cancel schedule)
        if (status === "draft") {
          article.scheduledAt = null;
        }
      }
    } else if (scheduledAt) {
      // Update scheduled time without changing status
      article.scheduledAt = new Date(scheduledAt);
    }

    await article.save();

    // Handle tag list update if provided
    if (tagList && Array.isArray(tagList)) {
      await article.setTagList([]);
      for (const tag of tagList) {
        const tagInDB = await Tag.findByPk(tag.trim());
        if (tagInDB) {
          await article.addTagList(tagInDB);
        } else if (tag.length > 2) {
          const newTag = await Tag.create({ name: tag.trim() });
          await article.addTagList(newTag);
        }
      }
    }

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
