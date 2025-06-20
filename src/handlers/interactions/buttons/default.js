require('dotenv').config();

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const Giveaway = require('../../../models/Giveaway');
const Terms = require('../../../models/Terms');
const { sucess, error, attent, check } = require('../../../config/emoji.json');
const { green } = require('../../../config/colors.json');
const logger = require('../../../utils/logger');
const { userAlreadyVerified, markUserVerified } = require('../../../utils/verifyUtils');

module.exports = async function handleButtonInteraction(interaction, client) {
  try {
    const { customId, user, guild, message } = interaction;

    // --- Termos ---
    if (customId === 'accept_terms') {
      const alreadyAccepted = !!(await Terms.exists({ userId: user.id }));

      if (alreadyAccepted) {
        return interaction.reply({
          ephemeral: true,
          content: `${check} Você já aceitou os termos anteriormente.`,
        });
      }

      await Terms.create({ userId: user.id });

      const embed = new EmbedBuilder()
        .setColor(green)
        .setTitle('Termos Aceitos')
        .setDescription(`${check} Você aceitou os Termos de Uso com sucesso!`)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

      logger.info(`Termos aceitos por ${user.tag} (${user.id})`);
      return;
    }

    // --- Verificação ---
    if (customId === 'verify_user') {
      const roleId = process.env.ROLE_ID;
      const logChannelId = process.env.LOG_CHANNEL;

      const member = guild.members.cache.get(user.id);
      if (!member) {
        logger.warn(`Membro não encontrado: ${user.id}`);
        return interaction.reply({
          ephemeral: true,
          content: `${attent} Não foi possível encontrar seu usuário no servidor.`,
        });
      }

      const jaRegistrado = await userAlreadyVerified(user.id);
      const temCargo = member.roles.cache.has(roleId);

      if (jaRegistrado && temCargo) {
        return interaction.reply({
          ephemeral: true,
          content: `${attent} Você já foi verificado anteriormente.`,
        });
      }

      if (!temCargo) await member.roles.add(roleId);
      if (!jaRegistrado) await markUserVerified(user.id);

      await interaction.reply({
        ephemeral: true,
        content: `${check} Você foi verificado com sucesso!`,
      });

      const logChannel = guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const embedLog = new EmbedBuilder()
          .setColor(green)
          .setTitle('Novo usuário verificado')
          .setDescription(`${user} (\`${user.id}\`)`)
          .setTimestamp();

        await logChannel.send({ embeds: [embedLog] });
      }

      logger.info(`Usuário verificado: ${user.tag} (${user.id})`);
      return;
    }

    // --- Sorteios ---
    const giveaway = await Giveaway.findOne({
      messageId: message.id,
      guildId: guild.id,
      ended: false,
    });

    if (!giveaway) {
      return interaction.reply({
        content: `${attent} Nenhum sorteio ativo encontrado para este botão.`,
        ephemeral: true,
      });
    }

    const participants = giveaway.participants || [];

    // Participar
    if (customId === 'participar') {
      if (participants.includes(user.id)) {
        return interaction.reply({
          content: `${attent} Você já está participando deste sorteio.`,
          ephemeral: true,
        });
      }

      participants.push(user.id);
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
          .setStyle(ButtonStyle.Second
