const { Course } = require('../models');
const parseId = require('../utils/parseId');
const include = [{ association: 'kit' }, { association: 'material' }, { association: 'groups', through: { attributes: [] } }];

exports.index = async (req, res) => {
  res.json(await Course.findAll({ include, order: [['id', 'ASC']] }));
};

exports.show = async (req, res) => {
  const item = await Course.findOne({ where: { id: parseId(req.params.id) }, include });
  if (!item) return res.status(404).json({ message: 'Registro no encontrado' });
  return res.json(item);
};
