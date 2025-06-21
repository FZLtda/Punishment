const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { logModerationAction } = require('@utils/moderationUtils');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'emoji',
  description: 'Adiciona ou copia emojis para o servidor.',
  usage: '${currentPrefix}emoji add/copy <emoji/link> [nome]',
  userPermissions: ['ManageEmojisAndStickers'],
  botPermissions: ['ManageEmojisAndStickers'],
  deleteMessage: true,
  
  async execute(message, args) {

    const action = args[0]?.toLowerCase();
    if (!['add', 'copy'].includes(action)) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Uso inválido! Use o comando corretamente: `emoji add <link> <nome>` ou `emoji copy <emoji> [nome opcional]`.',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const emojiInput = args[1];
    if (!emojiInput) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Você precisa fornecer um link ou um emoji válido.',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    let emojiName = args[2] || null;

    try {
      if (action === 'add') {
        if (!emojiInput.startsWith('http')) {
          const embedErro = new EmbedBuilder()
            .setColor(colors.yellow)
            .setAuthor({
              name: 'O link fornecido não é válido.',
              iconURL: emojis.icon_attention,
            });

          return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }

        if (!emojiName) {
          const embedErro = new EmbedBuilder()
            .setColor(colors.yellow)
            .setAuthor({
              name: 'Você precisa fornecer um nome para o emoji.',
              iconURL: emojis.icon_attention,
            });

          return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }

        const response = await fetch(emojiInput);
        const buffer = await response.buffer();

        if (buffer.byteLength > 256 * 1024) {
          const embedErro = new EmbedBuilder()
            .setColor(colors.yellow)
            .setAuthor({
              name: 'O arquivo excede o limite de 256 KB.',
              iconURL: emojis.icon_attention,
            });

          return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }

        const addedEmoji = await message.guild.emojis.create({
          attachment: buffer,
          name: emojiName,
        });

        logModerationAction(
          message.guild.id,
          message.author.id,
          'AddEmoji',
          addedEmoji.id,
          `Emoji adicionado: ${emojiName}`
        );

        const embed = new EmbedBuilder()
          .setTitle('<:emoji_33:1219788320234803250> Emoji Adicionado')
          .setColor(colors.green)
          .addFields(
            { name: 'Nome', value: addedEmoji.name, inline: true },
            { name: 'ID', value: addedEmoji.id, inline: true },
          )
          .setThumbnail(addedEmoji.url)
          .setFooter({
            text: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
      } else if (action === 'copy') {
        const emojiMatch = emojiInput.match(/<a?:\w+:(\d+)>/);
        if (!emojiMatch) {
          const embedErro = new EmbedBuilder()
            .setColor(colors.yellow)
            .setAuthor({
              name: 'O emoji fornecido não é válido.',
              iconURL: emojis.icon_attention,
            });

          return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
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
          const embedErro = new EmbedBuilder()
            .setColor(colors.yellow)
            .setAuthor({
              name: 'O arquivo excede o limite de 256 KB.',
              iconURL: emojis.icon_attention,
            });

          return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }

        const copiedEmoji = await message.guild.emojis.create({
          attachment: buffer,
          name: emojiName,
        });

        logModerationAction(
          message.guild.id,
          message.author.id,
          'CopyEmoji',
          copiedEmoji.id,
          `Emoji copiado: ${emojiName}`
        );

        const embed = new EmbedBuilder()
          .setTitle('<:emoji_33:1219788320234803250> Emoji Copiado')
          .setColor(colors.green)
          .addFields(
            { name: 'Nome', value: copiedEmoji.name, inline: true },
            { name: 'ID', value: copiedEmoji.id, inline: true },
          )
          .setThumbnail(copiedEmoji.url)
          .setFooter({
            text: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }
    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível adicionar ou copiar o emoji devido a um erro.',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
