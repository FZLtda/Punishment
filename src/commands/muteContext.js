const { ApplicationCommandType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logModerationAction } = require('../../utils/moderationUtils');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

// Tempo padrão de mute
const DEFAULT_DURATION = '10m';

module.exports = {
  name: 'Mutar Usuário',
  type: ApplicationCommandType.Message,
  default_member_permissions: PermissionFlagsBits.ModerateMembers,

  async execute(interaction) {
    const message = interaction.targetMessage;
    const membro = message.member;

    if (!membro) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
              name: 'Não foi possível identificar o autor da mensagem.',
              iconURL: icon_attention
            })
        ],
        ephemeral: true
      });
    }

    if (!membro.moderatable) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
              name: 'Este usuário não pode ser silenciado devido às permissões.',
              iconURL: icon_attention
            })
        ],
        ephemeral: true
      });
    }

    const duracaoMs = convertToMilliseconds(DEFAULT_DURATION);
    const motivo = `Mutado via comando de contexto por ${interaction.user.tag}`;

    try {
      await membro.timeout(duracaoMs, motivo);

      logModerationAction(
        interaction.guild.id,
        interaction.user.id,
        'Mute (Context)',
        membro.id,
        motivo
      );

      const embed = new EmbedBuilder()
        .setTitle('<:Mutado:1355700779859574954> Punição aplicada')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi mutado(a)!`)
        .addFields(
          { name: 'Duração', value: `\`${DEFAULT_DURATION}\``, inline: true },
          { name: 'Motivo', value: `\`${motivo}\``, inline: true }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(yellow)
            .setAuthor({
              name: 'Ocorreu um erro ao tentar aplicar o mute.',
              iconURL: icon_attention
            })
        ],
        ephemeral: true
      });
    }
  }
};

function convertToMilliseconds(tempo) {
  const regex = /^(\d+)([smhd])$/;
  const match = tempo.match(regex);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  switch (unidade) {
    case 's': return valor * 1000;
    case 'm': return valor * 60 * 1000;
    case 'h': return valor * 60 * 60 * 1000;
    case 'd': return valor * 24 * 60 * 60 * 1000;
    default: return null;
  }
        }
