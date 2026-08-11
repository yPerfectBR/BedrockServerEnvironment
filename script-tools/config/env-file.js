const fs = require("node:fs");

function readEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return "";
  }

  return fs.readFileSync(envPath, "utf8");
}

function setEnvValue(envPath, key, value) {
  const originalContent = readEnvFile(envPath);
  const hasBom = originalContent.charCodeAt(0) === 0xfeff;
  const content = hasBom ? originalContent.slice(1) : originalContent;
  const lines = content ? content.split(/\r?\n/) : [];
  const escapedValue = String(value).replace(/\r?\n/g, " ");
  const line = `${key}=${escapedValue}`;
  let updated = false;

  const nextLines = lines.map((currentLine) => {
    if (currentLine.match(new RegExp(`^\\s*${escapeRegExp(key)}=`))) {
      updated = true;
      return line;
    }

    return currentLine;
  });

  if (!updated) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== "") {
      nextLines.push("");
    }

    nextLines.push(line);
  }

  fs.writeFileSync(envPath, `${hasBom ? "\ufeff" : ""}${nextLines.join("\n")}`, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { readEnvFile, setEnvValue };
