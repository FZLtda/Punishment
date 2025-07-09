'use strict';

const { ChannelType } = require('discord.js');
const GuildSettings = require('@models/GuildSettings');
const { emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'setlog',
  description: 'Define o canal de log de moderação.',
  usage: '${currentPrefix}setlog <#canal>',
  category: 'Administração',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message) {
    const canal = message.mentions.channels.first();

    if (!canal)
      return sendEmbed('yellow', message, 'Mencione um canal válido.');

    if (canal.type !== ChannelType.GuildText)
      return sendEmbed('yellow', message, 'O canal precisa ser de texto.');

    try {
      await GuildSettings.findOneAndUpdate(
        { guildId: message.guild.id },
        { logChannelId: canal.id },
        { upsert: true, new: true }
      );

      return message.channel.send({
        content: `${emojis.successEmoji} Canal de log definido para ${canal}.`,
        allowedMentions: { parse: [] }
      });

    } catch (error) {
      console.error(error);
      return sendEmbed('yellow', message, 'Não foi possível salvar a configuração.');
    }
  }
};
