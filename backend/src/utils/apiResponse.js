/**
 * Standardized API response helpers for consistent client handling.
 */

const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

const created = (res, data = null, message = 'Created successfully') =>
  success(res, data, message, 201);

const paginated = (res, { rows, count, page, limit }, message = 'Success') =>
  res.status(200).json({
    success: true,
    message,
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit) || 1,
    },
  });

const error = (res, message = 'An error occurred', statusCode = 500, errors = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });

module.exports = { success, created, paginated, error };
