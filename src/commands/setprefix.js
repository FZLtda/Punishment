const { EmbedBuilder } = require('discord.js');
const { check } = require('../config/emoji.json');

module.exports = {
  name: 'setprefix',
  description: 'Altera o prefixo do bot no servidor.',
  usage: '${currentPrefix}setprefix <prefixo>',
  permissions: 'Gerenciar Servidor',

  async execute(message, args, { setPrefix }) {
    if (!message.member.permissions.has('ManageGuild')) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não tem permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const newPrefix = args[0];

    if (!newPrefix) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: `Você precisa informar o novo prefixo. Exemplo: ${prefix}setprefix ?`,
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (newPrefix.length > 5) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'O prefixo não pode ter mais de 5 caracteres.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      
      setPrefix(message.guild.id, newPrefix);

      const embedSucesso = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle(`${check} Atualização de Prefixo`)
        .setDescription(`Prefixo atualizado para: ${newPrefix}`)

      return message.reply({ embeds: [embedSucesso], allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error('[ERRO] Falha ao atualizar o prefixo:', error);

      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Erro ao atualizar o prefixo. Tente novamente mais tarde.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
