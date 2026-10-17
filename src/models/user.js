module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    role: { type: DataTypes.ENUM('student', 'teacher', 'administrator'), allowNull: false },
    group_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, { tableName: 'users', underscored: true,
    validate: { roleGroup() {
      const hasGroup = this.group_id !== null && this.group_id !== undefined;
      if ((this.role === 'student') !== hasGroup) throw new Error('Solo los estudiantes deben tener exactamente un grupo');
    } } });
  User.associate = (models) => {
    User.belongsTo(models.Group, { as: 'group', foreignKey: 'group_id' });
  };
  return User;
};
