'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'botinfo',
  description: 'Exibe informações sobre o bot.',
  usage: '${currentPrefix}botinfo',
  botPermissions: ['SendMessages'],

  async execute(message) {
    const { client } = message;

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`${emojis.bot} Informações do Bot`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Nome', value: `\`${client.user.username}\``, inline: true },
        { name: 'Ping', value: `\`${client.ws.ping}ms\``, inline: true },
        { name: 'Servidores', value: `\`${client.guilds.cache.size}\``, inline: true },
        { name: 'Usuários', value: `\`${client.users.cache.size}\``, inline: true },
        { name: 'Criado em', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setFooter({
        text: `ID: ${client.user.id}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
