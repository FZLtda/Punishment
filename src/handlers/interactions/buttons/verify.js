const { EmbedBuilder } = require('discord.js');
const { check, attent } = require('../../config/emoji.json');
const { green } = require('../../config/colors.json');
const logger = require('../../utils/logger');
const { userAlreadyVerified, markUserVerified } = require('../../utils/verifyUtils');

async function handleVerify(interaction) {
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
}

module.exports = { handleVerify };
