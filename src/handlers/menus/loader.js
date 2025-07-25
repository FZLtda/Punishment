'use strict';

const fs = require('fs');
const path = require('path');
const Logger = require('@logger');

/**
 * Carrega todos os Select Menus personalizados (String/User/Role) e registra no client.
 * Suporta customId como string exata ou RegExp para ids dinâmicos.
 * @param {import('discord.js').Client} client
 */
function loadMenus(client) {
  const menusPath = path.join(__dirname, '../../../src/interactions/menus');

  client.menus = [];

  if (!fs.existsSync(menusPath)) {
    Logger.warn('[LOADER] Pasta de Select Menus não encontrada.');
    return;
  }

  const files = fs.readdirSync(menusPath).filter(file => file.endsWith('.js'));
  if (files.length === 0) {
    Logger.warn('[LOADER] Nenhum menu encontrado na pasta menus.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(menusPath, file);

    try {
      const menu = require(filePath);

      const isValidCustomId =
        typeof menu.customId === 'string' ||
        menu.customId instanceof RegExp;

      if (!menu || !isValidCustomId || typeof menu.execute !== 'function') {
        Logger.warn(`[MENU] Ignorado (inválido): ${file}`);
        continue;
      }

      client.menus.push({
        id: menu.customId,
        handler: menu.execute,
      });

      Logger.info(`[MENU] Carregado: ${menu.customId}`);
    } catch (err) {
      Logger.error(`[MENU] Erro ao carregar ${file}: ${err.message}`);
    }
  }

  Logger.info(`[LOADER] ${client.menus.length} Select Menus carregados com sucesso.`);
}

module.exports = { loadMenus };
