const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/database');
const { yellow, red } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'warnings',
  description: 'Lista os avisos de um usuário no servidor.',
  usage: '${currentPrefix}warnings <@usuário>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {
    const user = message.mentions.members.first();

    if (!user) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Mencione um usuário para visualizar os avisos.',
          iconURL: icon_attention,
        });

      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const warnings = db
      .prepare('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?')
      .all(user.id, message.guild.id);

    if (!warnings || warnings.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setTitle('Sem Avisos')
        .setDescription(`${user} não possui nenhum aviso registrado.`)
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    let page = 0;

    const generateEmbed = (index) => {
      const warn = warnings[index];
      return new EmbedBuilder()
        .setColor(red)
        .setTitle(`Aviso ${index + 1} de ${warnings.length}`)
        .setDescription(
          `**Motivo:** ${warn.reason}\n` +
          `**Moderador:** <@${warn.moderator_id}>\n` +
          `**Data:** <t:${Math.floor(warn.timestamp / 1000)}:F>`
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('◀️ Anterior').setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId('next').setLabel('Próximo ▶️').setStyle(ButtonStyle.Secondary).setDisabled(warnings.length <= 1),
      new ButtonBuilder()
        .setCustomId('clear_warnings')
        .setLabel('🗑️ Limpar todos')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!message.member.permissions.has('ManageMessages'))
    );

    const msg = await message.channel.send({
      embeds: [generateEmbed(page)],
      components: [row],
      allowedMentions: { repliedUser: false },
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 120000,
    });

    collector.on('collect', async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === 'prev') {
        page--;
      } else if (interaction.customId === 'next') {
        page++;
      } else if (interaction.customId === 'clear_warnings') {
        db.prepare('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?').run(user.id, message.guild.id);

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor(yellow)
              .setTitle('Avisos Removidos')
              .setDescription(`Todos os avisos de ${user} foram removidos com sucesso.`)
              .setFooter({
                text: message.author.username,
                iconURL: message.author.displayAvatarURL(),
              })
              .setTimestamp()
          ],
          components: [],
        });
        collector.stop();
        return;
      }

      await interaction.update({
        embeds: [generateEmbed(page)],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('◀️ Anterior')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Próximo ▶️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === warnings.length - 1),
            new ButtonBuilder()
              .setCustomId('clear_warnings')
              .setLabel('🗑️ Limpar todos')
              .setStyle(ButtonStyle.Danger)
              .setDisabled(!message.member.permissions.has('ManageMessages'))
          )
        ],
      });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => null);
    });
  },
};
