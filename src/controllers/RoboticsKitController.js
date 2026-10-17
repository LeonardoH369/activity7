const { RoboticsKit } = require('../models');
const parseId = require('../utils/parseId');
const include = [{ association: 'courses' }];

exports.index = async (req, res) => {
  res.json(await RoboticsKit.findAll({ include, order: [['id', 'ASC']] }));
};

exports.show = async (req, res) => {
  const item = await RoboticsKit.findOne({ where: { id: parseId(req.params.id) }, include });
  if (!item) return res.status(404).json({ message: 'Registro no encontrado' });
  return res.json(item);
};
