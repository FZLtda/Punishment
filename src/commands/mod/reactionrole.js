'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'reactionrole',
  description: 'Cria um painel com botões para atribuição de cargos.',
  usage: '${currentPrefix}reactionrole <@cargo> <descrição>',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  deleteMessage: true,

  async execute(message, args) {
    const cargo = message.mentions.roles.first();
    const descricao = args.slice(1).join(' ');

    if (!cargo || !descricao) {
      return sendEmbed('yellow', message, 'Uso correto: `${currentPrefix}reactionrole <@cargo> <descrição do botão>`');
    }

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`${emojis.cargo} Obtenha seu cargo!`)
      .setDescription(`Clique no botão abaixo para receber o cargo ${cargo}.\n${descricao}`)
      .setFooter({
        text: message.guild.name,
        iconURL: message.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`reactionrole:${cargo.id}`)
        .setLabel('Receber cargo')
        .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
