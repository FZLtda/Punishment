const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Exibe a lista de comandos em páginas com botões de navegação.',
  execute: async (message) => {
    
    const pages = [
     
      new EmbedBuilder()
        .setColor(0xff0000) 
        .setTitle('<:home:1335703348686622723> Core Commands')
        .addFields(
          { name: 'help', value: 'Show full command list', inline: true },
          { name: 'ping', value: 'Bot connection details', inline: true },
          { name: 'privacy', value: 'Privacy policy', inline: true },
          { name: 'shard', value: 'Shard information', inline: true },
          { name: 'stats', value: 'Bot statistics', inline: true },
          { name: 'undo', value: 'Undo last command', inline: true }
        )
        .addFields(
          { name: '\u200b', value: '<:info:1335704448651100200> Use `.help <command>` to view more information about a command.' },
          { name: '\u200b', value: '<:discord:1335708434284286115> Need help with anything else? [Support Server](https://discord.gg/EXEMPLO)' }
        )
        .setFooter({ text: 'Punishment • Page 1/6' }),

      
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Moderation Commands')
        .addFields(
          { name: 'ban', value: 'Bane um membro do servidor.', inline: true },
          { name: 'kick', value: 'Expulsa um membro do servidor.', inline: true },
          { name: 'mute', value: 'Silencia um membro.', inline: true },
          { name: 'unmute', value: 'Remove o silêncio de um membro.', inline: true },
          { name: 'warn', value: 'Adiciona um aviso a um membro.', inline: true },
          { name: 'lock', value: 'Trava o canal atual.', inline: true }
        )
        .setFooter({ text: 'Punishment • Page 2/6' }),

     
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Utility Commands')
        .addFields(
          { name: 'uptime', value: 'Mostra o tempo de atividade do bot.', inline: true },
          { name: 'clear', value: 'Remove mensagens do canal.', inline: true },
          { name: 'serverinfo', value: 'Exibe informações do servidor.', inline: true },
          { name: 'userinfo', value: 'Exibe informações de um membro.', inline: true },
          { name: 'roleinfo', value: 'Exibe informações de um cargo.', inline: true }
        )
        .setFooter({ text: 'Punishment • Page 3/6' }),

      
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Fun Commands')
        .addFields(
          { name: 'joke', value: 'Conta uma piada.', inline: true },
          { name: 'meme', value: 'Envia um meme aleatório.', inline: true },
          { name: '8ball', value: 'Responde perguntas com sim ou não.', inline: true }
        )
        .setFooter({ text: 'Punishment • Page 4/6' }),

      
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Info Commands')
        .addFields(
          { name: 'botinfo', value: 'Informações sobre o bot.', inline: true },
          { name: 'stats', value: 'Exibe estatísticas do bot.', inline: true }
        )
        .setFooter({ text: 'Punishment • Page 5/6' }),

     
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Links & Support')
        .addFields(
          { name: 'Source Code', value: '[Clique aqui](https://github.com/funczero/punishment)', inline: true },
          { name: 'Invite', value: '[Convide o bot](https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=8&scope=bot)', inline: true },
          { name: 'Support', value: '[Servidor de Suporte](https://discord.gg/exemplo)', inline: true }
        )
        .setFooter({ text: 'Punishment • Page 6/6' }),
    ];

    
    let page = 0;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⬅️ Anterior')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Próximo ➡️')
        .setStyle(ButtonStyle.Primary)
    );

    
    const messageEmbed = await message.reply({
      embeds: [pages[page]],
      components: [row],
    });

    
    const collector = messageEmbed.createMessageComponentCollector({
      time: 60000,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: 'Somente o autor do comando pode usar os botões.',
          ephemeral: true,
        });
      }

      
      if (interaction.customId === 'next') {
        page = page + 1 < pages.length ? ++page : 0;
      } else if (interaction.customId === 'prev') {
        page = page > 0 ? --page : pages.length - 1;
      }

      await interaction.update({
        embeds: [pages[page]],
        components: [row],
      });
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️ Anterior')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Próximo ➡️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );

      messageEmbed.edit({ components: [disabledRow] });
    });
  },
};
