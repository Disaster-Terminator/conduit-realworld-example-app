const { UnauthorizedError, NotFoundError } = require("../helper/customErrors");
const { appendLikes } = require("../helper/helpers");
const { Article, Comment } = require("../models");

//* Like/Unlike Comment
const likeToggler = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug, commentId } = req.params;

    const article = await Article.findOne({ where: { slug } });
    if (!article) throw new NotFoundError("Article");

    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new NotFoundError("Comment");

    if (req.method === "POST") await comment.addUser(loggedUser);
    if (req.method === "DELETE") await comment.removeUser(loggedUser);

    await appendLikes(loggedUser, comment);

    res.json({ comment });
  } catch (error) {
    next(error);
  }
};

module.exports = { likeToggler };
