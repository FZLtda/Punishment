const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Mostra a lista completa de comandos',
  execute: async (message) => {
    
    const pages = [
     
      new EmbedBuilder()
        .setColor(0xff0000) 
        .setTitle('<:1000042770:1335945568136069233> Comandos principais')
        .addFields(
          { name: 'help', value: 'Mostra a lista completa de comandos', inline: true },
          { name: 'ping', value: 'Detalhes da conexão do bot', inline: true },
          { name: 'privacy', value: 'Política de privacidade', inline: true },
          { name: 'shard', value: 'Informações do shard', inline: true },
          { name: 'stats', value: 'Estatísticas do bot', inline: true },
          { name: 'undo', value: 'Desfazer o último comando', inline: true }
        )
        .addFields(
          { name: '\u200b', value: '<:1000042773:1335945498212696085> Use `.help <command>` para exibir mais informações sobre um comando.' },
          { name: '\u200b', value: '<:1000042771:1335945525601505351> Precisa de ajuda com mais alguma coisa? [Support Server](https://discord.gg/EXEMPLO)' }
        )
        .setFooter({ text: 'Punishment • Página 1/6' }),

      
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Comandos de moderação')
        .addFields(
          { name: 'ban', value: 'Bane um membro do servidor.', inline: true },
          { name: 'kick', value: 'Expulsa um membro do servidor.', inline: true },
          { name: 'mute', value: 'Silencia um membro.', inline: true },
          { name: 'unmute', value: 'Remove o silêncio de um membro.', inline: true },
          { name: 'warn', value: 'Adiciona um aviso a um membro.', inline: true },
          { name: 'lock', value: 'Trava o canal atual.', inline: true }
        )
        .setFooter({ text: 'Punishment • Página 2/6' }),

     
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Comandos Utilitários')
        .addFields(
          { name: 'uptime', value: 'Mostra o tempo de atividade do bot.', inline: true },
          { name: 'clear', value: 'Remove mensagens do canal.', inline: true },
          { name: 'serverinfo', value: 'Exibe informações do servidor.', inline: true },
          { name: 'userinfo', value: 'Exibe informações de um membro.', inline: true },
          { name: 'roleinfo', value: 'Exibe informações de um cargo.', inline: true }
        )
        .setFooter({ text: 'Punishment • Página 3/6' }),

      
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Comandos Divertidos')
        .addFields(
          { name: 'joke', value: 'Conta uma piada.', inline: true },
          { name: 'meme', value: 'Envia um meme aleatório.', inline: true },
          { name: '8ball', value: 'Responde perguntas com sim ou não.', inline: true }
        )
        .setFooter({ text: 'Punishment • Página 4/6' }),

      
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Em desenvolvimento')
        .addFields(
          { name: 'xxx', value: 'xxx', inline: true },
          { name: 'xxx', value: 'xxx', inline: true }
        )
        .setFooter({ text: 'Punishment • Página 5/6' }),

     
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Links & Suporte')
        .addFields(
          { name: 'GitHub', value: '[Clique aqui](https://github.com/funczero/punishment)', inline: true },
          { name: 'Adicionar', value: '[Convide o bot](https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=8&scope=bot)', inline: true },
          { name: 'Suporte', value: '[Servidor de Suporte](https://discord.gg/exemplo)', inline: true }
        )
        .setFooter({ text: 'Punishment • Página 6/6' }),
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
