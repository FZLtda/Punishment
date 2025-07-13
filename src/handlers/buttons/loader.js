'use strict';

const fs = require('fs');
const path = require('path');
const Logger = require('@logger');

/**
 * Carrega todos os botões do diretório e registra no client.
 * @param {import('discord.js').Client} client
 */
async function loadButtonInteractions(client) {
  const buttonsPath = path.join(__dirname, '../../../src/interactions/buttons');

  if (!fs.existsSync(buttonsPath)) {
    Logger.warn('[LOADER] Pasta de botões não encontrada.');
    return;
  }

  const files = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

  if (!client.buttons) client.buttons = new Map();

  for (const file of files) {
    const filePath = path.join(buttonsPath, file);
    
    try {
      const button = require(filePath);

      if (!button?.customId || typeof button.execute !== 'function') {
        Logger.warn(`[BUTTON] Ignorado (inválido): ${file}`);
        continue;
      }

      client.buttons.set(button.customId, button);
      Logger.success(`[BUTTON] Carregado: ${button.customId}`);
    } catch (err) {
      Logger.error(`[BUTTON] Erro ao carregar ${file}: ${err.message}`);
    }
  }

  Logger.info(`[LOADER] ${client.buttons.size} botões carregados com sucesso.`);
}

module.exports = {
  loadButtonInteractions
};
