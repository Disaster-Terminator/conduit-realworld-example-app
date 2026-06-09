"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "status", {
      type: Sequelize.ENUM("draft", "published"),
      defaultValue: "draft",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "status");
  },
};
