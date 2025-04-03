const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'test',
  description: 'Exibe todos os comandos disponíveis e suas informações.',
  usage: '${currentPrefix}help',
  permissions: 'Enviar Mensagens',
  execute: async (message) => {
    try {
      const commands = message.client.commands;
      const commandsPerPage = 10; // Número de comandos por página
      const totalPages = Math.ceil(commands.size / commandsPerPage);

      // Função para criar o embed de uma página específica
      const generateEmbed = (page) => {
        const start = (page - 1) * commandsPerPage;
        const end = start + commandsPerPage;
        const commandList = Array.from(commands.values()).slice(start, end);

        const embed = new EmbedBuilder()
          .setColor('#3498DB')
          .setTitle('📚 Lista de Comandos')
          .setDescription(
            'Use `${currentPrefix}help [comando]` para obter mais detalhes sobre um comando específico.'
          )
          .setFooter({
            text: `Página ${page} de ${totalPages} • Solicitado por ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        commandList.forEach((cmd) => {
          embed.addFields({
            name: cmd.name,
            value: `\`${cmd.description || 'Sem descrição'}\``,
            inline: false,
          });
        });

        return embed;
      };

      // Função para criar os botões de navegação
      const generateButtons = (page) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('first')
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 1),
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 1),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages),
          new ButtonBuilder()
            .setCustomId('last')
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages)
        );
      };

      // Página inicial
      let currentPage = 1;
      const embedMessage = await message.channel.send({
        embeds: [generateEmbed(currentPage)],
        components: [generateButtons(currentPage)],
      });

      // Criar um coletor de interações para os botões
      const collector = embedMessage.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 60000, // 1 minuto
      });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'first') currentPage = 1;
        if (interaction.customId === 'previous') currentPage--;
        if (interaction.customId === 'next') currentPage++;
        if (interaction.customId === 'last') currentPage = totalPages;

        await interaction.update({
          embeds: [generateEmbed(currentPage)],
          components: [generateButtons(currentPage)],
        });
      });

      collector.on('end', () => {
        embedMessage.edit({
          components: [], // Remove os botões após o tempo expirar
        });
      });
    } catch (error) {
      console.error('[ERROR] Falha ao executar o comando help:', error);
      return message.reply({
        content: '❌ Ocorreu um erro ao tentar exibir os comandos.',
        allowedMentions: { repliedUser: false },
      });
    }
  },
};