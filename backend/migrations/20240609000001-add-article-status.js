"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "status", {
      type: Sequelize.ENUM("draft", "published"),
      defaultValue: "draft",
    });

    // Set existing articles as published for backward compatibility
    await queryInterface.sequelize.query(
      'UPDATE "Articles" SET status = \'published\' WHERE status IS NULL',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "status");
  },
};
