const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];
const db = new Sequelize(config.database, config.username, config.password, config);
const User = db.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING(255), allowNull: false }
}, { tableName: 'users', underscored: true, defaultScope: { attributes: { exclude: ['password_hash'] } }, scopes: { withPassword: { attributes: { include: ['password_hash'] } } } });
module.exports = { db, User };
