'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      code: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      title: { type: Sequelize.STRING(150), allowNull: false },
      cover_url: { type: Sequelize.STRING(255), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      robotics_kit_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'robotics_kits', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      didactic_material_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true, references: { model: 'didactic_materials', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci', engine: 'InnoDB' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('courses');
  }
};
