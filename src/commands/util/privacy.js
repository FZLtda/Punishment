'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors } = require('@config');

module.exports = {
  name: 'privacy',
  description: 'Exibe a Política de Privacidade do Punishment.',
  usage: '${currentPrefix}privacy',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const lastUpdated = '<t:1736649600:f>'; // 12/01/2026

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle('Política de Privacidade — Punishment')
      .setDescription(
        'Esta Política de Privacidade descreve como o **Punishment** coleta, utiliza, ' +
        'armazena e protege informações relacionadas ao uso do bot no Discord.'
      )
      .addFields(
        {
          name: '1. Dados Coletados',
          value:
            'O Punishment pode coletar e armazenar informações técnicas e operacionais, incluindo:\n' +
            '• IDs de usuários, servidores, canais e cargos;\n' +
            '• Configurações definidas dentro do bot;\n' +
            '• Registros de ações de moderação e eventos (logs).\n\n' +
            '**Não são coletados dados pessoais sensíveis**, como nome real, endereço, documentos, senhas ou informações financeiras.',
        },
        {
          name: '2. Finalidade do Uso dos Dados',
          value:
            'As informações coletadas são utilizadas exclusivamente para:\n' +
            '• Garantir o funcionamento correto e seguro do bot;\n' +
            '• Prevenir abusos e atividades maliciosas;\n' +
            '• Auditoria, análise técnica e melhoria contínua das funcionalidades.',
        },
        {
          name: '3. Compartilhamento de Informações',
          value:
            'O Punishment **não vende, compartilha ou divulga** quaisquer dados coletados a terceiros, ' +
            'exceto quando exigido por lei ou por ordem legal válida.',
        },
        {
          name: '4. Armazenamento e Segurança',
          value:
            'Os dados são armazenados de forma segura, utilizando medidas técnicas e organizacionais ' +
            'razoáveis para protegê-los contra acesso não autorizado, perda ou uso indevido.\n\n' +
            'Apesar dos esforços de segurança, nenhum sistema é totalmente isento de riscos, ' +
            'e o uso do Punishment ocorre por conta e responsabilidade do usuário.',
        },
        {
          name: '5. Retenção e Exclusão de Dados',
          value:
            'Os dados são mantidos apenas pelo tempo necessário para cumprir suas finalidades operacionais.\n\n' +
            'O usuário pode solicitar a exclusão de dados associados entrando em contato pelo e-mail informado abaixo, ' +
            'sujeita a limitações técnicas ou legais.',
        },
        {
          name: '6. Alterações nesta Política',
          value:
            'Esta Política de Privacidade pode ser atualizada ou modificada a qualquer momento, sem aviso prévio.\n\n' +
            'O uso contínuo do Punishment após alterações implica aceitação da versão mais recente.',
        },
        {
          name: '7. Contato',
          value:
            'Para dúvidas ou solicitações relacionadas à privacidade:\n' +
            '📧 **contato@funczero.xyz**',
        },
        {
          name: 'Última Atualização',
          value: `Esta política foi atualizada em: ${lastUpdated}`,
        }
      )
      .setFooter({
        text: '© 2026 — Punishment • FuncZero',
        iconURL: message.client.user.displayAvatarURL(),
      });

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { repliedUser: false },
    });
  },
};
