const { configureAddonBase } = require("./addon-base");
const { configureBedrockPorts } = require("./bedrock-ports");
const { configureWorldBase } = require("./world-base");
const { openDockerTools } = require("./docker-tools");
const { createPrompt } = require("./prompt");

async function main() {
  const prompt = createPrompt();

  try {
    while (true) {
      const action = await prompt.select("Ferramentas de configuracao", [
        { label: "Configurar addon base", value: "addon" },
        { label: "Configurar mundo base/padrao", value: "world" },
        { label: "Configurar portas do Bedrock Server", value: "ports" },
        { label: "Docker: terminal/logs", value: "docker" },
        { label: "Sair", value: "exit" },
      ]);

      if (action === "exit") {
        break;
      }

      if (action === "world") {
        await configureWorldBase(prompt);
      }

      if (action === "addon") {
        await configureAddonBase(prompt);
      }

      if (action === "ports") {
        await configureBedrockPorts(prompt);
      }

      if (action === "docker") {
        await openDockerTools(prompt);
      }
    }
  } finally {
    prompt.close();
  }
}

main().catch((error) => {
  console.error("");
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
});
