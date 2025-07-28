'use strict';

const { EmbedBuilder } = require('discord.js');
const { sendWarning } = require('@utils/embedWarning');
const { colors, emojis } = require('@config');
const Logger = require('@logger');
const path = require('path');

module.exports = {
  name: 'addemoji',
  description: 'Adiciona um emoji personalizado ao servidor a partir de um link de imagem.',
  usage: '${currentPrefix}addemoji <nome> <link da imagem>',
  category: 'Administração',
  aliases: ['createemoji', 'emojiadd'],
  userPermissions: ['ManageEmojisAndStickers'],
  botPermissions: ['ManageEmojisAndStickers'],
  deleteMessage: true,

  async execute(message, args) {
    const [nome, url] = args;

    if (!nome || !url)
      return sendWarning(message, 'Uso correto: `addemoji <nome> <link da imagem>`');

    if (!isValidURL(url))
      return sendWarning(message, 'Forneça uma URL válida de imagem (terminando com .png, .jpg, .jpeg, .gif).');

    const extensao = path.extname(url).toLowerCase();
    const permitidas = ['.png', '.jpg', '.jpeg', '.gif'];
    if (!permitidas.includes(extensao))
      return sendWarning(message, 'Formato inválido. Use apenas: `.png`, `.jpg`, `.jpeg`, ou `.gif`.');

    try {
      const emoji = await message.guild.emojis.create({
        name: nome,
        attachment: url,
        reason: `Emoji criado por ${message.author.tag}`
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.successEmoji} Emoji criado`)
        .setColor(colors.green)
        .setDescription(`O emoji ${emoji} foi criado com sucesso!`)
        .addFields(
          { name: 'Nome', value: `\`${nome}\``, inline: true },
          { name: 'Emoji ID', value: `\`${emoji.id}\``, inline: true }
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
      Logger.info(`[EMOJI] ${message.author.tag} criou o emoji ${nome} (${emoji.id})`);

    } catch (error) {
      Logger.error(`[EMOJI] Erro ao criar emoji: ${error.stack || error.message}`);
      return sendWarning(message, 'Não foi possível criar o emoji. Verifique se o servidor atingiu o limite ou se a imagem é válida.');
    }
  }
};

/**
 * Verifica se a URL é válida
 */
function isValidURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
