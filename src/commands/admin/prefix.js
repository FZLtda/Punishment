'use strict';

const GuildConfig = require('@models/GuildConfig');
const { sendWarning } = require('@utils/embedWarning');
const { emojis } = require('@config');

module.exports = {
  name: 'prefix',
  description: 'Altera o prefixo usado pelo bot neste servidor.',
  usage: '${currentPrefix}prefix <novo_prefixo>',
  userPermissions: ['ManageGuild'],
  deleteMessage: true,

  /**
   * Altera o prefixo do servidor.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  
  async execute(message, args) {
    const novoPrefixo = args[0];
    const guildId = message.guild.id;

    if (!novoPrefixo || novoPrefixo.length > 5) {
      return sendWarning(message, 'Forneça um prefixo válido com até 5 caracteres.');
    }

    try {
      await GuildConfig.findOneAndUpdate(
        { guildId },
        { $set: { prefix: novoPrefixo } },
        { upsert: true, new: true }
      );

      if (message.client.setPrefix) {
        message.client.setPrefix(guildId, novoPrefixo);
      }

      return message.channel.send(`${emojis.successEmoji} Prefixo alterado para \`${novoPrefixo}\`.`);

    } catch (error) {
      console.error(`[PREFIX] Erro ao salvar novo prefixo para ${guildId}:`, error);
      return sendWarning(message, 'Não foi possível salvar o novo prefixo.');
    }
  }
};
