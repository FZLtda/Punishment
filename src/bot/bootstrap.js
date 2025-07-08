'use strict';

const client = require('@bot/client');
const { validateEnvironment } = require('@bot/environment');
const { connectMongo } = require('@database');
const { loadCommands } = require('@loadCommands/loader');
const { loadEvents } = require('@loadEvents/loader');
const { loadSlashCommands } = require('@loadSlashCommands/loader');
const { loadButtonInteractions } = require('@loadButtonInteractions/loader');
const { showStartupDiagnostic } = require('@bot/diagnostic');

module.exports = async function bootstrap() {
  validateEnvironment();

  if (!process.env.TOKEN) throw new Error('A variável de ambiente TOKEN está ausente.');

  await connectMongo();
  await loadCommands(client);
  await loadEvents(client);
  await loadSlashCommands(client);
  await loadButtonInteractions(client);

  await client.login(process.env.TOKEN);
  await showStartupDiagnostic(client);
};
