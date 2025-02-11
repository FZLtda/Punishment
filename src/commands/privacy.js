const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'privacy',
  description: 'Exibe a Política de Privacidade do Punishment.',
  usage: '${currentPrefix}privacy',
  permissions: 'Enviar Mensagens',
  execute: async (message) => {
   
    const lastUpdated = '<t:1725585840:f>';

    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('Política de Privacidade')
      .setDescription(
        '**Ao utilizar o Punishment, você concorda com os seguintes termos:**\n\n' +
          '**1. Informações Coletadas:**\n' +
          'Uma conta vinculada ao seu perfil do Discord será criada para armazenar suas informações, incluindo IDs de usuário, em conformidade com os termos do Discord. Você tem total controle sobre as configurações da sua conta no Punishment.\n\n' +
          '**2. Análise de Atividades:**\n' +
          'O Punishment analisa mensagens enviadas enquanto você está ativo. Mensagens consideradas spam ou tentativas de burlar os sistemas de moderação são descartadas automaticamente.\n\n' +
          '**3. Uso das Informações:**\n' +
          'As informações coletadas são utilizadas para aprimorar os serviços do Punishment. Reservamo-nos o direito de excluir permanentemente conteúdo ou dados do bot por razões de segurança ou conformidade.\n\n' +
          '**4. Retenção e Proteção de Dados:**\n' +
          'Mantemos seus dados pelo tempo necessário e protegemos contra acessos não autorizados. Não compartilhamos informações publicamente, exceto quando exigido por lei.\n\n' +
          '**5. Direitos do Usuário:**\n' +
          'Você pode recusar o fornecimento de informações pessoais, embora isso possa limitar alguns serviços. Ao continuar a usar o bot, você concorda com nossas práticas de privacidade.\n\n' +
          '**6. Publicidade e Cookies:**\n' +
          'Utilizamos o Google AdSense e cookies DoubleClick para fornecer anúncios relevantes. Parceiros podem usar cookies de rastreamento de afiliados para fins publicitários.\n\n' +
          '**7. Compromisso do Usuário:**\n' +
          'Você se compromete a não se envolver em atividades ilegais, divulgar conteúdo ofensivo ou prejudicar os sistemas do bot ou de terceiros.\n\n' +
          '**8. Esclarecimentos Adicionais:**\n' +
          'Para dúvidas, entre em contato conosco. Cookies devem estar ativados para uma experiência completa.\n\n' +
          '© 2025 FuncZero. Todos os direitos reservados.'
      )
      .addFields({
        name: '<:1000043158:1336324199202947144> Última Atualização',
        value: `Esta política foi atualizada em: **${lastUpdated}**`,
      })
      .setFooter({
        text: 'Punishment',
        iconURL: message.client.user.displayAvatarURL(),
      });

    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
