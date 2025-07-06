'use strict';

const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { emojiDiscord, colors } = require('@config');
const { construirMenuEmbedInicial } = require('@modules/embedWizard/ui/startMenu');

module.exports = {
  name: 'embed',
  description: 'Inicia o assistente de criação de embeds ou mensagens.',
  usage: '${currentPrefix}embed',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const { embed, row } = construirMenuEmbedInicial();

    try {
      await message.reply({ embeds: [embed], components: [row], ephemeral: true });
    } catch (err) {
      console.error('[EMBED] Erro ao iniciar sistema:', err);
      return sendErro(message, 'Não foi possível iniciar o sistema de criação de mensagem.');
    }
  }
};

function sendErro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(`${emojiDiscord.error} ${texto}`);

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
