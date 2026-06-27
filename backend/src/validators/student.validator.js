const { body, param, query } = require('express-validator');

// ── Student validators ───────────────────────────────────────────
const createStudentRules = [
  body('first_name')
    .trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name must be ≤ 100 characters'),

  body('last_name')
    .trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }).withMessage('Last name must be ≤ 100 characters'),

  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone().withMessage('Must be a valid phone number'),

  body('date_of_birth')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('Must be a valid date (YYYY-MM-DD)')
    .custom((val) => {
      if (new Date(val) >= new Date()) throw new Error('Date of birth must be in the past');
      return true;
    }),

  body('gender')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 }).withMessage('Address must be ≤ 500 characters'),
];

const updateStudentRules = [
  param('id').isInt({ gt: 0 }).withMessage('Student ID must be a positive integer'),
  // All fields optional on update
  body('first_name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('last_name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().trim().isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).isMobilePhone(),
  body('date_of_birth')
    .optional({ nullable: true, checkFalsy: true })
    .isDate()
    .custom((val) => {
      if (val && new Date(val) >= new Date()) throw new Error('Date of birth must be in the past');
      return true;
    }),
  body('gender').optional({ nullable: true, checkFalsy: true }).isIn(['Male', 'Female', 'Other']),
  body('address').optional({ nullable: true, checkFalsy: true }).isLength({ max: 500 }),
];

// ── Marks validators ─────────────────────────────────────────────
const createMarkRules = [
  param('studentId').isInt({ gt: 0 }).withMessage('Student ID must be a positive integer'),

  body('subject_id')
    .notEmpty().withMessage('Subject ID is required')
    .isInt({ gt: 0 }).withMessage('Subject ID must be a positive integer'),

  body('marks')
    .notEmpty().withMessage('Marks are required')
    .isFloat({ min: 0, max: 100 }).withMessage('Marks must be between 0 and 100'),

  body('max_marks')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Max marks must be greater than 0'),

  body('exam_type')
    .optional()
    .isIn(['Midterm', 'Final', 'Quiz', 'Assignment'])
    .withMessage('Exam type must be Midterm, Final, Quiz, or Assignment'),

  body('exam_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('Exam date must be a valid date (YYYY-MM-DD)'),

  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 255 }),
];

// ── Pagination validator ─────────────────────────────────────────
const paginationRules = [
  query('page')
    .optional()
    .isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ gt: 0, lt: 101 }).withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional().trim().isLength({ max: 100 }),
];

module.exports = {
  createStudentRules,
  updateStudentRules,
  createMarkRules,
  paginationRules,
};
