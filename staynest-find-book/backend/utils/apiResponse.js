// Success response
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Error response
const errorResponse = (res, statusCode = 400, message = 'Error', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.message || error : null,
  });
};

// Paginated response
const paginatedResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };