const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'deletechannel',
  description: 'Exclui um canal do servidor.',
  usage: '${currentPrefix}deletechannel [canal]',
  permissions: 'Gerenciar Canais',
  async execute(message, args) {
  
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const embedErroPerm = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não tem permissão para excluir canais.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroPerm], allowedMentions: { repliedUser: false } });
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

    if (!channel) {
      const embedErroCanal = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Canal não encontrado! Mencione um canal ou forneça um ID válido.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroCanal], allowedMentions: { repliedUser: false } });
    }

    const canaisProtegidos = ["regras", "anúncios", "staff"];
    if (canaisProtegidos.includes(channel.name.toLowerCase())) {
      const embedProtegido = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Este canal é protegido e não pode ser excluído.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedProtegido], allowedMentions: { repliedUser: false } });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const embedErroBot = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Eu não tenho permissão para excluir canais!',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroBot], allowedMentions: { repliedUser: false } });
    }

    const embedConfirmacao = new EmbedBuilder()
      .setColor('Yellow')
      .setTitle('<:1000050074:1345954801304731710> Confirmação Necessária')
      .setDescription(`Tem certeza que deseja excluir o canal **${channel.name}**? Responda com **sim** em até 10 segundos.`);

    await message.reply({ embeds: [embedConfirmacao], allowedMentions: { repliedUser: false } });

    try {
      const filter = (msg) => msg.author.id === message.author.id && msg.content.toLowerCase() === "sim";
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ["time"] });

      if (collected) {
        await channel.delete();

        const embedSucesso = new EmbedBuilder()
          .setColor('Green')
          .setTitle('<:1000042885:1336044571125354496> Canal Excluído')
          .setDescription(`O canal **${channel.name}** foi excluído com sucesso!`);

        await message.channel.send({ embeds: [embedSucesso] });
      }
    } catch (error) {
      console.error("Erro ao excluir canal:", error);

      const embedTempoEsgotado = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Tempo esgotado! Cancelando a exclusão.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      await message.channel.send({ embeds: [embedTempoEsgotado] });
    }
  },
};
