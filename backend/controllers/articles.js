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
  isSlugTaken,
  slugify,
} = require("../helper/helpers");
const { Article, Tag, User } = require("../models");

const DRAFT = "draft";
const PUBLISHED = "published";

const includeOptions = [
  { model: Tag, as: "tagList", attributes: ["name"] },
  { model: User, as: "author", attributes: { exclude: ["email"] } },
];

const canViewArticle = (article, loggedUser) =>
  article.status !== DRAFT ||
  Boolean(loggedUser && loggedUser.id === article.userId);

//? All Articles - by Author/by Tag/Favorited by user
const allArticles = async (req, res, next) => {
  try {
    const { loggedUser } = req;

    const { author, favorited, limit = 3, offset = 0, status, tag } = req.query;

    // Drafts are only visible when the requester is the author of the drafts.
    const wantsDrafts =
      status === DRAFT && Boolean(loggedUser) && author === loggedUser.username;
    const filterStatus = wantsDrafts ? DRAFT : PUBLISHED;

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
          ...(author && { where: { username: author } }),
        },
      ],
      where: { status: filterStatus },
      limit: parseInt(limit),
      offset: offset * limit,
      order: [["createdAt", "DESC"]],
    };

    let articles = { rows: [], count: 0 };
    if (favorited) {
      const user = await User.findOne({ where: { username: favorited } });

      articles.rows = await user.getFavorites(searchOptions);
      articles.count = await user.countFavorites({ where: searchOptions.where });
    } else {
      articles = await Article.findAndCountAll(searchOptions);
    }

    // Drop drafts the requester is not allowed to see; this is defensive today
    // (the status filter already keeps drafts out for everyone but the author),
    // but it keeps the route safe if new entry points bypass the where clause.
    articles.rows = articles.rows.filter((article) =>
      canViewArticle(article, loggedUser),
    );

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

    const { title, description, body, status, tagList } = req.body.article || {};
    const nextStatus = status === DRAFT ? DRAFT : PUBLISHED;

    if (!title) throw new FieldRequiredError("A title");
    if (nextStatus === PUBLISHED) {
      if (!description) throw new FieldRequiredError("A description");
      if (!body) throw new FieldRequiredError("An article body");
    }

    const slug = slugify(title);
    if (await isSlugTaken({ Article, slug, status: nextStatus })) {
      throw new AlreadyTakenError("Title");
    }

    const article = await Article.create({
      slug: slug,
      title: title,
      description: description || "",
      body: body || "",
      status: nextStatus,
    });

    for (const tag of tagList || []) {
      const tagInDB = await Tag.findByPk(tag.trim());

      if (tagInDB) {
        await article.addTagList(tagInDB);
      } else if (tag.length > 2) {
        const newTag = await Tag.create({ name: tag.trim() });

        await article.addTagList(newTag);
      }
    }

    delete loggedUser.dataValues.token;

    article.dataValues.tagList = tagList || [];
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
        userId: authors.map((author) => author.id),
        status: PUBLISHED,
      },
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
    if (!article || !canViewArticle(article, loggedUser)) {
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

    const { body, description, status, title } = req.body.article || {};

    const nextStatus =
      status === DRAFT || status === PUBLISHED ? status : article.status;
    const nextTitle = title !== undefined ? title : article.title;

    if (!nextTitle) throw new FieldRequiredError("A title");
    if (nextStatus === PUBLISHED) {
      if (!description && !article.description) {
        throw new FieldRequiredError("A description");
      }
      if (!body && !article.body) {
        throw new FieldRequiredError("An article body");
      }
    }

    if (title) {
      const newSlug = slugify(title);
      if (newSlug !== article.slug) {
        if (
          await isSlugTaken({
            Article,
            excludeId: article.id,
            slug: newSlug,
            status: nextStatus,
          })
        ) {
          throw new AlreadyTakenError("Title");
        }
        article.slug = newSlug;
      }
      article.title = title;
    }
    if (description !== undefined) article.description = description;
    if (body !== undefined) article.body = body;
    if (article.status !== nextStatus) article.status = nextStatus;
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
    if (!article || !canViewArticle(article, loggedUser)) {
      throw new NotFoundError("Article");
    }

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
  articlesFeed,
  createArticle,
  deleteArticle,
  singleArticle,
  updateArticle,
};
