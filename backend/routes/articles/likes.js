const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/authentication");
const { likeToggler } = require("../../controllers/likes");

//* Like/Unlike Comment
router.post("/:slug/comments/:commentId/like", verifyToken, likeToggler);
router.delete("/:slug/comments/:commentId/like", verifyToken, likeToggler);

module.exports = router;
