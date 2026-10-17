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
  const courses = await Course.findAll({ where: { code: ['Rob101', 'Rob102', 'Rob103', 'Rob104'] }, include: ['kit', 'material'], order: [['code', 'ASC']] });
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
  assert.equal(group.students.length, 2);
  assert.equal(group.students[0].role, 'student');
  assert.equal(group.courses.length, 2);
  const course = await Course.findByPk(3, { include: ['groups'] });
  assert.deepEqual(course.groups.map((x) => x.name).sort(), ['advanced', 'intermediate']);
  const kit = await RoboticsKit.findByPk(1, { include: ['courses'] });
  assert.ok(['Rob101', 'Rob102'].every(code => kit.courses.some(x => x.code === code)));
  const material = await DidacticMaterial.findByPk(1, { include: ['course'] });
  assert.equal(material.course.code, 'Rob101');
  const student = await User.findByPk(1, { include: ['group'] });
  assert.equal(student.group.name, 'beginner');
});

test('la base rechaza roles sin grupo válido y referencias inexistentes', async () => {
  const qi = sequelize.getQueryInterface();
  const insert = (role, group_id, suffix) => qi.bulkInsert('users', [{
    username: `schema-${suffix}`, password_hash: 'test-only', name: 'Prueba temporal', email: `schema-${suffix}@example.test`, role, group_id,
    created_at: new Date(), updated_at: new Date(),
  }], { transaction });
  await assert.rejects(insert('student', null, 'student'), /chk_users_role_group/i);
  await assert.rejects(insert('teacher', 1, 'teacher'), /chk_users_role_group/i);
  await assert.rejects(insert('student', 999999, 'fk'), /foreign key/i);
  const user = await User.create({ username: 'new-student', password_hash: 'test-only', name: 'Nuevo alumno', email: 'new@example.test', role: 'student', group_id: 1 }, { transaction });
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

test('Homework 6: usuarios, hashes y roles solicitados', async () => {
  const { verifyPassword } = require('../src/utils/password');
  const users = await User.unscoped().findAll({ where: { email: ['admon@robotics.com', 'tecmilenio@robotics.com', 'student@robotics.com'] }, order: [['id', 'ASC']] });
  assert.deepEqual(users.map(x => [x.username, x.role]), [['Admon', 'administrator'], ['Tecmilenio', 'teacher'], ['Student', 'student']]);
  assert.equal(users[2].group_id, 1);
  for (const user of users) {
    assert.ok(verifyPassword('Adm@2022', user.password_hash));
    assert.equal(verifyPassword('incorrect', user.password_hash), false);
  }
  assert.equal(new Set(users.map(x => x.password_hash)).size, 3);
  const group = await Group.findByPk(1, { include: ['students'] });
  assert.ok(group.students.every(x => !('password_hash' in x.toJSON())));
  assert.ok(!('password_hash' in (await User.findOne()).toJSON()));
});
test('Homework 6: 100 cursos con tipos, longitudes y materiales válidos', async () => {
  const codes = Array.from({ length: 100 }, (_, i) => `HW6-${String(i + 1).padStart(3, '0')}`);
  const courses = await Course.findAll({ where: { code: codes }, include: ['kit', 'material'] });
  assert.equal(courses.length, 100);
  assert.equal(await Course.count(), 104);
  assert.equal(new Set(courses.map(x => x.didactic_material_id)).size, 100);
  for (const course of courses) {
    for (const [field, max] of [['code', 20], ['title', 150], ['cover_url', 255]]) {
      assert.equal(typeof course[field], 'string');
      assert.ok(course[field].length > 0 && course[field].length <= max);
    }
    assert.ok(Buffer.byteLength(course.content) <= 65535 && course.content.length > 0);
    assert.ok(course.kit && course.material);
  }
});
test('Homework 6: repetir seeders no duplica registros', async () => {
  for (const file of ['users', 'kits', 'courses']) {
    const suffix = { users: '100', kits: '200', courses: '300' }[file];
    await require(`../src/seeders/20261018000${suffix}-homework6-${file}`).up(sequelize.getQueryInterface());
  }
  assert.equal(await User.count(), 8);
  assert.equal(await RoboticsKit.count(), 3);
  assert.equal(await Course.count(), 104);
  assert.equal(await DidacticMaterial.count(), 104);
});
