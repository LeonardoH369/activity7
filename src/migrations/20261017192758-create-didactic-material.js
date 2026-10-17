'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('didactic_materials', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      title: { type: Sequelize.STRING(150), allowNull: false },
      file_url: { type: Sequelize.STRING(255), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci', engine: 'InnoDB' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('didactic_materials');
  }
};
