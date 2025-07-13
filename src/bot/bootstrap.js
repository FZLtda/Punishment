'use strict';

const client = require('@bot/client');
const { validateEnvironment } = require('@bot/environment');
const { connectMongo } = require('@database');
const { loadCommands } = require('@loadCommands/loader');
const { loadEvents } = require('@loadEvents/loader');
const { loadSlashCommands } = require('@loadSlashCommands/loader');
const { loadButtonInteractions } = require('@loadButtonInteractions/loader');
const { showStartupDiagnostic } = require('@bot/diagnostic');

/**
 * Inicia todos os subsistemas críticos do bot Punishment.
 * Este é o ponto central da inicialização e responsável por:
 * - Validar o ambiente
 * - Conectar à base de dados
 * - Carregar módulos dinâmicos
 * - Autenticar o client no Discord
 * - Exibir diagnósticos
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
    loadSlashCommands(client),
    loadButtonInteractions(client)
  ]);

  await client.login(process.env.TOKEN);

  await showStartupDiagnostic(client);
};
