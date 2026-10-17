const { GroupCourse } = require('../models');
const parseId = require('../utils/parseId');
const include = [{ association: 'group' }, { association: 'course' }];

exports.index = async (req, res) => {
  res.json(await GroupCourse.findAll({ include, order: [['group_id', 'ASC'], ['course_id', 'ASC']] }));
};

exports.show = async (req, res) => {
  const item = await GroupCourse.findOne({ where: { group_id: parseId(req.params.groupId), course_id: parseId(req.params.courseId) }, include });
  if (!item) return res.status(404).json({ message: 'Registro no encontrado' });
  return res.json(item);
};
