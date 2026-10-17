module.exports = (sequelize, DataTypes) => {
  const DidacticMaterial = sequelize.define('DidacticMaterial', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    file_url: { type: DataTypes.STRING(255), allowNull: false }
  }, { tableName: 'didactic_materials', underscored: true });
  DidacticMaterial.associate = (models) => {
    DidacticMaterial.hasOne(models.Course, { as: 'course', foreignKey: 'didactic_material_id' });
  };
  return DidacticMaterial;
};
