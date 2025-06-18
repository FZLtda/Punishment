require('dotenv').config();

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const Giveaway = require('../models/Giveaway');
const { sucess, error, attent, check } = require('../config/emoji.json');
const { green, yellow } = require('../config/colors.json');

const logger = require('../utils/logger');
const { userAlreadyVerified, markUserVerified } = require('../utils/verifyUtils');

async function handleButtonInteraction(interaction, client) {
  try {
    if (interaction.customId === 'accept_terms') {
      const command = client.commands.get('acceptTerms');
      if (command) return await command.execute(interaction);
      return interaction.reply({
        content: `${attent} Não foi possível processar os Termos de Uso.`,
        ephemeral: true,
      });
    }

    if (interaction.customId === 'verify_user') {
      const roleId = process.env.ROLE_ID;
      const logChannelId = process.env.LOG_CHANNEL;

      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (!member) {
        logger.warn(`Membro não encontrado: ${interaction.user.id}`);
        return interaction.reply({
          ephemeral: true,
          content: `${attent} Não foi possível encontrar seu usuário no servidor.`,
        });
      }

      const jaRegistrado = await userAlreadyVerified(interaction.user.id);
      const temCargo = member.roles.cache.has(roleId);

      if (jaRegistrado && temCargo) {
        return interaction.reply({
          ephemeral: true,
          content: `${attent} Você já foi verificado anteriormente.`,
        });
      }

      if (!temCargo) await member.roles.add(roleId);
      if (!jaRegistrado) await markUserVerified(interaction.user.id);

      await interaction.reply({
        ephemeral: true,
        content: `${check} Você foi verificado com sucesso!`,
      });

      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const embedLog = new EmbedBuilder()
          .setColor(green)
          .setTitle('Novo usuário verificado')
          .setDescription(`${interaction.user} (\`${interaction.user.id}\`)`)
          .setTimestamp();
        await logChannel.send({ embeds: [embedLog] });
      }

      logger.info(`Usuário verificado: ${interaction.user.tag} (${interaction.user.id})`);
      return;
    }

    // [Sorteio]
    const giveaway = await Giveaway.findOne({
      messageId: interaction.message.id,
      guildId: interaction.guild.id,
      ended: false,
    });

    if (!giveaway) {
      return interaction.reply({
        content: `${attent} Nenhum sorteio ativo encontrado para este botão.`,
        ephemeral: true,
      });
    }

    const participants = giveaway.participants || [];

    if (interaction.customId === 'participar') {
      if (participants.includes(interaction.user.id)) {
        return interaction.reply({
          content: `${attent} Você já está participando deste sorteio.`,
          ephemeral: true,
        });
      }

      participants.push(interaction.user.id);
      giveaway.participants = participants;
      await giveaway.save();

      const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('participar')
          .setLabel('🎟 Participar')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ver_participantes')
          .setLabel(`👥 Participantes: ${participants.length}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      await interaction.update({ components: [updatedRow] });
      return interaction.followUp({
        content: `${sucess} Sua entrada foi registrada! Boa sorte!`,
        ephemeral: true,
      });
    }

    if (interaction.customId === 'ver_participantes') {
      const list = participants.map((id) => `<@${id}>`).join('\n') || 'Nenhum participante.';
      return interaction.reply({
        content: `👥 Participantes (${participants.length}):\n${list}`,
        ephemeral: true,
      });
    }

  } catch (err) {
    logger.error(`ERRO: Interação de botão "${interaction.customId}" falhou: ${err.message}`, {
      stack: err.stack,
    });

    return interaction.reply({
      content: `${attent} Erro ao processar a interação.`,
      ephemeral: true,
    });
  }
}

module.exports = { handleButtonInteraction };
