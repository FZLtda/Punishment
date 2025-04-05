const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'setprefix',
  description: 'Altera o prefixo do bot no servidor.',
  usage: '<prefixo>',
  permissions: 'Gerenciar Servidor',

  async execute(message, args, context) {
    const { setPrefix } = context;

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não tem permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const newPrefix = args[0];
    if (!newPrefix || newPrefix.length > 5) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Digite um novo prefixo respeitando o limite de 5 caracteres.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      await setPrefix(message.guild.id, newPrefix);

      const embedSucesso = new EmbedBuilder()
        .setColor('#2ecc71')
        .setAuthor({
          name: `Prefixo atualizado com sucesso para: ${newPrefix}`,
          iconURL: message.guild.iconURL({ dynamic: true }),
        });

      return message.reply({ embeds: [embedSucesso], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[ERRO] Falha ao atualizar o prefixo:', error);

      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Ocorreu um erro ao tentar atualizar o prefixo.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
