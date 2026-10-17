const { Group } = require('../models');
const parseId = require('../utils/parseId');
const include = [{ association: 'courses', through: { attributes: [] } }, { association: 'students' }];

exports.index = async (req, res) => {
  res.json(await Group.findAll({ include, order: [['id', 'ASC']] }));
};

exports.show = async (req, res) => {
  const item = await Group.findOne({ where: { id: parseId(req.params.id) }, include });
  if (!item) return res.status(404).json({ message: 'Registro no encontrado' });
  return res.json(item);
};
