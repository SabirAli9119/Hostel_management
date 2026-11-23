const AppError = require('../utils/AppError');

const notFound = (req, res, next) => next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = err.errors;

  if (err.name === 'ValidationError' && err.errors && !err.isOperational) {
    status = 400;
    message = 'Please correct the highlighted fields.';
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'An invalid value was supplied.';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const text = { username: 'That username is already taken', roomNumber: 'A room with this number already exists' }[field] || 'That value already exists';
    message = text;
    errors = field ? { [field]: text } : undefined;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Your session has expired. Please sign in again.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body is not valid JSON.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'The request body is too large.';
  }

  if (status >= 500) {
    console.error(err);
    if (!err.isOperational) message = 'Something went wrong on the server.';
  }

  res.status(status).json({ message, ...(errors ? { errors } : {}) });
};

module.exports = { notFound, errorHandler };
