'use strict';

const { setBotPresence } = require('@coreBot/presence');
const Logger = require('@logger');
const monitor = require('@core/monitor');
const iniciarSorteiosTask = require('@tasks/sorteios');
const PendingDonor = require('@models/PendingDonor');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    global.client = client;

    try {
      await setBotPresence(client);
      iniciarSorteiosTask(client);
      monitor.emit('ready', client.user.tag);

      Logger.info(`Sincronizando cargos de doadores pendentes...`);

      const guild = client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        Logger.error('Servidor não encontrado no cache para sincronização de cargos.');
        return;
      }

      const donors = await PendingDonor.find({});
      for (const donor of donors) {
        try {
          const member = await guild.members.fetch(donor.userId).catch(() => null);
          if (!member) continue;

          if (!member.roles.cache.has(process.env.CARGO_DOADOR_ID)) {
            await member.roles.add(process.env.CARGO_DOADOR_ID);
            Logger.info(`Cargo de doador atribuído a ${member.user.tag} (${member.id})`);
          }
        } catch (error) {
          Logger.error(`Erro ao atribuir cargo para ${donor.userId}: ${error.message}`);
        }
      }

    } catch (err) {
      Logger.fatal(`Falha ao iniciar evento 'ready': ${err.stack || err.message}`);
      monitor.emit('error', 'event:ready', err);
    }
  }
};
