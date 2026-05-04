const { ForbiddenError } = require("../utils/errors");

function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError("Missing authenticated user"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    return next();
  };
}

module.exports = { authorize };
