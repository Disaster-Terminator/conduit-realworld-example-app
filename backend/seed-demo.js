const path = require("path");
process.chdir(__dirname);
require("dotenv").config();

const { sequelize, User, Article, Tag } = require("./models");

(async () => {
  await sequelize.sync({ alter: true });

  const bcrypt = require("bcrypt");
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const email = `example${i}@mail.com`;
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        username: `exampleUser${i}`,
        email,
        password: await bcrypt.hash(`examplePwd${i}`, 10),
        bio: `Bio for exampleUser${i}`,
        image: null,
      },
    });
    users.push(user);
    console.log(`Demo user ready: ${user.username}`);
  }

  const allUsers = await User.findAll();
  const articles = [];
  for (let i = 1; i <= 55; i++) {
    const author = allUsers[Math.floor(Math.random() * allUsers.length)];
    const [article] = await Article.findOrCreate({
      where: { slug: `lorem-ipsum-${i}` },
      defaults: {
        slug: `lorem-ipsum-${i}`,
        title: `Lorem Ipsum ${i}`,
        description: `${i} - Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec ante lacinia magna ultricies cursus nec non lacus. Praesent blandit sodales semper. Mauris eget leo non erat molestie faucibus luctus sed ex. Duis sollicitudin tellus vitae aliquam cursus. Integer ultricies ultricies erat. Vivamus egestas ac augue nec mattis. Duis posuere bibendum ex vitae placerat. Duis in odio vestibulum, pellentesque odio vitae, egestas nibh.`,
        userId: author.id,
      },
    });
    articles.push(article);
  }
  console.log(`Demo articles ready: ${articles.length}`);

  const tagNames = ["react", "nodejs", "express", "postgresql", "sequelize"];
  for (const name of tagNames) {
    await Tag.findOrCreate({ where: { name }, defaults: { name } });
    console.log(`Demo tag ready: ${name}`);
  }

  // 确定性 tag-article 关联: 某些 tag 被更多文章使用，便于验证排序
  const allTags = await Tag.findAll();
  const tagMap = {};
  for (const tag of allTags) tagMap[tag.name] = tag;

  const assignment = [
    { tag: "react", indices: [...Array(30).keys()] },
    { tag: "nodejs", indices: [...Array(20).keys()] },
    { tag: "express", indices: [...Array(10).keys()] },
    { tag: "postgresql", indices: [0, 1, 2, 3, 4] },
    { tag: "sequelize", indices: [0, 1, 2] },
  ];

  for (const { tag, indices } of assignment) {
    const tagObj = tagMap[tag];
    if (!tagObj) continue;
    const targetArticles = indices.map((i) => articles[i]).filter(Boolean);
    for (const article of targetArticles) {
      await article.addTagList(tagObj);
    }
  }
  console.log(`Demo tag-article associations ready: react=30, nodejs=20, express=10, postgresql=5, sequelize=3`);

  console.log("\nSeed complete! Demo accounts:");
  console.log("  email: example1@mail.com  pwd: examplePwd1");
  console.log("  email: example2@mail.com  pwd: examplePwd2");
  console.log("  ... through example5@mail.com / examplePwd5");

  await sequelize.close();
})();
