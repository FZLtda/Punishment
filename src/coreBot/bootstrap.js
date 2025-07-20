'use strict';

const client = require('@coreBot/client');
const { validateEnvironment } = require('@coreBot/environment');
const { connectMongo } = require('@database');

const { loadCommands } = require('@loadCommands/loader');
const { loadEvents } = require('@loadEvents/loader');
const { loadMenus } = require('@loadMenus/loader');
const { loadSlashCommands } = require('@loadSlashCommands/loader');
const { loadButtonInteractions } = require('@loadButtonInteractions/loader');

const { showStartupDiagnostic } = require('@coreBot/diagnostic');

/**
 * Ponto principal de inicialização do Punishment.
 * Aqui são ativados os sistemas essenciais:
 * - Verificação do ambiente
 * - Conexão com o banco de dados
 * - Carregamento dos módulos
 * - Login do bot no Discord
 * - Exibição de diagnósticos
 */

module.exports = async function bootstrap() {
  validateEnvironment();

  if (!process.env.TOKEN) {
    throw new Error('[BOOTSTRAP] Variável de ambiente TOKEN ausente.');
  }

  await connectMongo();

  await Promise.all([
    loadCommands(client),
    loadEvents(client),
    loadMenus(client),
    loadSlashCommands(client),
    loadButtonInteractions(client)
  ]);

  await client.login(process.env.TOKEN);

  await showStartupDiagnostic(client);
};
