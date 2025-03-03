const { EmbedBuilder } = require('discord.js');
const commands = require('../commands');

module.exports = {
  name: 'commands',
  description: 'Mostra o status de todos os comandos do bot.',
  usage: '${currentPrefix}commands',
  permissions: 'Nenhuma',
  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle('Status dos Comandos')
      .setColor('#00FF00')
      .setDescription('Aqui está uma lista de todos os comandos disponíveis e suas permissões:')
      .setTimestamp();

    for (const command of Object.values(commands)) {
      embed.addFields({
        name: `Comando: ${command.name}`,
        value: `Descrição: ${command.description}\nPermissões: ${command.permissions || 'Nenhuma'}`,
        inline: false,
      });
    }

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
