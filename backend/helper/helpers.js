const { NotFoundError } = require("./customErrors");

const slugify = (string) => {
  return string.trim().toLowerCase().replace(/\W|_/g, "-");
};

const appendTagList = (articleTags, article) => {
  const tagList = articleTags.map((tag) => tag.name);

  if (!article) return tagList;
  article.dataValues.tagList = tagList;
};

const appendFavorites = async (loggedUser, article) => {
  const favorited = await article.hasUser(loggedUser ? loggedUser : null);
  article.dataValues.favorited = loggedUser ? favorited : false;

  const favoritesCount = await article.countUsers();
  article.dataValues.favoritesCount = favoritesCount;
};

const appendFollowers = async (loggedUser, toAppend) => {
  //
  if (toAppend?.author) {
    const author = await toAppend.getAuthor();

    const following = await author.hasFollower(loggedUser ? loggedUser : null);
    toAppend.author.dataValues.following = loggedUser ? following : false;

    const followersCount = await author.countFollowers();
    toAppend.author.dataValues.followersCount = followersCount;
    //
  } else {
    const following = await toAppend.hasFollower(
      loggedUser ? loggedUser : null,
    );
    toAppend.dataValues.following = loggedUser ? following : false;

    const followersCount = await toAppend.countFollowers();
    toAppend.dataValues.followersCount = followersCount;
  }
};

const ARTICLE_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
});

const assertCanAccessArticle = ({ loggedUser, article }) => {
  if (!article) return;
  if (article.status !== ARTICLE_STATUS.DRAFT) return;

  const ownerId = article.userId ?? article.author?.id;
  if (!loggedUser || loggedUser.id !== ownerId) {
    throw new NotFoundError("Article");
  }
};

module.exports = {
  slugify,
  appendTagList,
  appendFavorites,
  appendFollowers,
  ARTICLE_STATUS,
  assertCanAccessArticle,
};
