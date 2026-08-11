const path = require("node:path");

const scriptToolsRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(scriptToolsRoot, "..");
const bedrockServerRoot = path.join(projectRoot, "bedrockServer");
const worldsRoot = path.join(bedrockServerRoot, "worlds");
const worldBasesRoot = path.join(worldsRoot, "world-bases");

module.exports = {
  bedrockServerRoot,
  projectRoot,
  scriptToolsRoot,
  worldBasesRoot,
  worldsRoot,
};
