const router  = require('express').Router({ mergeParams: true }); // inherit :studentId
const ctrl    = require('../controllers/marks.controller');
const { createMarkRules } = require('../validators/student.validator');
const { validate }        = require('../middleware/errorHandler');
const { param }           = require('express-validator');

const idRule = param('studentId').isInt({ gt: 0 }).withMessage('Student ID must be a positive integer');

// GET  /students/:studentId/marks
router.get('/',    [idRule], validate, ctrl.getMarksByStudent);

// POST /students/:studentId/marks
router.post('/',   [idRule, ...createMarkRules], validate, ctrl.addMark);

// PUT  /students/:studentId/marks/:markId
router.put('/:markId',
  [idRule, param('markId').isInt({ gt: 0 })],
  validate,
  ctrl.updateMark,
);

// DELETE /students/:studentId/marks/:markId
router.delete('/:markId',
  [idRule, param('markId').isInt({ gt: 0 })],
  validate,
  ctrl.deleteMark,
);

module.exports = router;
