const { verify } = require("../utils/jwt");
const { UnauthorizedError } = require("../utils/errors");

function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization header missing or invalid");
    }

    const token = header.split(" ")[1];
    req.user = verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { auth };
