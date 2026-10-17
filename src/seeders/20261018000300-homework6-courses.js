'use strict';
const { courseFactory } = require('../factories/courseFactory');
module.exports = {
  async up(qi) {
    const { Course, DidacticMaterial, RoboticsKit } = require('../models');
    await qi.sequelize.transaction(async (transaction) => {
      const kits = await RoboticsKit.findAll({ where: { name: ['StarterKit', 'Educational Robotics Kit', 'Kit5'] }, order: [['id', 'ASC']], transaction });
      if (kits.length !== 3) throw new Error('Se requieren los tres kits');
      const makeCourse = courseFactory();
      for (let i = 1; i <= 100; i++) {
        const fields = makeCourse(i, kits.map(x => x.id), null);
        if (await Course.findOne({ where: { code: fields.code }, transaction })) continue;
        const material = await DidacticMaterial.create({ title: `Guide ${fields.code}`, file_url: '/assets/materials/generated.md' }, { transaction });
        await Course.create({ ...fields, didactic_material_id: material.id }, { transaction });
      }
    });
  },
  async down(qi) {
    const { Course, DidacticMaterial } = require('../models');
    await qi.sequelize.transaction(async (transaction) => {
      const codes = Array.from({ length: 100 }, (_, i) => `HW6-${String(i + 1).padStart(3, '0')}`);
      const courses = await Course.findAll({ where: { code: codes }, transaction });
      await Course.destroy({ where: { code: codes }, transaction });
      await DidacticMaterial.destroy({ where: { id: courses.map(x => x.didactic_material_id) }, transaction });
    });
  },
};
