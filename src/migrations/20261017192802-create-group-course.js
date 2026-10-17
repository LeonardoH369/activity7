'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_courses', {
      group_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, references: { model: 'groups', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      course_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci', engine: 'InnoDB' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('group_courses');
  }
};
