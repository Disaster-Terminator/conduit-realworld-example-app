const express = require("express");
const router = express.Router();
const { Tag, Article, sequelize } = require("../models");
const { formatTagCounts } = require("../helper/helpers");

// All Tags — Popular Tags (top 10 by article count)
router.get("/", async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      attributes: [
        "name",
        [sequelize.fn("COUNT", sequelize.col("Articles.id")), "count"],
      ],
      include: [
        {
          model: Article,
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["Tag.name"],
      order: [[sequelize.fn("COUNT", sequelize.col("Articles.id")), "DESC"]],
      limit: 10,
      subQuery: false,
    });

    res.json({ tags: formatTagCounts(tags) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
