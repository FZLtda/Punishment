'use strict';

const fs = require('fs');
const path = require('path');
const Logger = require('@logger');

// Usa o alias @buttons como caminho absoluto
const buttonsPath = require.resolve('@buttons');

async function loadButtonInteractions(client) {
  const dirPath = path.dirname(buttonsPath);
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const button = require(filePath);

      if (!button.customId || typeof button.execute !== 'function') {
        Logger.warn(`Botão inválido em ${file}`);
        continue;
      }

      client.buttons.set(button.customId, button);
      Logger.info(`Botão registrado: ${button.customId}`);
    } catch (err) {
      Logger.error(`Erro ao carregar botão ${file}: ${err.message}`);
    }
  }
}

module.exports = {
  loadButtonInteractions
};
