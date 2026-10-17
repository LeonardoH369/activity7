module.exports = (sequelize, DataTypes) => {
  const GroupCourse = sequelize.define('GroupCourse', {
    group_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true }
  }, { tableName: 'group_courses', underscored: true });
  GroupCourse.associate = (models) => {
    GroupCourse.belongsTo(models.Group, { as: 'group', foreignKey: 'group_id' });
    GroupCourse.belongsTo(models.Course, { as: 'course', foreignKey: 'course_id' });
  };
  return GroupCourse;
};
