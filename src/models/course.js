module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    cover_url: { type: DataTypes.STRING(255), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    robotics_kit_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    didactic_material_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true }
  }, { tableName: 'courses', underscored: true });
  Course.associate = (models) => {
    Course.belongsTo(models.RoboticsKit, { as: 'kit', foreignKey: 'robotics_kit_id' });
    Course.belongsTo(models.DidacticMaterial, { as: 'material', foreignKey: 'didactic_material_id' });
    Course.hasMany(models.GroupCourse, { as: 'assignments', foreignKey: 'course_id' });
    Course.belongsToMany(models.Group, { as: 'groups', through: models.GroupCourse, foreignKey: 'course_id', otherKey: 'group_id' });
  };
  return Course;
};
