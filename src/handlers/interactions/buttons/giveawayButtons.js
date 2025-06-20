const Giveaway = require('../../../models/Giveaway');
const {
  gerarComponentesInterativos,
  gerarMensagemVencedores,
} = require('../../../utils/giveawayUtils');
const { sucess, attent } = require('../../../config/emoji.json');
const logger = require('../../../utils/logger');

module.exports = async function handleGiveawayButtons(interaction, client) {
  try {
    const { customId, message, user, guild } = interaction;

    // Apenas botões relacionados a sorteio
    if (!['participar', 'ver_participantes'].includes(customId)) return;

    const sorteio = await Giveaway.findOne({
      messageId: message.id,
      guildId: guild.id,
      ended: false,
    });

    if (!sorteio) {
      return interaction.reply({
        content: `${attent} Este sorteio já foi encerrado ou não existe.`,
        ephemeral: true,
      });
    }

    const participantes = sorteio.participants || [];

    if (customId === 'participar') {
      if (participantes.includes(user.id)) {
        return interaction.reply({
          content: `${attent} Você já está participando deste sorteio.`,
          ephemeral: true,
        });
      }

      participantes.push(user.id);
      sorteio.participants = participantes;
      await sorteio.save();

      const rowAtualizada = gerarComponentesInterativos(participantes.length);

      await interaction.update({ components: [rowAtualizada] });

      return interaction.followUp({
        content: `${sucess} Sua participação foi registrada com sucesso! Boa sorte 🍀`,
        ephemeral: true,
      });
    }

    if (customId === 'ver_participantes') {
      const lista = participantes.map(id => `<@${id}>`).join('\n') || 'Nenhum participante.';

      return interaction.reply({
        content: `👥 Participantes (${participantes.length}):\n${lista}`,
        ephemeral: true,
      });
    }
  } catch (err) {
    logger.error(`Erro nos botões do sorteio: ${err.message}`, { stack: err.stack });
    return interaction.reply({
      content: `${attent} Ocorreu um erro ao processar sua interação.`,
      ephemeral: true,
    });
  }
};
