const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const rulesConfig = require('../../commands/automod/rulesConfig');
const { COLORS, MESSAGES } = require('../../config/constants');
const logger = require('../../utils/logger');

module.exports = {
  name: 'automod',
  description: 'Gerencia as configurações do AutoMod no servidor.',
  userPermissions: ['ManageGuild'],
  botPermissions: ['ManageGuild'],
  async execute(message, args, { db }) {
    logger.info(`[AutoMod] Comando executado por ${message.author.tag} no servidor ${message.guild.name} (${message.guild.id}).`);

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(MESSAGES.AUTOMOD.TITLE)
      .setDescription(MESSAGES.AUTOMOD.DESCRIPTION);

    const buttons = new ActionRowBuilder().addComponents(
      rulesConfig.map((rule) =>
        new ButtonBuilder()
          .setCustomId(`automod_toggle_${rule.id}`) // Prefixo exclusivo
          .setLabel(rule.name)
          .setStyle(ButtonStyle.Primary)
      )
    );

    const reply = await message.reply({ embeds: [embed], components: [buttons] });

    const collector = reply.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
      const rule = rulesConfig.find((r) => interaction.customId === `automod_toggle_${r.id}`);
      if (rule) {
        await rule.handler(interaction, db);
      }
    });

    collector.on('end', () => {
      reply.edit({
        components: [],
        content: '⏳ O menu de configurações expirou. Use o comando novamente para reabrir.',
      });
    });
  },
};