const path = require("path");
const crypto = require("crypto");
const { readJson, writeJson } = require("../../utils/file-store");

const USERS_FILE = path.resolve(__dirname, "../../data/users.json");
const TOKENS_FILE = path.resolve(__dirname, "../../data/refresh-tokens.json");

async function findUserByEmail(email) {
  const users = await readJson(USERS_FILE, []);
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findUserById(id) {
  const users = await readJson(USERS_FILE, []);
  return users.find((user) => user.id === id) || null;
}

async function createUser(payload) {
  const users = await readJson(USERS_FILE, []);
  const user = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  };
  users.push(user);
  await writeJson(USERS_FILE, users);
  return user;
}

async function saveRefreshToken(payload) {
  const tokens = await readJson(TOKENS_FILE, []);
  tokens.push(payload);
  await writeJson(TOKENS_FILE, tokens);
  return payload;
}

async function findRefreshToken(token) {
  const tokens = await readJson(TOKENS_FILE, []);
  return tokens.find((item) => item.token === token) || null;
}

async function revokeRefreshToken(token) {
  const tokens = await readJson(TOKENS_FILE, []);
  const filtered = tokens.filter((item) => item.token !== token);
  await writeJson(TOKENS_FILE, filtered);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
};
