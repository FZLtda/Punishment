'use strict';

const path = require('path');

function validateCommandFile(filePath, loadedNames) {
  try {
    const command = require(filePath);
    const issues = [];

    const name = command?.data?.name || command?.name;
    if (!name) issues.push('Campo "name" ausente ou inválido.');
    else if (loadedNames.has(name)) {
      issues.push(`Nome duplicado: "${name}".`);
    } else {
      loadedNames.add(name);
    }

    if (typeof command.execute !== 'function') {
      issues.push('Campo "execute" ausente ou inválido.');
    }

    return {
      name: name || path.basename(filePath),
      path: filePath,
      issues,
    };
  } catch (err) {
    return {
      name: path.basename(filePath),
      path: filePath,
      issues: [`Erro ao carregar: ${err.message}`],
    };
  }
}

module.exports = { validateCommandFile };
