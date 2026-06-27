const { validationResult } = require('express-validator');

/**
 * Middleware: runs express-validator checks and returns 422 if any fail.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

/**
 * Global error handler — must be registered LAST in Express.
 */
function errorHandler(err, req, res, _next) {
  console.error('[Error]', err);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'A record with this value already exists.' });
  }

  // MySQL FK violation
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referenced resource not found.' });
  }

  const status  = err.status  || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, message });
}

/**
 * 404 handler — place before errorHandler.
 */
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
}

module.exports = { validate, errorHandler, notFound };
