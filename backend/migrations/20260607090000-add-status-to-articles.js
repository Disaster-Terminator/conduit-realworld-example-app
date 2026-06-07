"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Articles");
    if (table.status) return;

    await queryInterface.addColumn("Articles", "status", {
      type: Sequelize.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "published",
    });
  },
  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Articles");
    if (!table.status) return;

    await queryInterface.removeColumn("Articles", "status");
  },
};
