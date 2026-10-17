const { Router } = require('express');
const router = Router();

const UserController = require('../controllers/UserController');
router.get('/users', UserController.index);
router.get('/users/:id', UserController.show);

const GroupController = require('../controllers/GroupController');
router.get('/groups', GroupController.index);
router.get('/groups/:id', GroupController.show);

const CourseController = require('../controllers/CourseController');
router.get('/courses', CourseController.index);
router.get('/courses/:id', CourseController.show);

const RoboticsKitController = require('../controllers/RoboticsKitController');
router.get('/robotics-kits', RoboticsKitController.index);
router.get('/robotics-kits/:id', RoboticsKitController.show);

const DidacticMaterialController = require('../controllers/DidacticMaterialController');
router.get('/didactic-materials', DidacticMaterialController.index);
router.get('/didactic-materials/:id', DidacticMaterialController.show);

const GroupCourseController = require('../controllers/GroupCourseController');
router.get('/group-courses', GroupCourseController.index);
router.get('/group-courses/:groupId/:courseId', GroupCourseController.show);

module.exports = router;
