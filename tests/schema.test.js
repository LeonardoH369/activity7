const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

assert.match(process.env.DB_NAME || '', /^activity7.*_test$/, 'Usar una base independiente activity7..._test');
const { sequelize, Group, User, Course, RoboticsKit, DidacticMaterial, GroupCourse } = require('../src/models');
let transaction;

before(async () => {
  await sequelize.authenticate();
  transaction = await sequelize.transaction();
});
after(async () => {
  try { if (transaction) await transaction.rollback(); }
  finally { await sequelize.close(); }
});

test('los cursos del caso conservan las claves y los tres kits normalizados', async () => {
  const courses = await Course.findAll({ include: ['kit', 'material'], order: [['code', 'ASC']] });
  assert.deepEqual(courses.map((x) => [x.code, x.kit.name]), [
    ['Rob101', 'StarterKit'], ['Rob102', 'StarterKit'],
    ['Rob103', 'Educational Robotics Kit'], ['Rob104', 'Kit5'],
  ]);
  assert.ok(courses.every((x) => x.title && x.cover_url && x.content && x.material));
  assert.equal(await RoboticsKit.count(), 3);
});

test('las asociaciones recorren estudiantes grupos cursos kits y material', async () => {
  const group = await Group.findByPk(1, { include: ['students', 'courses'] });
  assert.equal(group.name, 'beginner');
  assert.equal(group.students.length, 1);
  assert.equal(group.students[0].role, 'student');
  assert.equal(group.courses.length, 2);
  const course = await Course.findByPk(3, { include: ['groups'] });
  assert.deepEqual(course.groups.map((x) => x.name).sort(), ['advanced', 'intermediate']);
  const kit = await RoboticsKit.findByPk(1, { include: ['courses'] });
  assert.equal(kit.courses.length, 2);
  const material = await DidacticMaterial.findByPk(1, { include: ['course'] });
  assert.equal(material.course.code, 'Rob101');
  const student = await User.findByPk(1, { include: ['group'] });
  assert.equal(student.group.name, 'beginner');
});

test('la base rechaza roles sin grupo válido y referencias inexistentes', async () => {
  const qi = sequelize.getQueryInterface();
  const insert = (role, group_id, suffix) => qi.bulkInsert('users', [{
    name: 'Prueba temporal', email: `schema-${suffix}@example.test`, role, group_id,
    created_at: new Date(), updated_at: new Date(),
  }], { transaction });
  await assert.rejects(insert('student', null, 'student'), /chk_users_role_group/i);
  await assert.rejects(insert('teacher', 1, 'teacher'), /chk_users_role_group/i);
  await assert.rejects(insert('student', 999999, 'fk'), /foreign key/i);
  const user = await User.create({ name: 'Nuevo alumno', email: 'new@example.test', role: 'student', group_id: 1 }, { transaction });
  assert.equal(user.group_id, 1);
});

test('claves compuestas y restricciones protegen cursos y asignaciones', async () => {
  await assert.rejects(GroupCourse.create({ group_id: 1, course_id: 1 }, { transaction }));
  await assert.rejects(GroupCourse.create({ group_id: 1, course_id: 999999 }, { transaction }));
  await assert.rejects(Course.create({ code: 'Prueba', title: 'Prueba', cover_url: '/cover', content: 'Prueba', robotics_kit_id: 1 }, { transaction }));
  await assert.rejects(Course.create({ code: 'Prueba', title: 'Prueba', cover_url: '/cover', content: 'Prueba', robotics_kit_id: 1, didactic_material_id: 1 }, { transaction }));
  const group = await Group.create({ name: 'expert' }, { transaction });
  assert.ok(group.id > 3, 'Se pueden agregar niveles sin modificar el esquema');
});

test('los seis controladores responden con relaciones y validan identificadores', async (t) => {
  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of ['users', 'groups', 'courses', 'robotics-kits', 'didactic-materials', 'group-courses']) {
    const response = await fetch(`${base}/api/${route}`);
    assert.equal(response.status, 200, route);
    assert.ok(Array.isArray(await response.json()));
    const detail = route === 'group-courses' ? '1/1' : '1';
    assert.equal((await fetch(`${base}/api/${route}/${detail}`)).status, 200, route);
  }
  assert.equal((await fetch(`${base}/api/courses/no`)).status, 400);
  assert.equal((await fetch(`${base}/api/courses/999999`)).status, 404);
  assert.equal((await fetch(`${base}/assets/materials/Rob101.md`)).status, 200);
  assert.equal((await fetch(`${base}/assets/course-cover.svg`)).status, 200);
});
