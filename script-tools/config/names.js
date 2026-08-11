function validateFolderName(name) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "O nome nao pode ficar vazio.";
  }

  if (/[<>:"/\\|?*\u0000-\u001f]/.test(trimmed)) {
    return 'O nome nao pode conter estes caracteres: < > : " / \\ | ? *';
  }

  if (trimmed === "." || trimmed === "..") {
    return "O nome nao pode ser . ou ..";
  }

  return null;
}

async function askUniqueName(prompt, question, existingNames, defaultValue) {
  const normalizedExisting = new Set(existingNames.map((name) => name.toLowerCase()));

  while (true) {
    const name = (await prompt.ask(question, defaultValue)).trim();
    const error = validateFolderName(name);

    if (error) {
      console.log(error);
      continue;
    }

    if (normalizedExisting.has(name.toLowerCase())) {
      console.log("Esse nome ja existe. Escolha um nome unico.");
      continue;
    }

    return name;
  }
}

async function askValidName(prompt, question, defaultValue) {
  while (true) {
    const name = (await prompt.ask(question, defaultValue)).trim();
    const error = validateFolderName(name);

    if (!error) {
      return name;
    }

    console.log(error);
  }
}

module.exports = { askUniqueName, askValidName, validateFolderName };
