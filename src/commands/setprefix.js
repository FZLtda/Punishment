const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'setprefix',
  description: 'Altera o prefixo do bot no servidor.',
  usage: '<prefixo>',
  permissions: 'Gerenciar Servidor',
  async execute(message, args, { setPrefix }) {
    try {
      // Verifica se o usuário tem permissão para gerenciar o servidor
      if (!message.member.permissions.has('ManageGuild')) {
        const embedErro = new EmbedBuilder()
          .setColor('#FF4C4C')
          .setTitle('❌ Permissão Negada')
          .setDescription('Você precisa da permissão **Gerenciar Servidor** para usar este comando.');

        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }

      // Verifica se o argumento do prefixo foi fornecido e é válido
      if (!args[0] || args[0].length > 5) {
        const embedErro = new EmbedBuilder()
          .setColor('#FF4C4C')
          .setTitle('❌ Prefixo Inválido')
          .setDescription('Por favor, forneça um prefixo válido com no máximo **5 caracteres**.');

        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }

      const newPrefix = args[0];

      // Atualiza o prefixo no banco de dados
      setPrefix(message.guild.id, newPrefix);

      const embedSucesso = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ Prefixo Atualizado')
        .setDescription(`O prefixo foi alterado com sucesso para: \`${newPrefix}\``);

      return message.reply({ embeds: [embedSucesso], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[ERROR] Falha ao executar o comando setprefix:', error);

      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setTitle('❌ Erro Interno')
        .setDescription('Ocorreu um erro ao tentar alterar o prefixo. Tente novamente mais tarde.');

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
