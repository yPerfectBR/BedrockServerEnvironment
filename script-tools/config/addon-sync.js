const fs = require("node:fs");
const path = require("node:path");
const { copyDirectory, ensureDirectory, listDirectories } = require("./file-utils");
const { bedrockServerRoot, projectRoot } = require("./paths");

const developmentRoot = path.join(projectRoot, "development");
const distScriptsRoot = path.join(developmentRoot, "dist", "scripts");

const PACK_PAIRS = [
  {
    source: path.join(developmentRoot, "behavior_packs"),
    target: path.join(bedrockServerRoot, "development_behavior_packs"),
    copyScripts: true,
  },
  {
    source: path.join(developmentRoot, "resource_packs"),
    target: path.join(bedrockServerRoot, "development_resource_packs"),
  },
];

function syncAddonToBedrockServer() {
  for (const pair of PACK_PAIRS) {
    ensureDirectory(pair.target);
    clearDirectory(pair.target);

    for (const packName of listDirectories(pair.source)) {
      const targetPackPath = path.join(pair.target, packName);

      copyDirectory(path.join(pair.source, packName), targetPackPath);

      if (pair.copyScripts && fs.existsSync(distScriptsRoot)) {
        copyDirectory(distScriptsRoot, path.join(targetPackPath, "scripts"));
      }
    }
  }
}

function clearDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const entry of fs.readdirSync(dirPath)) {
    fs.rmSync(path.join(dirPath, entry), { recursive: true, force: true });
  }
}

module.exports = { syncAddonToBedrockServer };
