"use strict";

const client = require("@core/client");
const { validateEnvironment } = require("@core/validateEnvironment");
const { connectMongo } = require("@database");

const { loadCommands } = require("@loadCommands/loader");
const { loadEvents } = require("@loadEvents/loader");
const { loadMenus } = require("@loadMenus/loader");
const { loadModals } = require("@loadModals/loader");
const { loadSlashCommands } = require("@loadSlashCommands/loader");
const { loadButtonInteractions } = require("@loadButtonInteractions/loader");

const { showStartupDiagnostic } = require("@core/showStartupDiagnostic");

module.exports = async function bootstrap() {
  
  validateEnvironment();

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
