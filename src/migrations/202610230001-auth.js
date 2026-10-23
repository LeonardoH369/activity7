'use strict';
module.exports = {
 async up(q, S) {
  await q.createTable('users', {
   id: { type: S.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
   name: { type: S.STRING(100), allowNull: false },
   email: { type: S.STRING(254), allowNull: false, unique: true },
   password_hash: { type: S.STRING(255), allowNull: false },
   created_at: { type: S.DATE, allowNull: false }, updated_at: { type: S.DATE, allowNull: false }
  });
  await q.createTable('Sessions', {
   sid: { type: S.STRING(36), primaryKey: true }, expires: S.DATE, data: S.TEXT,
   createdAt: { type: S.DATE, allowNull: false }, updatedAt: { type: S.DATE, allowNull: false }
  });
  await q.addIndex('Sessions', ['expires']);
 },
 async down(q) { await q.dropTable('Sessions'); await q.dropTable('users'); }
};
