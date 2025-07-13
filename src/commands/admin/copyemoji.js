'use strict';

/**
 * Copia um emoji personalizado de outro servidor para o atual.
 * Suporte a: emojis animados e nome personalizado.
 */

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');
const Logger = require('@logger');

module.exports = {
  name: 'copyemoji',
  description: 'Copia um emoji personalizado para o seu servidor a partir de um emoji existente (ID ou menção).',
  usage: '${currentPrefix}copyemoji <emoji> [novo_nome]',
  category: 'Administração',
  userPermissions: ['ManageEmojisAndStickers'],
  botPermissions: ['ManageEmojisAndStickers'],
  cooldown: 5,
  deleteMessage: true,

  async execute(message, args) {
    if (!args[0]) {
      return sendEmbed('yellow', message, 'Você deve fornecer um emoji para copiar.');
    }

    const emojiInput = args[0];
    const newName = args[1] || null;

    const emojiRegex = /<(a?):(\w+):(\d+)>/;
    const match = emojiInput.match(emojiRegex);

    if (!match) {
      return sendEmbed('yellow', message, 'Por favor, forneça um emoji customizado válido (menção ou ID).');
    }

    const animated = Boolean(match[1]);
    const emojiName = newName || match[2];
    const emojiId = match[3];
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;

    try {
      const emoji = await message.guild.emojis.create({
        attachment: url,
        name: emojiName
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.successEmoji} Emoji copiado com sucesso!`)
        .setColor(colors.green)
        .setDescription(`Emoji ${emoji} criado com o nome \`${emojiName}\`.`)
        .setThumbnail(emoji.imageURL())
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      Logger.info(`[COPYEMOJI] Emoji copiado: ${emojiName} (${emojiId}) por ${message.author.tag}`);

    } catch (error) {
      Logger.error(`[COPYEMOJI] Falha ao copiar emoji: ${error.stack || error.message}`);
      return sendEmbed('yellow', message, 'Não foi possível copiar o emoji. Verifique se o bot tem permissões suficientes e se o servidor atingiu o limite de emojis.');
    }
  }
};
