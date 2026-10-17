module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true }
  }, { tableName: 'groups', underscored: true });
  Group.associate = (models) => {
    Group.hasMany(models.User, { as: 'students', foreignKey: 'group_id', scope: { role: 'student' } });
    Group.hasMany(models.GroupCourse, { as: 'assignments', foreignKey: 'group_id' });
    Group.belongsToMany(models.Course, { as: 'courses', through: models.GroupCourse, foreignKey: 'group_id', otherKey: 'course_id' });
  };
  return Group;
};
