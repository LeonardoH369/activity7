const { Faker, en } = require('@faker-js/faker');
function courseFactory(seed = 6) {
  const faker = new Faker({ locale: [en] });
  faker.seed(seed);
  return (index, kitIds, materialId) => ({
    code: `HW6-${String(index).padStart(3, '0')}`,
    title: `${faker.helpers.arrayElement(['Robotics', 'Automation', 'Sensors', 'Robot programming'])}: ${faker.lorem.words(4)}`.slice(0, 150),
    cover_url: '/assets/course-cover.svg',
    content: faker.lorem.paragraphs(2),
    robotics_kit_id: faker.helpers.arrayElement(kitIds),
    didactic_material_id: materialId,
  });
}
module.exports = { courseFactory };
