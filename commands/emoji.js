const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: 'emoji',
  description: 'Adiciona ou copia emojis para o servidor.',
  usage: '<add|copy> <emoji/link> [nome]',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return message.reply(
        '<:no:1122370713932795997> Você não tem permissão para usar este comando.'
      );
    }

    const action = args[0]?.toLowerCase();
    if (!['add', 'copy'].includes(action)) {
      return message.reply(
        '<:no:1122370713932795997> Uso inválido! Use o comando corretamente: `emoji add <link> <nome>` ou `emoji copy <emoji> [nome opcional]`.'
      );
    }

    const emojiInput = args[1];
    if (!emojiInput) {
      return message.reply('<:no:1122370713932795997> Você precisa fornecer um link ou um emoji válido.');
    }

    let emojiName = args[2] || null;

    try {
      if (action === 'add') {
        if (!emojiInput.startsWith('http')) {
          return message.reply('<:no:1122370713932795997> O link fornecido não é válido.');
        }

        if (!emojiName) {
          return message.reply('<:no:1122370713932795997> Você precisa fornecer um nome para o emoji.');
        }

        const response = await fetch(emojiInput);
        const buffer = await response.buffer();

        if (buffer.byteLength > 256 * 1024) {
          return message.reply('<:no:1122370713932795997> O arquivo excede o limite de 256 KB.');
        }

        const addedEmoji = await message.guild.emojis.create({
          attachment: buffer,
          name: emojiName,
        });

        const embed = new EmbedBuilder()
          .setTitle('<:emoji_33:1219788320234803250> Emoji Adicionado com Sucesso!')
          .setColor('Green')
          .addFields(
            { name: 'Nome', value: addedEmoji.name, inline: true },
            { name: 'ID', value: addedEmoji.id, inline: true },
            { name: 'Pré-visualização', value: `[Clique Aqui](${addedEmoji.url})`, inline: true }
          )
          .setThumbnail(addedEmoji.url)
          .setFooter({
            text: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      } else if (action === 'copy') {
        const emojiMatch = emojiInput.match(/<a?:\w+:(\d+)>/);
        if (!emojiMatch) {
          return message.reply('<:no:1122370713932795997> O emoji fornecido não é válido.');
        }

        const emojiId = emojiMatch[1];
        const emojiUrl = emojiInput.startsWith('<a')
          ? `https://cdn.discordapp.com/emojis/${emojiId}.gif`
          : `https://cdn.discordapp.com/emojis/${emojiId}.png`;

        if (!emojiName) {
          emojiName = emojiInput.match(/:(\w+):/)[1];
        }

        const response = await fetch(emojiUrl);
        const buffer = await response.buffer();

        if (buffer.byteLength > 256 * 1024) {
          return message.reply('<:no:1122370713932795997> O arquivo excede o limite de 256 KB.');
        }

        const copiedEmoji = await message.guild.emojis.create({
          attachment: buffer,
          name: emojiName,
        });

        const embed = new EmbedBuilder()
          .setTitle('<:emoji_33:1219788320234803250> Emoji Copiado com Sucesso!')
          .setColor('Green')
          .addFields(
            { name: 'Nome', value: copiedEmoji.name, inline: true },
            { name: 'ID', value: copiedEmoji.id, inline: true },
            { name: 'Pré-visualização', value: `[Clique Aqui](${copiedEmoji.url})`, inline: true }
          )
          .setThumbnail(copiedEmoji.url)
          .setFooter({
            text: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar adicionar/copiar o emoji.');
    }
  },
};