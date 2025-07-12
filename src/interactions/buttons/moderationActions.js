'use strict';

const { PermissionFlagsBits } = require('discord.js');
const { sendEmbed } = require('@utils/embedReply');
const { sendModLog } = require('@modules/modlog');
const { colors, emojis } = require('@config');
const { checkMemberGuard } = require('@utils/memberGuards');

module.exports = {
  customId: /^mod:(ban|kick|mute|unmute|block):(\d+)$/,

  async execute(interaction) {
    const match = interaction.customId.match(/^mod:(ban|kick|mute|unmute|block):(\d+)$/);
    if (!match) return sendEmbed('yellow', interaction, 'Ação inválida.');

    const [, action, targetId] = match;
    const guild = interaction.guild;
    const target = await guild.members.fetch(targetId).catch(() => null);
    const executor = interaction.member;

    if (!target)
      return sendEmbed('yellow', interaction, 'Usuário não encontrado.');

    const guard = await checkMemberGuard(interaction, executor, target);
    if (!guard) return;

    try {
      switch (action) {
        case 'ban':
          await target.ban({ reason: `Banido por ${executor.user.tag}` });

          await sendModLog(guild, {
            action: 'Ban',
            target: target.user,
            moderator: executor.user
          });

          return sendEmbed('yellow', interaction, `${emojis.successEmoji} ${target.user.tag} foi banido com sucesso.`);

        case 'kick':
          await target.kick(`Expulso por ${executor.user.tag}`);

          await sendModLog(guild, {
            action: 'Kick',
            target: target.user,
            moderator: executor.user
          });

          return sendEmbed('yellow', interaction, `${emojis.successEmoji} ${target.user.tag} foi expulso com sucesso.`);

        case 'mute':
          await target.timeout(60 * 60 * 1000, `Mutado por ${executor.user.tag}`);

          await sendModLog(guild, {
            action: 'Mute',
            target: target.user,
            moderator: executor.user,
            reason: 'Mute rápido pelo painel',
            extraFields: [
              { name: 'Duração', value: '1h', inline: true }
            ]
          });

          return sendEmbed('yellow', interaction, `${emojis.successEmoji} ${target.user.tag} foi mutado por 1h.`);

        case 'unmute':
          await target.timeout(null);

          await sendModLog(guild, {
            action: 'Unmute',
            target: target.user,
            moderator: executor.user
          });

          return sendEmbed('yellow', interaction, `${emojis.successEmoji} ${target.user.tag} foi desmutado.`);

        case 'block':
          await interaction.channel.permissionOverwrites.edit(target, {
            SendMessages: false,
            AddReactions: false,
            Speak: false
          });

          await sendModLog(guild, {
            action: 'Canal Bloqueado',
            target: target.user,
            moderator: executor.user,
            extraFields: [
              { name: 'Canal', value: `<#${interaction.channel.id}>`, inline: true }
            ]
          });

          return sendEmbed('yellow', interaction, `${emojis.successEmoji} ${target.user.tag} está bloqueado neste canal.`);

        default:
          return sendEmbed('yellow', interaction, 'Ação desconhecida.');
      }
    } catch (error) {
      console.error(`[painelmod] Erro ao executar ação '${action}':`, error);
      return sendEmbed('yellow', interaction, 'Erro inesperado ao executar a ação.');
    }
  }
};
