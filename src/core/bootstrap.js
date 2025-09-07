'use strict';

const client = require('@core/client');
const { validateEnvironment } = require('@core/environment');
const { connectMongo } = require('@database');

const { loadCommands } = require('@loadCommands/loader');
const { loadEvents } = require('@loadEvents/loader');
const { loadMenus } = require('@loadMenus/loader');
const { loadModals } = require('@loadModals/loader');
const { loadSlashCommands } = require('@loadSlashCommands/loader');
const { loadButtonInteractions } = require('@loadButtonInteractions/loader');

const { showStartupDiagnostic } = require('@core/diagnostic');

/**
 * Bootstrap do Punishment.
 * Responsável por:
 * - Validar ambiente
 * - Conectar ao MongoDB
 * - Carregar módulos principais
 * - Fazer login no Discord
 * - Exibir diagnósticos de inicialização
 *
 * @returns {Promise<{ discordClient: import('discord.js').Client, mongo: any }>}
 */
module.exports = async function bootstrap() {
  validateEnvironment();

  if (!process.env.TOKEN) {
    throw new Error('[BOOTSTRAP] Variável de ambiente TOKEN ausente.');
  }

  const mongo = await connectMongo();

  await Promise.all([
    loadCommands(client),
    loadEvents(client),
    loadMenus(client),
    loadSlashCommands(client),
    loadButtonInteractions(client),
    loadModals(client),
  ]);

  await client.login(process.env.TOKEN);
  await showStartupDiagnostic(client);

  return { discordClient: client, mongo };
};
