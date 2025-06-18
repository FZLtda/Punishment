const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { TERMS } = require('../config/settings.json');
const { check } = require('../config/emoji.json');
const logger = require('../utils/logger');

const Terms = require('../models/Terms');

async function checkTerms(context) {
  const user = context.user || context.author;
  if (!user || !user.id) {
    logger.warn('checkTerms: Contexto sem usuário válido.');
    return false;
  }

  const userId = user.id;

  // [Verifica no MongoDB se o usuário já aceitou os termos] FZ
  const accepted = await Terms.exists({ userId });
  if (accepted) return true;

  const embed = new EmbedBuilder()
    .setColor('#FE3838')
    .setTitle('Termos de Uso')
    .setDescription(
      'Antes de continuar, é necessário aceitar nossos **Termos de Uso**.\n\nClique em **Ler Termos** para visualizar o conteúdo, e em **Aceitar Termos** se estiver de acordo.'
    )
    .setFooter({
      text: 'Punishment by FuncZero',
      iconURL: context.client?.user?.displayAvatarURL() ?? null,
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_terms')
      .setLabel('Aceitar Termos')
      .setStyle(ButtonStyle.Success)
      .setEmoji(check),
    new ButtonBuilder()
      .setLabel('Ler Termos')
      .setStyle(ButtonStyle.Link)
      .setURL(TERMS)
  );

  try {
    if (context.reply && typeof context.reply === 'function') {
      await context.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
        allowedMentions: { repliedUser: false },
      });
    } else if (context.channel?.send) {
      await context.channel.send({
        embeds: [embed],
        components: [row],
        allowedMentions: { repliedUser: false },
      });
    } else {
      logger.warn('checkTerms: Contexto não pôde enviar a mensagem.');
    }
  } catch (err) {
    logger.error(`checkTerms: Falha ao enviar embed de termos: ${err.message}`, { stack: err.stack });
  }

  return false;
}

module.exports = { checkTerms };
