const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Mostra informações sobre comandos',
  usage: '.help [comando]',
  permissions: 'Nenhuma', 
  execute: async (message, args, { client }) => {
    
    if (!client.commands || client.commands.size === 0) {
      return message.reply({
        content: '⚠️ Os comandos não foram carregados corretamente. Verifique a configuração do bot.',
        ephemeral: true,
      });
    }

    
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = client.commands.get(commandName);

      if (!command) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({
            name: 'Parece que esse comando não está registrado.',
            iconURL: 'http://bit.ly/4aIyY9j',
          });

        return message.reply({ embeds: [embedErroMinimo] });
      }

      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Informações do Comando: \`${command.name}\``)
        .setDescription(command.description || 'Nenhuma descrição disponível.')
        .addFields(
          { name: 'Uso', value: command.usage || 'Não especificado.' },
          { name: 'Permissões Necessárias', value: command.permissions || 'Nenhuma' }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: client.user ? client.user.displayAvatarURL() : 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embed] });
    }

   
    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('💡 Comandos Principais')
      .addFields(
        { name: 'help', value: 'Mostra a lista completa de comandos ou informações detalhadas sobre um comando.', inline: true },
        { name: 'ping', value: 'Mostra os detalhes da conexão do bot.', inline: true },
        { name: 'privacy', value: 'Exibe a política de privacidade.', inline: true },
        { name: 'shard', value: 'Informações do shard.', inline: true },
        { name: 'stats', value: 'Exibe as estatísticas do bot.', inline: true },
        { name: 'undo', value: 'Desfaz o último comando executado.', inline: true }
      )
      .addFields(
        { name: '\u200b', value: '❓ Use `.help <comando>` para ver mais informações sobre um comando.' },
        { name: '\u200b', value: '📨 Precisa de ajuda? [Servidor de Suporte](https://discord.gg/exemplo)' }
      )
      .setFooter({
        text: 'Punishment',
        iconURL: client.user ? client.user.displayAvatarURL() : 'http://bit.ly/4aIyY9j',
      });

    return message.reply({ embeds: [embed] });
  },
};