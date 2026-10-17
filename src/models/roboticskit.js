module.exports = (sequelize, DataTypes) => {
  const RoboticsKit = sequelize.define('RoboticsKit', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true }
  }, { tableName: 'robotics_kits', underscored: true });
  RoboticsKit.associate = (models) => {
    RoboticsKit.hasMany(models.Course, { as: 'courses', foreignKey: 'robotics_kit_id' });
  };
  return RoboticsKit;
};
