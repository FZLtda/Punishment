const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'setprefix',
  description: 'Altera o prefixo do bot no servidor.',
  usage: '${currentPrefix}setprefix <prefixo>',
  userPermissions: ['ManageGuild'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args, { setPrefix }) {

    const newPrefix = args[0];

    if (!newPrefix) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Você precisa informar o novo prefixo. Exemplo: .setprefix !',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (newPrefix.length > 5) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'O prefixo não pode ter mais de 5 caracteres.',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      
      setPrefix(message.guild.id, newPrefix);

      const embedSucesso = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle(`${emojis.check} Atualização de Prefixo`)
        .setDescription(`Prefixo atualizado para: ${newPrefix}`);

      return message.reply({ embeds: [embedSucesso], allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error('[ERRO] Falha ao atualizar o prefixo:', error);

      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Erro ao atualizar o prefixo. Tente novamente mais tarde.',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
