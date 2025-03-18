const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'sendmessage',
  description: 'Envie uma mensagem simples ou em embed para um canal',
  async execute(interaction) {
    // Verifica se o usuário tem permissão para enviar mensagens
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    // Coleta os argumentos do comando
    const args = interaction.options.getString('mensagem');
    const canalId = interaction.options.getChannel('canal');

    if (!args || !canalId) {
      return interaction.reply({ content: 'Por favor, forneça a mensagem e o canal para envio.', ephemeral: true });
    }

    // Verifica se o usuário quer enviar uma mensagem em embed
    if (args.toLowerCase() === 'embed') {
      const embedMessage = new MessageEmbed()
        .setColor('#00FF00')
        .setTitle('Mensagem Enviada em Embed')
        .setDescription('Aqui está a mensagem solicitada.')
        .addField('Mensagem:', args.slice(6)); // Ignora a palavra 'embed'

      await canalId.send({ embeds: [embedMessage] });
      return interaction.reply({ content: 'Mensagem em embed enviada com sucesso!', ephemeral: true });
    }

    // Caso contrário, envia uma mensagem simples
    await canalId.send(args);
    return interaction.reply({ content: 'Mensagem simples enviada com sucesso!', ephemeral: true });
  }
};
