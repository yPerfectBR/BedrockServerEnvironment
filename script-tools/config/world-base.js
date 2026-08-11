const fs = require("node:fs");
const path = require("node:path");
const { syncAddonToBedrockServer } = require("./addon-sync");
const { setEnvValue } = require("./env-file");
const { copyDirectory, ensureDirectory, listDirectories, renameDirectory } = require("./file-utils");
const { askUniqueName } = require("./names");
const { projectRoot, worldBasesRoot, worldsRoot } = require("./paths");
const { writeCurrentAddonPackReferences } = require("./world-pack-references");

const ENV_PATH = path.join(projectRoot, ".env");
const WORLD_BASES_FOLDER = "world-bases";

async function configureWorldBase(prompt) {
  ensureDirectory(worldsRoot);

  const worlds = getWorlds();
  const baseWorlds = listDirectories(worldBasesRoot);
  const menuOptions = [];

  if (worlds.length > 0) {
    menuOptions.push({ label: "Tornar um mundo existente o padrao", value: "existing" });
  }

  if (baseWorlds.length > 0) {
    menuOptions.push({ label: "Criar mundo a partir de uma base", value: "base" });
  }

  menuOptions.push({ label: "Cancelar", value: "cancel" });

  const action = await prompt.select("Configuracao de mundo", menuOptions);

  if (action === "existing") {
    await selectExistingWorld(prompt, worlds);
    return;
  }

  if (action === "base") {
    await createWorldFromBase(prompt, baseWorlds);
  }
}

function getWorlds() {
  return listDirectories(worldsRoot).filter((worldName) => worldName !== WORLD_BASES_FOLDER);
}

async function selectExistingWorld(prompt, worlds) {
  const selectedFolder = await prompt.select(
    "Escolha o mundo que sera usado pelo Docker",
    worlds.map((worldName) => ({ label: describeWorld(worldName), value: worldName })),
  );

  const selectedPath = path.join(worldsRoot, selectedFolder);
  const levelName = readLevelName(selectedPath) || selectedFolder;
  let finalName = selectedFolder;
  let finalPath = selectedPath;

  if (selectedFolder !== levelName) {
    console.log("");
    console.log(`A pasta do mundo e o levelname estao diferentes:`);
    console.log(`  Pasta: ${selectedFolder}`);
    console.log(`  Levelname: ${levelName}`);
    console.log("Para usar como padrao, eles precisam ficar com o mesmo nome.");

    const newName = await askUniqueName(
      prompt,
      "Digite o nome unico que sera usado na pasta e no levelname",
      getWorlds().filter((worldName) => worldName !== selectedFolder),
      selectedFolder,
    );

    finalName = newName;
    finalPath = path.join(worldsRoot, finalName);

    if (finalPath !== selectedPath) {
      renameDirectory(selectedPath, finalPath);
    }

    writeLevelName(finalPath, finalName);
  }

  syncAddonToBedrockServer();
  writeCurrentAddonPackReferences(finalPath);
  setDefaultWorld(finalName);
  console.log(`Mundo padrao configurado: ${finalName}`);
}

async function createWorldFromBase(prompt, baseWorlds) {
  const selectedBase = await prompt.select(
    "Escolha o mundo base",
    baseWorlds.map((worldName) => ({ label: describeBaseWorld(worldName), value: worldName })),
  );
  const worldName = await askUniqueName(prompt, "Digite o nome do novo mundo", getWorlds(), selectedBase);
  const sourcePath = path.join(worldBasesRoot, selectedBase);
  const targetPath = path.join(worldsRoot, worldName);

  copyDirectory(sourcePath, targetPath);
  writeLevelName(targetPath, worldName);
  syncAddonToBedrockServer();
  writeCurrentAddonPackReferences(targetPath);
  setDefaultWorld(worldName);

  console.log(`Mundo criado a partir de ${selectedBase}: ${worldName}`);
  console.log(`Mundo padrao configurado: ${worldName}`);
}

function describeWorld(worldName) {
  const levelName = readLevelName(path.join(worldsRoot, worldName));

  if (!levelName || levelName === worldName) {
    return worldName;
  }

  return `${worldName} (levelname: ${levelName})`;
}

function describeBaseWorld(worldName) {
  const levelName = readLevelName(path.join(worldBasesRoot, worldName));

  if (!levelName || levelName === worldName) {
    return worldName;
  }

  return `${worldName} (levelname: ${levelName})`;
}

function readLevelName(worldPath) {
  const levelNamePath = path.join(worldPath, "levelname.txt");

  if (!fs.existsSync(levelNamePath)) {
    return null;
  }

  return fs.readFileSync(levelNamePath, "utf8").trim();
}

function writeLevelName(worldPath, levelName) {
  fs.writeFileSync(path.join(worldPath, "levelname.txt"), `${levelName}\n`, "utf8");
}

function setDefaultWorld(worldName) {
  setEnvValue(ENV_PATH, "BEDROCK_LEVEL_NAME", worldName);
}

module.exports = { configureWorldBase };
