"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "status", {
      type: Sequelize.STRING,
      defaultValue: "published",
    });
    await queryInterface.addColumn("Articles", "scheduledAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "scheduledAt");
    await queryInterface.removeColumn("Articles", "status");
  },
};
