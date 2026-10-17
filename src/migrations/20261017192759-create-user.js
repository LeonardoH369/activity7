'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      role: { type: Sequelize.ENUM('student', 'teacher', 'administrator'), allowNull: false },
      group_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'groups', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci', engine: 'InnoDB' });
    await queryInterface.sequelize.query(`ALTER TABLE users ADD CONSTRAINT chk_users_role_group CHECK (
      (role = 'student' AND group_id IS NOT NULL) OR
      (role IN ('teacher', 'administrator') AND group_id IS NULL)
    )`);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
