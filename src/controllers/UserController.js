const { User } = require('../models');
const parseId = require('../utils/parseId');
const include = [{ association: 'group' }];

exports.index = async (req, res) => {
  res.json(await User.findAll({ include, order: [['id', 'ASC']] }));
};

exports.show = async (req, res) => {
  const item = await User.findOne({ where: { id: parseId(req.params.id) }, include });
  if (!item) return res.status(404).json({ message: 'Registro no encontrado' });
  return res.json(item);
};
