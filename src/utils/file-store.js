const fs = require("fs/promises");
const path = require("path");

async function ensureFile(filePath, fallback = []) {
  try {
    await fs.access(filePath);
  } catch (_) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
  }
}

async function readJson(filePath, fallback = []) {
  await ensureFile(filePath, fallback);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content || JSON.stringify(fallback));
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

module.exports = { ensureFile, readJson, writeJson };
