const { EmbedBuilder } = require('discord.js');
const commands = require('../commands'); // Supondo que todos os comandos estejam em um diretório 'commands'

module.exports = {
  name: 'status',
  description: 'Mostra o status de todos os comandos do bot.',
  usage: '${currentPrefix}status', // O prefixo será substituído dinamicamente
  permissions: 'Nenhuma',
  async execute(message, args) {
    // Obtém o prefixo atual do servidor (usando o mesmo método do seu comando de referência)
    const currentPrefix = message.client.prefixDB[message.guild.id] || '!';

    const embed = new EmbedBuilder()
      .setTitle('Status dos Comandos')
      .setColor('#00FF00')
      .setDescription('Aqui está uma lista de todos os comandos disponíveis e suas permissões:')
      .setTimestamp();

    // Itera sobre todos os comandos e adiciona ao embed
    for (const command of Object.values(commands)) {
      // Substitui ${currentPrefix} no uso do comando pelo prefixo atual
      const usage = command.usage.replace('${currentPrefix}', currentPrefix);

      embed.addFields({
        name: `Comando: ${command.name}`,
        value: `Descrição: ${command.description}\nUso: ${usage}\nPermissões: ${command.permissions || 'Nenhuma'}`,
        inline: false,
      });
    }

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
