const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { TERMS, check } = require('@config');
const logger = require('@utils/logger');

const Terms = require('@models/Terms');

async function checkTerms(context) {
  const user = context.user || context.author;
  if (!user || !user.id) {
    logger.warn('checkTerms: Contexto sem usuário válido.');
    return false;
  }

  const userId = user.id;

  try {
    // [Verifica se o usuário já aceitou os termos]
    const alreadyAccepted = await Terms.exists({ userId });

    if (alreadyAccepted) return true;

    // [Caso não tenha aceitado, envia o embed de aceitação]
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
    logger.error(`checkTerms: Erro ao verificar ou enviar termos: ${err.message}`, {
      stack: err.stack,
    });
  }

  return false;
}

module.exports = { checkTerms };
