const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

function construirMenuEmbedInicial() {
  const embed = new EmbedBuilder()
    .setTitle('🛠️ Criador de Mensagens')
    .setDescription('Selecione uma das opções abaixo para começar.')
    .setColor('#5865F2');

  const select = new StringSelectMenuBuilder()
    .setCustomId('embed_menu')
    .setPlaceholder('Escolha uma opção')
    .addOptions([
      {
        label: '🖼️ Criar uma nova Embed',
        value: 'create_embed',
        description: 'Inicia um fluxo guiado para criar uma embed personalizada.'
      },
      {
        label: '💬 Criar mensagem de texto simples',
        value: 'create_text',
        description: 'Permite enviar uma mensagem simples sem embed.'
      },
      {
        label: '🧩 Editar uma embed existente',
        value: 'edit_embed',
        description: 'Forneça o ID de uma mensagem para editá-la.'
      }
    ]);

  const row = new ActionRowBuilder().addComponents(select);

  return { embed, row };
}

module.exports = { construirMenuEmbedInicial };
