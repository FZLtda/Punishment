'use strict';

const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendEmbed } = require('@utils/embedReply');
const { sendModLog } = require('@modules/modlog');
const { colors, emojis } = require('@config');
const { checkMemberGuard } = require('@utils/memberGuards');

module.exports = {
  customId: /^mod:(ban|kick|mute|unmute|block):(\d+)$/,
  
  async execute(interaction) {
    const [, action, targetId] = interaction.customId.match(/^mod:(.+):(\d+)$/);
    const guild = interaction.guild;
    const target = await guild.members.fetch(targetId).catch(() => null);
    const executor = interaction.member;

    if (!target) return sendEmbed(interaction, 'yellow', 'Usuário não encontrado.');

    const guard = await checkMemberGuard(interaction, executor, target);
    if (!guard) return; // checkMemberGuard já responde com erro

    try {
      switch (action) {
        case 'ban':
          await target.ban({ reason: `Banido por ${executor.user.tag}` });
          sendModLog(guild, { action: 'Ban', target, executor });
          return sendEmbed(interaction, 'green', `${emojis.successEmoji} ${target.user.tag} foi banido com sucesso.`);
        
        case 'kick':
          await target.kick(`Expulso por ${executor.user.tag}`);
          sendModLog(guild, { action: 'Kick', target, executor });
          return sendEmbed(interaction, 'green', `${emojis.successEmoji} ${target.user.tag} foi expulso com sucesso.`);
        
        case 'mute':
          await target.timeout(60 * 60 * 1000, `Mutado por ${executor.user.tag}`); // 1h
          sendModLog(guild, { action: 'Mute', target, executor });
          return sendEmbed(interaction, 'green', `${emojis.successEmoji} ${target.user.tag} foi mutado por 1h.`);
        
        case 'unmute':
          await target.timeout(null);
          sendModLog(guild, { action: 'Unmute', target, executor });
          return sendEmbed(interaction, 'green', `${emojis.successEmoji} ${target.user.tag} foi desmutado.`);
        
        case 'block':
          await interaction.channel.permissionOverwrites.edit(target, {
            SendMessages: false,
            AddReactions: false,
            Speak: false,
          });
          sendModLog(guild, { action: 'Canal Bloqueado', target, executor });
          return sendEmbed(interaction, 'green', `${emojis.successEmoji} ${target.user.tag} está bloqueado neste canal.`);
        
        default:
          return sendEmbed(interaction, 'yellow', 'Ação desconhecida.');
      }
    } catch (err) {
      console.error(err);
      return sendEmbed(interaction, 'yellow', 'Erro ao executar a ação.');
    }
  }
};
