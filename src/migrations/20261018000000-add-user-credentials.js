'use strict';
const { randomBytes } = require('node:crypto');
const { hashPassword } = require('../utils/password');
module.exports = {
  async up(qi, Sequelize) {
    await qi.addColumn('users', 'username', { type: Sequelize.STRING(50), allowNull: true, unique: true });
    await qi.addColumn('users', 'password_hash', { type: Sequelize.STRING(255), allowNull: true });
    const [users] = await qi.sequelize.query('SELECT id FROM users');
    for (const user of users) await qi.bulkUpdate('users', {
      username: `user_${user.id}`, password_hash: hashPassword(randomBytes(32).toString('hex')),
    }, { id: user.id });
    await qi.changeColumn('users', 'username', { type: Sequelize.STRING(50), allowNull: false });
    await qi.changeColumn('users', 'password_hash', { type: Sequelize.STRING(255), allowNull: false });
  },
  async down(qi) {
    await qi.removeColumn('users', 'password_hash');
    await qi.removeColumn('users', 'username');
  },
};
