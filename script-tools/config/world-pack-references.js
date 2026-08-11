const fs = require("node:fs");
const path = require("node:path");
const { listDirectories, readJson, writeJson } = require("./file-utils");
const { bedrockServerRoot, projectRoot } = require("./paths");

const WORLD_BASES_FOLDER = "world-bases";
const PACK_FILES = {
  behavior: "world_behavior_packs.json",
  resource: "world_resource_packs.json",
};

function writeCurrentAddonPackReferences(worldPath) {
  const references = getCurrentAddonPackReferences();
  writeWorldPackReference(path.join(worldPath, PACK_FILES.behavior), references.behavior);
  writeWorldPackReference(path.join(worldPath, PACK_FILES.resource), references.resource);
}

function updateAllWorldPackReferences() {
  const worldsRoot = path.join(bedrockServerRoot, "worlds");
  const worlds = listDirectories(worldsRoot).filter((worldName) => worldName !== WORLD_BASES_FOLDER);

  for (const worldName of worlds) {
    writeCurrentAddonPackReferences(path.join(worldsRoot, worldName));
  }
}

function getCurrentAddonPackReferences() {
  const behaviorManifest = readSinglePackManifest(path.join(projectRoot, "development", "behavior_packs"));
  const resourceManifest = readSinglePackManifest(path.join(projectRoot, "development", "resource_packs"));

  return {
    behavior: getPackReference(behaviorManifest, "Behavior Pack"),
    resource: getPackReference(resourceManifest, "Resource Pack"),
  };
}

function readSinglePackManifest(packsRoot) {
  const packNames = listDirectories(packsRoot);

  if (packNames.length === 0) {
    throw new Error(`Nenhum pack encontrado em ${packsRoot}`);
  }

  if (packNames.length > 1) {
    throw new Error(`Mais de um pack encontrado em ${packsRoot}. Deixe apenas o addon fonte nessa pasta.`);
  }

  const manifestPath = path.join(packsRoot, packNames[0], "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest nao encontrado: ${manifestPath}`);
  }

  return readJson(manifestPath);
}

function getPackReference(manifest, packLabel) {
  const uuid = manifest.header?.uuid;
  const version = manifest.header?.version;

  if (!uuid || !Array.isArray(version)) {
    throw new Error(`${packLabel} precisa ter header.uuid e header.version no manifest.`);
  }

  return {
    pack_id: uuid,
    version,
  };
}

function writeWorldPackReference(filePath, reference) {
  writeJson(filePath, [reference]);
}

module.exports = {
  updateAllWorldPackReferences,
  writeCurrentAddonPackReferences,
};
