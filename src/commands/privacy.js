const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'privacy',
  description: 'Exibe a Política de Privacidade do Punishment.',
  usage: '${currentPrefix}privacy',
  permissions: 'Enviar Mensagens',
  execute: async (message) => {
    
    const lastUpdated = '<t:1739723760:f>';

    const embed = new EmbedBuilder()
      .setColor(0xfe3838)
      .setTitle('Política de Privacidade')
      .setDescription(
        '**Ao utilizar o Punishment, você concorda com os seguintes termos:**\n\n' +
          '**1. Processamento de Mensagens:**\n' +
          'O Punishment não armazena mensagens de texto dos usuários. Ele apenas processa conteúdos em tempo real para aplicar punições e enviar notificações de moderação.\n\n' +
          '**2. Dados Coletados:**\n' +
          'Apenas dados essenciais do Discord são coletados, como ID do usuário, nome de perfil e informações sobre punições aplicadas.\n\n' +
          '**3. Uso das Informações:**\n' +
          'Nenhuma informação pessoal é compartilhada ou utilizada para outros fins além da moderação.\n\n' +
          '**4. Retenção e Remoção de Dados:**\n' +
          'Os dados coletados podem ser removidos permanentemente sem aviso prévio, caso necessário.\n\n' +
          '**5. Consentimento:**\n' +
          'Ao continuar utilizando o Punishment, você concorda com essas regras.\n\n' +
          '**6. Contato para Suporte:**\n' +
          'Para dúvidas ou suporte, entre em contato pelo e-mail: contato@funczero.xyz.'
      )
      .addFields({
        name: '<:1000043158:1336324199202947144> Última Atualização',
        value: `Esta política foi atualizada em: **${lastUpdated}**`,
      })
      .setFooter({
        text: '© 2025 FuncZero. Todos os direitos reservados.',
        iconURL: message.client.user.displayAvatarURL(),
      });

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
