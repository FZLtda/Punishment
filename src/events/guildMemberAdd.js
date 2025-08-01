'use strict';

const { Events } = require('discord.js');
const logger = require('@logger');
const PendingDonor = require('@models/PendingDonor');

const CARGO_DOADOR_ID = process.env.CARGO_DOADOR_ID;

module.exports = {
  name: Events.GuildMemberAdd,

  /**
   * Evento executado quando um membro entra no servidor.
   * Verifica se ele é doador pendente e atribui cargo.
   * @param {import('discord.js').GuildMember} member
   */
  
  async execute(member) {
    try {
      const donor = await PendingDonor.findOne({ userId: member.id });
      if (!donor) return;

      await member.roles.add(CARGO_DOADOR_ID);
      await PendingDonor.deleteOne({ userId: member.id });

      logger.info(`[Doador] Cargo atribuído a ${member.user.tag} (${member.id})`);

    } catch (err) {
      logger.error(`[Doador] Erro ao atribuir cargo: ${err.message}`);
    }
  },
};
