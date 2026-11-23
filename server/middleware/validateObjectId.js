const AppError = require('../utils/AppError');
const { isObjectId } = require('../utils/validators');

// validateObjectId('id') rejects malformed ids before they reach a query.
module.exports = (...names) => (req, res, next) => {
  for (const name of names) {
    if (!isObjectId(req.params[name])) return next(new AppError(404, 'Not found.'));
  }
  return next();
};
