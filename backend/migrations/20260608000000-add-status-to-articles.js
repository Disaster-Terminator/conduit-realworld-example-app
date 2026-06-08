"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "status", {
      type: Sequelize.ENUM("draft", "published"),
      defaultValue: "draft",
      allowNull: false,
    });
    // Set all existing articles to published
    await queryInterface.sequelize.query(
      `UPDATE "Articles" SET status = 'published' WHERE status IS NULL`,
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "status");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Articles_status"',
    );
  },
};
