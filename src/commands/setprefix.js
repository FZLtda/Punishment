const { EmbedBuilder } = require('discord.js');

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

    if (!args[0] || args[0].length > 5) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Digite um novo prefixo respeitando o limite de 5 caracteres.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const newPrefix = args[0];

    try {
      
      setPrefix(message.guild.id, newPrefix);

      const embedSucesso = new EmbedBuilder()
        .setColor('#2ecc71')
        .setAuthor({
          name: `Prefixo atualizado com sucesso para: ${newPrefix}`,
          iconURL: message.guild.iconURL({ dynamic: true }),
        });

      return message.reply({ embeds: [embedSucesso], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[ERROR] Falha ao atualizar o prefixo:', error);

      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Erro',
          iconURL: 'https://bit.ly/43PItSI',
        })
        .setDescription('Ocorreu um erro ao tentar atualizar o prefixo. Tente novamente mais tarde.');

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};