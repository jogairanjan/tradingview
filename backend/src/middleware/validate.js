const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Runs express-validator chains and returns 422 on failure.
 */
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError('Validation failed', 422, errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })))
    );
  }
  return next();
};

module.exports = validate;
