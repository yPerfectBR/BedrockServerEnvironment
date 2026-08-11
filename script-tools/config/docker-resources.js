const path = require("node:path");
const { readEnvFile, setEnvValue } = require("./env-file");
const { projectRoot } = require("./paths");

const ENV_PATH = path.join(projectRoot, ".env");

const SERVICES = [
  {
    label: "Bedrock Server",
    cpuKey: "BEDROCK_CPUS",
    memoryKey: "BEDROCK_MEMORY",
    defaultCpus: "2",
    defaultMemory: "3g",
  },
  {
    label: "API",
    cpuKey: "API_CPUS",
    memoryKey: "API_MEMORY",
    defaultCpus: "0.5",
    defaultMemory: "512m",
  },
  {
    label: "MongoDB",
    cpuKey: "MONGODB_CPUS",
    memoryKey: "MONGODB_MEMORY",
    defaultCpus: "0.75",
    defaultMemory: "1g",
  },
];

async function configureDockerResources(prompt) {
  const env = parseEnv(readEnvFile(ENV_PATH));

  console.log("");
  console.log("Configure limites de CPU e RAM usados pelo Docker Compose.");
  console.log("Exemplos: CPU 2, 1.5, 0.5 | RAM 512m, 1g, 3g");

  const target = await prompt.select("Qual servico deseja ajustar", [
    { label: "Todos", value: "all" },
    ...SERVICES.map((service) => ({ label: service.label, value: service.cpuKey })),
  ]);

  const selectedServices = target === "all" ? SERVICES : SERVICES.filter((service) => service.cpuKey === target);

  for (const service of selectedServices) {
    const currentCpus = env[service.cpuKey] || service.defaultCpus;
    const currentMemory = env[service.memoryKey] || service.defaultMemory;

    const cpus = await askCpus(prompt, `${service.label} - limite de CPU`, currentCpus);
    const memory = await askMemory(prompt, `${service.label} - limite de RAM`, currentMemory);

    setEnvValue(ENV_PATH, service.cpuKey, cpus);
    setEnvValue(ENV_PATH, service.memoryKey, memory);

    console.log(`${service.label}: ${cpus} CPU(s), ${memory} RAM`);
  }

  console.log("");
  console.log("Limites salvos no .env. Reinicie os containers com ./start.sh ou .\\start.ps1 para aplicar.");
}

async function askCpus(prompt, question, defaultValue) {
  while (true) {
    const value = await prompt.ask(question, defaultValue);
    const error = validateCpus(value);

    if (!error) {
      return normalizeDecimal(value);
    }

    console.log(error);
  }
}

async function askMemory(prompt, question, defaultValue) {
  while (true) {
    const value = await prompt.ask(question, defaultValue);
    const error = validateMemory(value);

    if (!error) {
      return value.toLowerCase();
    }

    console.log(error);
  }
}

function validateCpus(value) {
  if (!/^\d+([.,]\d+)?$/.test(value)) {
    return "CPU precisa ser um numero positivo. Exemplos: 2, 1.5, 0.5";
  }

  const numericValue = Number.parseFloat(normalizeDecimal(value));
  if (numericValue <= 0) {
    return "CPU precisa ser maior que zero.";
  }

  return null;
}

function validateMemory(value) {
  if (!/^\d+([kmg])?$/i.test(value)) {
    return "RAM precisa usar formato como 512m, 1g ou 3072m.";
  }

  const numericValue = Number.parseInt(value, 10);
  if (numericValue <= 0) {
    return "RAM precisa ser maior que zero.";
  }

  return null;
}

function normalizeDecimal(value) {
  return value.replace(",", ".");
}

function parseEnv(content) {
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (match) {
      values[match[1]] = match[2].trim();
    }
  }

  return values;
}

module.exports = { configureDockerResources };
