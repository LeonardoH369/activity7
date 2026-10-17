const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const models = {
  Group: require('./group')(sequelize, DataTypes),
  RoboticsKit: require('./roboticskit')(sequelize, DataTypes),
  DidacticMaterial: require('./didacticmaterial')(sequelize, DataTypes),
  User: require('./user')(sequelize, DataTypes),
  Course: require('./course')(sequelize, DataTypes),
  GroupCourse: require('./groupcourse')(sequelize, DataTypes)
};
for (const model of Object.values(models)) model.associate(models);
module.exports = { ...models, sequelize };
