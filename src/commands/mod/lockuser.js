'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendEmbed } = require('@utils/embedReply');
const { checkMemberGuard } = require('@utils/memberGuards');
const { sendModLog } = require('@modules/modlog');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'lockuser',
  description: 'Impede que um usuário envie mensagens no canal atual.',
  usage: '${currentPrefix}lockuser <@usuário>',
  category: 'Moderação',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const target =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    const isValid = await checkMemberGuard(message, target, 'role');
    if (!isValid) return;

    try {
      await message.channel.permissionOverwrites.edit(target, {
        SendMessages: false,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.lock} Usuário Bloqueado`)
        .setColor(colors.red)
        .setDescription(`${target} (\`${target.id}\`) não poderá mais enviar mensagens neste canal.`)
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Bloqueio de Canal',
        target: target.user,
        moderator: message.author,
        reason: `Usuário bloqueado de enviar mensagens no canal ${message.channel}`,
      });

    } catch (error) {
      console.error('[COMMAND: lockuser] Erro ao aplicar bloqueio:', error);
      await sendEmbed('yellow', message, 'Ocorreu um erro ao tentar bloquear o usuário neste canal.');
    }
  },
};
