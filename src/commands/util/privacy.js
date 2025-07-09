const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'privacy',
  description: 'Exibe a Política de Privacidade do Punishment.',
  usage: '${currentPrefix}privacy',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const lastUpdated = '<t:1739725440:f>';

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle('Política de Privacidade')
      .setDescription(
        'O Punishment **não armazena mensagens de texto** dos usuários. Ele apenas processa conteúdos em tempo real para aplicar punições e enviar notificações de moderação.\n\n' +
        'Apenas **dados essenciais** do Discord são coletados, como ID do usuário, nome de perfil e informações sobre punições aplicadas.\n\n' +
        'Nenhuma informação pessoal é compartilhada ou utilizada para outros fins além da moderação.\n\n' +
        'Os dados coletados podem ser removidos permanentemente sem aviso prévio, caso necessário.\n\n' +
        'Ao continuar utilizando o Punishment, você concorda com essas regras.\n\n' +
        'Para dúvidas ou suporte, entre em contato pelo e-mail: contato@funczero.xyz.'
      )
      .addFields({
        name: '<:1000043158:1336324199202947144> Última Atualização',
        value: `Esta política foi atualizada em: ${lastUpdated}`
      })
      .setFooter({
        text: '© 2025 FuncZero. Todos os direitos reservados.',
        iconURL: message.client.user.displayAvatarURL()
      });

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { repliedUser: false }
    });
  }
};
