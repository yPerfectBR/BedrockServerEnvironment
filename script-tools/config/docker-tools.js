const { spawnSync } = require("node:child_process");
const { projectRoot } = require("./paths");

const DEFAULT_SERVICES = ["mongodb", "api", "bedrock-server"];

async function openDockerTools(prompt) {
  while (true) {
    const action = await prompt.select("Docker", [
      { label: "Abrir terminal de um container", value: "shell" },
      { label: "Ver logs de containers", value: "logs" },
      { label: "Voltar", value: "back" },
    ]);

    if (action === "back") {
      return;
    }

    ensureDockerCompose();

    if (action === "shell") {
      await openContainerShell(prompt);
    }

    if (action === "logs") {
      await showContainerLogs(prompt);
    }
  }
}

async function openContainerShell(prompt) {
  ensureInteractiveInput();

  const service = await selectService(prompt, "Escolha o container");
  const shell = await prompt.select("Shell/comando", [
    { label: "Shell padrao (sh)", value: "sh" },
    { label: "Bash", value: "bash" },
    { label: "MongoDB shell (mongosh)", value: "mongosh" },
  ]);

  console.log("");
  console.log(`Abrindo terminal em ${service}. Use exit para voltar ao menu.`);

  prompt.suspend();
  try {
    runComposeInteractive(["exec", service, shell]);
  } finally {
    prompt.resume();
  }
}

async function showContainerLogs(prompt) {
  const services = await selectServices(prompt, "Escolha os containers para logs");
  const follow = await prompt.confirm("Acompanhar logs em tempo real", true);
  const tail = await prompt.ask("Quantas linhas recentes carregar", "120");
  const normalizedTail = /^\d+$/.test(tail) ? tail : "120";

  const args = ["logs", `--tail=${normalizedTail}`];
  if (follow) {
    ensureInteractiveInput();
    args.push("-f");
  }

  args.push(...services);

  console.log("");
  console.log(`Mostrando logs de: ${services.join(", ")}`);
  if (follow) {
    console.log("Pressione Ctrl+C para sair dos logs e voltar ao terminal.");
  }

  prompt.suspend();
  try {
    runComposeInteractive(args);
  } finally {
    prompt.resume();
  }
}

async function selectService(prompt, question) {
  const services = getComposeServices();
  return prompt.select(
    question,
    services.map((service) => ({ label: service, value: service }))
  );
}

async function selectServices(prompt, question) {
  const services = getComposeServices();

  console.log("");
  console.log(question);
  console.log("  0. Todos");
  services.forEach((service, index) => {
    console.log(`  ${index + 1}. ${service}`);
  });

  while (true) {
    const answer = await prompt.ask("Escolha uma ou mais opcoes separadas por virgula", "0");
    const selected = parseServiceSelection(answer, services);

    if (selected.length > 0) {
      return selected;
    }

    console.log("Opcao invalida. Exemplo: 1,3 ou 0 para todos.");
  }
}

function parseServiceSelection(answer, services) {
  const values = answer
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.includes("0") || values.some((value) => value.toLowerCase() === "todos")) {
    return services;
  }

  const selected = [];
  for (const value of values) {
    const index = Number.parseInt(value, 10) - 1;
    if (!Number.isInteger(index) || !services[index]) {
      return [];
    }

    if (!selected.includes(services[index])) {
      selected.push(services[index]);
    }
  }

  return selected;
}

function getComposeServices() {
  const result = runCompose(["config", "--services"], { capture: true, allowFailure: true });

  if (result.status !== 0) {
    return DEFAULT_SERVICES;
  }

  const services = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return services.length > 0 ? services : DEFAULT_SERVICES;
}

function ensureDockerCompose() {
  const result = runCompose(["version"], { capture: true, allowFailure: true });
  if (result.status !== 0) {
    throw new Error("Docker Compose nao foi encontrado ou nao esta acessivel.");
  }
}

function ensureInteractiveInput() {
  if (!process.stdin.isTTY) {
    throw new Error("Esta opcao precisa de um terminal interativo.");
  }
}

function runComposeInteractive(args) {
  const result = runCompose(args, { stdio: "inherit", allowFailure: true });
  if (result.status !== 0) {
    console.log("");
    console.log("Comando Docker finalizado com erro.");
  }
}

function runCompose(args, options = {}) {
  const dockerComposeArgs = ["compose", ...args];
  const dockerResult = spawnSync("docker", dockerComposeArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: options.stdio || (options.capture ? "pipe" : "inherit"),
  });

  if (!dockerResult.error && dockerResult.status === 0) {
    return dockerResult;
  }

  const legacyResult = spawnSync("docker-compose", args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: options.stdio || (options.capture ? "pipe" : "inherit"),
  });

  if (!options.allowFailure && legacyResult.status !== 0) {
    throw new Error("Comando Docker Compose falhou.");
  }

  return legacyResult.error ? dockerResult : legacyResult;
}

module.exports = { openDockerTools };
