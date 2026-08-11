const path = require("node:path");
const { readEnvFile, setEnvValue } = require("./env-file");
const { projectRoot } = require("./paths");

const ENV_PATH = path.join(projectRoot, ".env");
const DEFAULT_IPV4_PORT = "19132";
const DEFAULT_IPV6_PORT = "19133";

async function configureBedrockPorts(prompt) {
  const env = parseEnv(readEnvFile(ENV_PATH));
  const currentIpv4Port = env.BEDROCK_PORT_IPV4 || env.BEDROCK_SERVER_PORT || DEFAULT_IPV4_PORT;
  const currentIpv6Port = env.BEDROCK_PORT_IPV6 || env.BEDROCK_SERVER_PORT_V6 || DEFAULT_IPV6_PORT;

  const ipv4Port = await askPort(prompt, "Porta IPv4 do Bedrock Server", currentIpv4Port);
  const ipv6Port = await askPort(prompt, "Porta IPv6 do Bedrock Server", currentIpv6Port, [ipv4Port]);

  setEnvValue(ENV_PATH, "BEDROCK_PORT_IPV4", ipv4Port);
  setEnvValue(ENV_PATH, "BEDROCK_PORT_IPV6", ipv6Port);
  setEnvValue(ENV_PATH, "BEDROCK_SERVER_PORT", ipv4Port);
  setEnvValue(ENV_PATH, "BEDROCK_SERVER_PORT_V6", ipv6Port);

  console.log(`Portas do Bedrock Server configuradas: IPv4 ${ipv4Port}, IPv6 ${ipv6Port}`);
}

async function askPort(prompt, question, defaultValue, unavailablePorts = []) {
  while (true) {
    const port = await prompt.ask(question, defaultValue);
    const error = validatePort(port, unavailablePorts);

    if (!error) {
      return port;
    }

    console.log(error);
  }
}

function validatePort(port, unavailablePorts) {
  if (!/^\d+$/.test(port)) {
    return "A porta precisa ser um numero inteiro.";
  }

  const numericPort = Number.parseInt(port, 10);

  if (numericPort < 1 || numericPort > 65535) {
    return "A porta precisa estar entre 1 e 65535.";
  }

  if (unavailablePorts.includes(port)) {
    return "A porta IPv6 precisa ser diferente da porta IPv4 no host.";
  }

  return null;
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

module.exports = { configureBedrockPorts };
