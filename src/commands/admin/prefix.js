'use strict';

const GuildConfig = require('@models/GuildConfig');
const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'prefix',
  description: 'Altera o prefixo usado pelo bot neste servidor.',
  usage: '${currentPrefix}prefix <novo_prefixo>',
  userPermissions: ['ManageGuild'],
  deleteMessage: true,

  async execute(message, args) {
    const novoPrefixo = args[0];
    const guildId = message.guild.id;

    if (!novoPrefixo || novoPrefixo.length > 5) {
      return sendEmbed('yellow', message, 'Forneça um prefixo válido com até 5 caracteres.');
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

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setDescription(`${emojis.successEmoji} O prefixo foi alterado para \`${novoPrefixo}\` com sucesso!`)
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('[PREFIX-ERROR]', error);
      return sendEmbed('yellow', message, 'Não foi possível salvar o novo prefixo.');
    }
  }
};
