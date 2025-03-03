const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'status',
  description: 'Mostra o status de todos os comandos do bot.',
  usage: '${currentPrefix}status',
  permissions: 'Nenhuma',
  async execute(message, args) {
    // Obtém o prefixo atual do servidor (usando o mesmo método do comando de referência)
    const currentPrefix = message.client.prefixDB?.[message.guild.id] || '!';

    // Cria o embed para listar os comandos
    const embed = new EmbedBuilder()
      .setTitle('Status dos Comandos')
      .setColor('#00FF00')
      .setDescription('Aqui está uma lista de todos os comandos disponíveis e suas permissões:')
      .setTimestamp();

    // Itera sobre todos os comandos registrados no bot
    const commands = message.client.commands;
    for (const command of commands.values()) {
      // Substitui ${currentPrefix} no uso do comando pelo prefixo atual
      const usage = command.usage.replace('${currentPrefix}', currentPrefix);

      // Adiciona o comando ao embed
      embed.addFields({
        name: `Comando: ${command.name}`,
        value: `Descrição: ${command.description}\nUso: ${usage}\nPermissões: ${command.permissions || 'Nenhuma'}`,
        inline: false,
      });
    }

    // Envia o embed com a lista de comandos
    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
