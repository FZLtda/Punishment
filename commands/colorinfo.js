const { EmbedBuilder } = require('discord.js');
const Color = require('color');

module.exports = {
  name: 'colorinfo',
  description: 'Exibe informações sobre uma cor (nome ou código hexadecimal).',
  usage: '.colorinfo [nome da cor | código hexadecimal]',
  async execute(message, args) {
    if (!args[0]) {
      return message.reply('<:no:1122370713932795997> Forneça o nome da cor ou um código hexadecimal.');
    }

    let colorInput = args[0];
    let color;

    try {
      color = Color(colorInput);
    } catch {
      return message.reply('<:no:1122370713932795997> Não foi possível obter informações dessa cor.');
    }

    const hexCode = color.hex();
    const rgbCode = color.rgb().array().join(', ');
    const hslCode = color.hsl().array().map(value => value.toFixed(1)).join(', ');

    const colorEmbed = new EmbedBuilder()
      .setTitle('🎨 Informações da Cor')
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