const { Sequelize } = require('sequelize');
const config = require('./cli').development;
module.exports = new Sequelize(config.database, config.username, config.password, config);
