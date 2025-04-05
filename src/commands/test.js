const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getPrefix, setPrefix } = require('../utils/prefixes');
module.exports = {
  name: 'customize',
  description: 'Personalize as configurações do bot no servidor.',
  permissions: 'Gerenciar Servidor',
  async execute(message, args, { setPrefix, getPrefix }) {
    // Verifica se o usuário tem permissão para gerenciar o servidor
    if (!message.member.permissions.has('ManageGuild')) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setTitle('❌ Permissão Negada')
        .setDescription('Você precisa da permissão **Gerenciar Servidor** para usar este comando.');

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    // Obter o prefixo atual do servidor
    const currentPrefix = getPrefix(message.guild.id);

    // Cria o embed inicial
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⚙️ Personalização do Bot')
      .setDescription('Use os botões abaixo para personalizar as configurações do bot no servidor.')
      .addFields(
        { name: 'Prefixo Atual', value: `\`${currentPrefix}\``, inline: true },
        { name: 'Mensagens de Boas-Vindas', value: '`Ativado` ou `Desativado`', inline: true },
        { name: 'Sistema Anti-Link', value: '`Ativado` ou `Desativado`', inline: true },
        { name: 'Sistema Anti-Spam', value: '`Ativado` ou `Desativado`', inline: true }
      )
      .setFooter({
        text: `Solicitado por ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

    // Cria os botões
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('change_prefix')
        .setLabel('Alterar Prefixo')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('toggle_welcome')
        .setLabel('Mensagens de Boas-Vindas')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('toggle_antilink')
        .setLabel('Sistema Anti-Link')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('toggle_antispam')
        .setLabel('Sistema Anti-Spam')
        .setStyle(ButtonStyle.Secondary)
    );

    // Envia o embed com os botões
    const messageReply = await message.reply({
      embeds: [embed],
      components: [buttons],
      allowedMentions: { repliedUser: false },
    });

    // Cria um coletor de interações para os botões
    const collector = messageReply.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === message.author.id,
      time: 60000, // 1 minuto
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'change_prefix') {
        await interaction.reply({
          content: 'Digite o novo prefixo que deseja usar (máximo de 5 caracteres):',
          ephemeral: true,
        });

        // Coletor de mensagens para o novo prefixo
        const prefixCollector = message.channel.createMessageCollector({
          filter: (msg) => msg.author.id === message.author.id,
          time: 30000, // 30 segundos
          max: 1,
        });

        prefixCollector.on('collect', (msg) => {
          const newPrefix = msg.content.trim();
          if (newPrefix.length > 5) {
            return msg.reply('❌ O prefixo deve ter no máximo 5 caracteres.');
          }

          // Atualiza o prefixo no banco de dados
          setPrefix(message.guild.id, newPrefix);

          msg.reply(`✅ O prefixo foi alterado com sucesso para: \`${newPrefix}\``);
        });

        prefixCollector.on('end', (collected) => {
          if (collected.size === 0) {
            interaction.followUp({
              content: '❌ Você não respondeu a tempo. Tente novamente.',
              ephemeral: true,
            });
          }
        });
      } else if (interaction.customId === 'toggle_welcome') {
        // Lógica para ativar/desativar mensagens de boas-vindas
        await interaction.reply({
          content: '⚙️ Mensagens de boas-vindas foram ativadas/desativadas.',
          ephemeral: true,
        });
      } else if (interaction.customId === 'toggle_antilink') {
        // Lógica para ativar/desativar o sistema anti-link
        await interaction.reply({
          content: '⚙️ Sistema Anti-Link foi ativado/desativado.',
          ephemeral: true,
        });
      } else if (interaction.customId === 'toggle_antispam') {
        // Lógica para ativar/desativar o sistema anti-spam
        await interaction.reply({
          content: '⚙️ Sistema Anti-Spam foi ativado/desativado.',
          ephemeral: true,
        });
      }
    });

    collector.on('end', () => {
      messageReply.edit({ components: [] }); // Remove os botões após o tempo expirar
    });
  },
};