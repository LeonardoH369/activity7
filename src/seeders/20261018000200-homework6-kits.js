'use strict';
const names = ['StarterKit', 'Educational Robotics Kit', 'Kit5'];
module.exports = {
  async up(qi) {
    for (const name of names) {
      await qi.sequelize.query('INSERT IGNORE INTO robotics_kits (name, created_at, updated_at) VALUES (:name, NOW(), NOW())', { replacements: { name } });
    }
  },
  // Shared reference data already belongs to Activity 7; keep it on undo.
  async down() {},
};
