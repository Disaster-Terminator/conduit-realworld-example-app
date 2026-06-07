"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Articles");
    if (!table.status) {
      await queryInterface.addColumn("Articles", "status", {
        type: Sequelize.ENUM("draft", "published"),
        allowNull: false,
        defaultValue: "published",
      });
    }

    const indexes = await queryInterface.showIndex("Articles");
    const hasCompositeIndex = indexes.some(
      (idx) => idx.name === "articles_user_id_status_idx",
    );
    if (!hasCompositeIndex) {
      await queryInterface.addIndex("Articles", ["userId", "status"], {
        name: "articles_user_id_status_idx",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "Articles",
      "articles_user_id_status_idx",
    );

    await queryInterface.removeColumn("Articles", "status");
  },
};
