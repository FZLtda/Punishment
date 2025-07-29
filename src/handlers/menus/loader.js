'use strict';

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const Logger = require('@logger');

/**
 * Carrega todos os Select Menus personalizados (String/User/Role) e registra no client.
 * Suporta customId como string exata ou RegExp para ids dinâmicos.
 * @param {import('discord.js').Client} client
 * @returns {void}
 */

function loadMenus(client) {
  const menusPath = path.resolve(__dirname, '../../../src/interactions/menus');

  console.time('[LOADER] Tempo de carregamento dos Select Menus');
  client.menus = new Collection();

  if (!fs.existsSync(menusPath)) {
    Logger.warn('[LOADER] Pasta de Select Menus não encontrada.');
    return;
  }

  const menuFiles = getAllJsFiles(menusPath);
  if (menuFiles.length === 0) {
    Logger.warn('[LOADER] Nenhum menu encontrado na pasta menus.');
    return;
  }

  for (const filePath of menuFiles) {
    try {
      const raw = require(filePath);
      const menu = raw?.default || raw;

      const isValidCustomId =
        typeof menu?.customId === 'string' || menu?.customId instanceof RegExp;

      if (!isValidCustomId || typeof menu?.execute !== 'function') {
        Logger.warn(`[MENU] Ignorado (inválido): ${path.basename(filePath)}`);
        continue;
      }

      client.menus.set(menu.customId, menu);
      Logger.info(`[MENU] Carregado: ${menu.customId}`);
    } catch (err) {
      Logger.error(`[MENU] Erro ao carregar ${path.basename(filePath)}: ${err.message}`);
    }
  }

  console.timeEnd('[LOADER] Tempo de carregamento dos Select Menus');
  Logger.success(`[LOADER] ${client.menus.size} Select Menus carregados com sucesso.`);
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

module.exports = { loadMenus };
