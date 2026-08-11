const fs = require("node:fs");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

function createPrompt() {
  if (!input.isTTY) {
    return createBufferedPrompt();
  }

  const rl = readline.createInterface({ input, output });

  return {
    async ask(question, defaultValue) {
      const suffix = defaultValue ? ` (${defaultValue})` : "";
      const answer = (await rl.question(`${question}${suffix}: `)).trim();
      return answer || defaultValue || "";
    },

    async confirm(question, defaultValue = true) {
      const hint = defaultValue ? "S/n" : "s/N";
      const answer = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();

      if (!answer) {
        return defaultValue;
      }

      return ["s", "sim", "y", "yes"].includes(answer);
    },

    async select(question, options) {
      if (options.length === 0) {
        throw new Error("Nenhuma opcao disponivel.");
      }

      console.log("");
      console.log(question);
      options.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label}`);
      });

      while (true) {
        const answer = await this.ask("Escolha uma opcao");
        const selectedIndex = Number.parseInt(answer, 10) - 1;

        if (Number.isInteger(selectedIndex) && options[selectedIndex]) {
          return options[selectedIndex].value;
        }

        console.log("Opcao invalida. Tente novamente.");
      }
    },

    close() {
      rl.close();
    },
  };
}

function createBufferedPrompt() {
  const answers = fs.readFileSync(0, "utf8").split(/\r?\n/);

  return {
    async ask(question, defaultValue) {
      const suffix = defaultValue ? ` (${defaultValue})` : "";
      output.write(`${question}${suffix}: `);

      if (answers.length === 0) {
        throw new Error("Entrada encerrada antes da configuracao terminar.");
      }

      const answer = (answers.shift() || "").trim();
      output.write(`${answer}\n`);
      return answer || defaultValue || "";
    },

    async confirm(question, defaultValue = true) {
      const hint = defaultValue ? "S/n" : "s/N";
      const answer = (await this.ask(`${question} [${hint}]`)).trim().toLowerCase();

      if (!answer) {
        return defaultValue;
      }

      return ["s", "sim", "y", "yes"].includes(answer);
    },

    async select(question, options) {
      if (options.length === 0) {
        throw new Error("Nenhuma opcao disponivel.");
      }

      console.log("");
      console.log(question);
      options.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label}`);
      });

      while (true) {
        const answer = await this.ask("Escolha uma opcao");
        const selectedIndex = Number.parseInt(answer, 10) - 1;

        if (Number.isInteger(selectedIndex) && options[selectedIndex]) {
          return options[selectedIndex].value;
        }

        console.log("Opcao invalida. Tente novamente.");
      }
    },

    close() {},
  };
}

module.exports = { createPrompt };
