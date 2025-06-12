const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');
const Color = require('color');

module.exports = {
  name: 'colorinfo',
  description: 'Exibe informações sobre uma cor (nome ou código hexadecimal).',
  usage: '${currentPrefix}colorinfo <nome da cor | código hexadecimal>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  async execute(message, args) {
    if (!args[0]) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Forneça o nome da cor ou um código hexadecimal.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    let colorInput = args[0];
    let color;

    try {
      color = Color(colorInput);
    } catch {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível obter as informações da cor.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const hexCode = color.hex();
    const rgbCode = color.rgb().array().join(', ');
    const hslCode = color.hsl().array().map(value => value.toFixed(1)).join(', ');

    const colorEmbed = new EmbedBuilder()
      .setTitle('<:1000046537:1340437979193413823> Informações da Cor')
      .setDescription(`Aqui estão os detalhes da cor fornecida: **${colorInput}**`)
      .addFields(
        { name: 'Hexadecimal', value: `\`${hexCode}\``, inline: true },
        { name: 'RGB', value: `\`${rgbCode}\``, inline: true },
        { name: 'HSL', value: `\`${hslCode}\``, inline: true }
      )
      .setThumbnail(`https://singlecolorimage.com/get/${hexCode.replace('#', '')}/100x100`)
      .setColor(hexCode)
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await message.channel.send({ embeds: [colorEmbed] });
  },
};
