const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../data/verificationConfig.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({}), { flag: 'wx' });
}

module.exports = {
  name: 'config-verificação',
  description: 'Configura o sistema de verificação.',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('Configuração de Verificação')
      .setDescription(
        'Use os botões abaixo para personalizar seu sistema de verificação.\n\n' +
        '- **Mensagem**: Personalize o texto da mensagem de verificação.\n' +
        '- **Cor da Embed**: Defina a cor da embed.\n' +
        '- **Botão**: Altere o nome, emoji e cor do botão.'
      )
      .setColor('#00FF00');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('set_message')
          .setLabel('Mensagem')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('set_color')
          .setLabel('Cor da Embed')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('set_button')
          .setLabel('Botão')
          .setStyle(ButtonStyle.Success)
      );

    await message.reply({ embeds: [embed], components: [row] });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'set_message') {
        await interaction.reply('Envie a nova mensagem de verificação:');
        const msgCollector = message.channel.createMessageCollector({ filter, max: 1, time: 30000 });
        msgCollector.on('collect', (msg) => {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config.message = msg.content;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          msg.reply('Mensagem de verificação atualizada com sucesso!');
        });
      }

      if (interaction.customId === 'set_color') {
        await interaction.reply('Envie o código hexadecimal da cor (ex: `#FF0000`):');
        const msgCollector = message.channel.createMessageCollector({ filter, max: 1, time: 30000 });
        msgCollector.on('collect', (msg) => {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config.color = msg.content;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          msg.reply('Cor da embed atualizada com sucesso!');
        });
      }

      if (interaction.customId === 'set_button') {
        await interaction.reply('Envie o texto do botão (ex: `Verificar`) e o emoji (opcional):');
        const msgCollector = message.channel.createMessageCollector({ filter, max: 1, time: 30000 });
        msgCollector.on('collect', (msg) => {
          const [text, emoji] = msg.content.split(' ');
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config.button = { text, emoji: emoji || null };
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          msg.reply('Botão de verificação atualizado com sucesso!');
        });
      }
    });
  },
};