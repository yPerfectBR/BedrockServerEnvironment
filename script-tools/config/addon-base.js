const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { syncAddonToBedrockServer } = require("./addon-sync");
const { setEnvValue } = require("./env-file");
const { listDirectories, readJson, renameDirectory, writeJson } = require("./file-utils");
const { askValidName } = require("./names");
const { projectRoot } = require("./paths");
const { updateAllWorldPackReferences } = require("./world-pack-references");

const ADDON_PACK_ROOTS = [
  path.join(projectRoot, "development", "behavior_packs"),
  path.join(projectRoot, "development", "resource_packs"),
];

const DEVELOPMENT_ENV_PATH = path.join(projectRoot, "development", ".env");
async function configureAddonBase(prompt) {
  const currentName = findCurrentAddonName() || "dataServer";
  const addonName = await askValidName(prompt, "Digite o nome do addon base", currentName);

  renameAddonFolders(currentName, addonName);
  updateAddonManifests(addonName, null);
  setEnvValue(DEVELOPMENT_ENV_PATH, "PROJECT_NAME", JSON.stringify(addonName));

  if (await prompt.confirm("Deseja regenerar todos os UUIDs do addon?", true)) {
    const uuids = createAddonUuids();
    updateAddonManifests(addonName, uuids);
    updateAllWorldPackReferences();
    console.log("UUIDs regenerados mantendo a dependencia entre Behavior Pack e Resource Pack.");
  }

  syncAddonToBedrockServer();
  console.log(`Addon base configurado: ${addonName}`);
}

function findCurrentAddonName() {
  for (const root of ADDON_PACK_ROOTS) {
    const names = listDirectories(root);

    if (names.length > 0) {
      return names[0];
    }
  }

  return null;
}

function renameAddonFolders(currentName, addonName) {
  for (const root of ADDON_PACK_ROOTS) {
    const currentPath = path.join(root, currentName);
    const nextPath = path.join(root, addonName);

    if (!fs.existsSync(currentPath) || currentPath === nextPath) {
      continue;
    }

    if (fs.existsSync(nextPath)) {
      throw new Error(`Nao foi possivel renomear. A pasta ja existe: ${nextPath}`);
    }

    renameDirectory(currentPath, nextPath);
  }
}

function updateAddonManifests(addonName, uuids) {
  const behaviorManifests = [
    path.join(projectRoot, "development", "behavior_packs", addonName, "manifest.json"),
  ];
  const resourceManifests = [
    path.join(projectRoot, "development", "resource_packs", addonName, "manifest.json"),
  ];

  for (const manifestPath of behaviorManifests) {
    updateBehaviorManifest(manifestPath, addonName, uuids);
  }

  for (const manifestPath of resourceManifests) {
    updateResourceManifest(manifestPath, addonName, uuids);
  }
}

function updateBehaviorManifest(manifestPath, addonName, uuids) {
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  const manifest = readJson(manifestPath);
  manifest.header.name = addonName;

  if (uuids) {
    manifest.header.uuid = uuids.behaviorHeader;

    if (manifest.modules?.[0]) {
      manifest.modules[0].uuid = uuids.behaviorModule;
    }

    const resourceDependency = manifest.dependencies?.find((dependency) => dependency.uuid);

    if (resourceDependency) {
      resourceDependency.uuid = uuids.resourceHeader;
    }
  }

  writeJson(manifestPath, manifest);
}

function updateResourceManifest(manifestPath, addonName, uuids) {
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  const manifest = readJson(manifestPath);
  manifest.header.name = addonName;

  if (uuids) {
    manifest.header.uuid = uuids.resourceHeader;

    if (manifest.modules?.[0]) {
      manifest.modules[0].uuid = uuids.resourceModule;
    }

    const behaviorDependency = manifest.dependencies?.find((dependency) => dependency.uuid);

    if (behaviorDependency) {
      behaviorDependency.uuid = uuids.behaviorHeader;
    }
  }

  writeJson(manifestPath, manifest);
}

function createAddonUuids() {
  return {
    behaviorHeader: crypto.randomUUID(),
    behaviorModule: crypto.randomUUID(),
    resourceHeader: crypto.randomUUID(),
    resourceModule: crypto.randomUUID(),
  };
}

module.exports = { configureAddonBase };
