require('dotenv').config(); // Carrega variáveis de ambiente primeiro

const { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder 
} = require('discord.js');

const { sucess, error, attent, check } = require('../config/emoji.json');
const { green, yellow } = require('../config/colors.json');

const logger = require('../utils/logger');
const { userAlreadyVerified, markUserVerified } = require('../utils/verifyUtils');

async function handleButtonInteraction(interaction, client, db) {
  try {
    // Termos de uso
    if (interaction.customId === 'accept_terms') {
      const command = client.commands.get('acceptTerms');
      if (command) return await command.execute(interaction);

      return interaction.reply({
        content: `${attent} Não foi possível processar os Termos de Uso.`,
        ephemeral: true,
      });
    }

    // Verificação de usuários
    if (interaction.customId === 'verify_user') {
      
      const roleId = process.env.ROLE_ID;
      const logChannelId = process.env.LOG_CHANNEL;

      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (!member) {
        logger.warn(`Membro não encontrado no cache: ${interaction.user.id}`);
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

      try {
        // Atribui cargo se ainda não tem
        if (!temCargo) {
          await member.roles.add(roleId);
          logger.info(`Cargo de verificado atribuído a ${interaction.user.tag} (${interaction.user.id})`);
        }

        // Marca no banco apenas se ainda não foi registrado
        if (!jaRegistrado) {
          await markUserVerified(interaction.user.id);
        }

        await interaction.reply({
          ephemeral: true,
          content: `${check} Você foi verificado com sucesso!`,
        });

        // Log opcional
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const embedLog = new EmbedBuilder()
            .setColor(green)
            .setTitle('Novo usuário verificado')
            .setDescription(`Usuário: <@${interaction.user.id}> (\`${interaction.user.tag}\`)`)
            .setTimestamp();
          await logChannel.send({ embeds: [embedLog] });
        }

        logger.info(`Usuário verificado com sucesso: ${interaction.user.tag} (${interaction.user.id})`);
      } catch (err) {
        logger.error(`Erro ao verificar usuário: ${err.message}`, { stack: err.stack });
        return interaction.reply({
          ephemeral: true,
          content: `${attent} Não foi possível concluir a verificação.`,
        });
      }
      return;
    }

    // Sorteios (Giveaway)
    const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(interaction.message.id);
    if (!giveaway) {
      return interaction.reply({
        content: `${attent} Não há interação vinculada a este botão.`,
        ephemeral: true,
      });
    }

    let participants;
    try {
      participants = JSON.parse(giveaway.participants || '[]');
    } catch (err) {
      logger.error(`Campo "participants" corrompido no sorteio: ${err.message}`);
      return interaction.reply({
        content: `${error} Erro ao carregar participantes.`,
        ephemeral: true,
      });
    }

    if (interaction.customId === 'participar') {
      if (participants.includes(interaction.user.id)) {
        return interaction.reply({
          content: `${attent} Você já está concorrendo neste sorteio!`,
          ephemeral: true,
        });
      }

      participants.push(interaction.user.id);
      db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?')
        .run(JSON.stringify(participants), interaction.message.id);

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
        content: `${sucess} Sua entrada no sorteio foi registrada!`,
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
      content: `${attent} Não foi possível processar sua interação.`,
      ephemeral: true,
    });
  }
}

module.exports = { handleButtonInteraction };
