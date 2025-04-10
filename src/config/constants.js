module.exports = {
  COLORS: {
    SUCCESS: '#2ECC71',
    ERROR: '#E74C3C',
    INFO: '#3498DB',
  },
  MESSAGES: {
    AUTOMOD: {
      TITLE: '⚙️ Configurações do AutoMod',
      DESCRIPTION: 'Use os botões abaixo para gerenciar as configurações do AutoMod.',
      RULE_UPDATED: (rule, status) => `A regra **${rule}** foi **${status ? 'ativada' : 'desativada'}**.`,
    },
    ERRORS: {
      NO_PERMISSION: '❌ Você não tem permissão para usar este comando.',
      DATABASE_ERROR: '❌ Ocorreu um erro ao acessar o banco de dados.',
    },
  },
};