const crypto = require("crypto");

let bcrypt = null;
try {
  bcrypt = require("bcryptjs");
} catch (_) {
  bcrypt = null;
}

async function hashPassword(password) {
  if (bcrypt) {
    return bcrypt.hash(password, 12);
  }

  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString("hex")}`);
    });
  });
}

async function comparePassword(password, hash) {
  if (!hash) return false;

  // bcryptjs hashes ($2b$ ou $2a$)
  if (hash.startsWith("$2b$") || hash.startsWith("$2a$")) {
    if (bcrypt) return bcrypt.compare(password, hash);
    return false;
  }

  // Fallback scrypt maison (format: scrypt$salt$hex)
  if (hash.startsWith("scrypt$")) {
    const [, salt, stored] = hash.split("$");
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(crypto.timingSafeEqual(Buffer.from(stored, "hex"), derivedKey));
      });
    });
  }

  return false;
}

module.exports = { hashPassword, comparePassword };
