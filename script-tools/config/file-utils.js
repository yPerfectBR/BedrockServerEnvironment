const fs = require("node:fs");
const path = require("node:path");

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function listDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function copyDirectory(source, target) {
  fs.cpSync(source, target, {
    recursive: true,
    errorOnExist: true,
    force: false,
    verbatimSymlinks: true,
  });
}

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

function writeJson(jsonPath, value) {
  fs.writeFileSync(jsonPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function renameDirectory(source, target) {
  ensureDirectory(path.dirname(target));
  fs.renameSync(source, target);
}

module.exports = {
  copyDirectory,
  ensureDirectory,
  listDirectories,
  readJson,
  renameDirectory,
  writeJson,
};
