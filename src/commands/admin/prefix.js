const GuildConfig = require('@models/GuildConfig');
const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

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
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Forneça um prefixo válido com até 5 caracteres.',
          iconURL: emojis.attentionIcon
        });

      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      await GuildConfig.findOneAndUpdate(
        { guildId },
        { $set: { prefix: novoPrefixo } },
        { upsert: true, new: true }
      );

      // Atualiza cache local se houver método
      if (message.client.setPrefix) {
        message.client.setPrefix(guildId, novoPrefixo);
      }

      const embedSucesso = new EmbedBuilder()
        .setColor(colors.green)
        .setDescription(`${emojis.successEmoji} O prefixo foi alterado para \`${novoPrefixo}\` com sucesso!`)
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embedSucesso] });
    } catch (error) {
      console.error(`[MongoError] Prefix update failed:`, error);

      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Ocorreu um erro ao salvar o novo prefixo.',
          iconURL: emojis.attentionIcon
        });

      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
