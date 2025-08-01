'use strict';

const { Events, EmbedBuilder } = require('discord.js');
const logger = require('@logger');
const { colors } = require('@config');
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

      const embed = new EmbedBuilder()
        .setTitle('🎉 Obrigado por apoiar o Punishment!')
        .setDescription('Você recebeu automaticamente o cargo de doador ao entrar no servidor.\nMuito obrigado pelo seu apoio!')
        .setColor(colors.green)
        .setFooter({ text: 'Sistema de Recompensas' });

      await member.send({ embeds: [embed] }).catch(() => {
        logger.warn(`[Doador] Não foi possível enviar DM para ${member.user.tag}.`);
      });

    } catch (err) {
      logger.error(`[Doador] Erro ao atribuir cargo: ${err.message}`);
    }
  },
};
