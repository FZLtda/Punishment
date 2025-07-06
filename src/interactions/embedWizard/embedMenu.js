'use strict';

const { construirMenuEmbedInicial } = require('@modules/embedWizard/ui/startMenu');
const { sessionStart } = require('@modules/embedWizard/sessionStore');

module.exports = {
  customId: 'embed_menu',

  /**
   * Processa a seleção do menu inicial de embed wizard
   */
  async execute(interaction) {
    const selected = interaction.values[0];
    const userId = interaction.user.id;

    await sessionStart(userId); // inicia sessão se não houver

    switch (selected) {
      case 'create_embed':
        return require('./steps/createEmbed').start(interaction);
      case 'create_text':
        return require('./steps/createText').start(interaction);
      case 'edit_embed':
        return require('./steps/editEmbed').start(interaction);
      default:
        return interaction.reply({ content: 'Seleção inválida.', ephemeral: true });
    }
  }
};
