const router = require('express').Router();
const ctrl   = require('../controllers/student.controller');
const {
  createStudentRules,
  updateStudentRules,
  paginationRules,
} = require('../validators/student.validator');
const { validate } = require('../middleware/errorHandler');
const { param }    = require('express-validator');

// GET  /students          – paginated list with optional search
router.get('/',  paginationRules, validate, ctrl.getAllStudents);

// GET  /students/:id      – single student with marks
router.get('/:id',
  [param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer')],
  validate,
  ctrl.getStudentById,
);

// POST /students
router.post('/',  createStudentRules, validate, ctrl.createStudent);

// PUT  /students/:id
router.put('/:id',  updateStudentRules, validate, ctrl.updateStudent);

// DELETE /students/:id
router.delete('/:id',
  [param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer')],
  validate,
  ctrl.deleteStudent,
);

module.exports = router;
