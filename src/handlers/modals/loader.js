'use strict';

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const Logger = require('@logger');

/**
 * Carrega todos os Modals personalizados e registra no client.
 * Suporta customId como string exata ou RegExp para ids dinâmicos.
 * @param {import('discord.js').Client} client
 * @returns {void}
 */
function loadModals(client) {
  const modalsPath = path.resolve(__dirname, '../../../src/interactions/modals');

  console.time('[LOADER] Tempo de carregamento dos Modals');
  client.modals = new Collection();

  if (!fs.existsSync(modalsPath)) {
    Logger.warn('[LOADER] Pasta de Modals não encontrada.');
    return;
  }

  const modalFiles = getAllJsFiles(modalsPath);
  if (modalFiles.length === 0) {
    Logger.warn('[LOADER] Nenhum modal encontrado na pasta modals.');
    return;
  }

  for (const filePath of modalFiles) {
    try {
      const raw = require(filePath);
      const modal = raw?.default || raw;

      const isValidCustomId =
        typeof modal?.customId === 'string' || modal?.customId instanceof RegExp;

      if (!isValidCustomId || typeof modal?.execute !== 'function') {
        Logger.warn(`[MODAL] Ignorado (inválido): ${path.basename(filePath)}`);
        continue;
      }

      client.modals.set(modal.customId, modal);
      Logger.info(`[MODAL] Carregado: ${modal.customId}`);
    } catch (err) {
      Logger.error(`[MODAL] Erro ao carregar ${path.basename(filePath)}: ${err.message}`);
    }
  }

  console.timeEnd('[LOADER] Tempo de carregamento dos Modals');
  Logger.success(`[LOADER] ${client.modals.size} Modals carregados com sucesso.`);
}

/**
 * Retorna recursivamente todos os arquivos .js de um diretório
 * @param {string} dir
 * @returns {string[]}
 */
function getAllJsFiles(dir) {
  let results = [];

  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(getAllJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }

  return results;
}

module.exports = { loadModals };
