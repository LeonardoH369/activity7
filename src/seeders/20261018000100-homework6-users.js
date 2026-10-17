'use strict';
const { hashPassword } = require('../utils/password');
const users = [
  { username: 'Admon', email: 'admon@robotics.com', role: 'administrator' },
  { username: 'Tecmilenio', email: 'tecmilenio@robotics.com', role: 'teacher' },
  { username: 'Student', email: 'student@robotics.com', role: 'student' },
];
module.exports = {
  async up(qi) {
    await qi.sequelize.transaction(async (transaction) => {
      const [groups] = await qi.sequelize.query("SELECT id FROM `groups` WHERE name = 'beginner'", { transaction });
      if (!groups.length) throw new Error('Ejecutar primero la semilla de Activity 7');
      for (const user of users) {
        const [existing] = await qi.sequelize.query('SELECT id FROM users WHERE email = :email OR username = :username', { replacements: user, transaction });
        if (existing.length) continue;
        await qi.bulkInsert('users', [{ ...user, name: user.username, password_hash: hashPassword('Adm@2022'), group_id: user.role === 'student' ? groups[0].id : null, created_at: new Date(), updated_at: new Date() }], { transaction });
      }
    });
  },
  async down(qi) { await qi.bulkDelete('users', { email: users.map(x => x.email) }); },
};
