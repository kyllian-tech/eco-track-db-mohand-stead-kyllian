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
  if (bcrypt) {
    return bcrypt.compare(password, hash);
  }

  if (!hash || !hash.startsWith("scrypt$")) return false;
  const [, salt, stored] = hash.split("$");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(Buffer.from(stored, "hex"), derivedKey));
    });
  });
}

module.exports = { hashPassword, comparePassword };
