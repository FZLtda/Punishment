const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = './data/antilink.json';

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}));
}

module.exports = {
  name: 'antilink',
  description: 'Ativa ou desativa o sistema de bloqueio de links no servidor.',
  usage: '.antilink [on/off]',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const option = args[0]?.toLowerCase();
    const guildId = message.guild.id;

    if (!['on', 'off'].includes(option)) {
      return message.reply(
        '<:no:1122370713932795997> Uso incorreto! Use `.antilink on` para ativar ou `.antilink off` para desativar o sistema de bloqueio de links.'
      );
    }

    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));

    if (option === 'on') {
      settings[guildId] = { enabled: true };
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('<:on:1232142357848260639> Antilink Ativado')
        .setDescription('O sistema de bloqueio de links foi ativado neste servidor.')
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    if (option === 'off') {
      delete settings[guildId];
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle('<:emoji_51:1248416468819906721> Antilink Desativado')
        .setDescription('O sistema de bloqueio de links foi desativado neste servidor.')
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }
  },

  startAntilinkListener(client) {
    if (this.listenerRegistered) return; 
    this.listenerRegistered = true;

    client.on('messageCreate', async (message) => {
      const settings = JSON.parse(fs.readFileSync(path, 'utf8'));
      const isAntilinkEnabled = settings[message.guild?.id]?.enabled;

      if (!isAntilinkEnabled || !message.guild || message.author.bot) return;

      const linkRegex = /(https?:\/\/|www\.)\S+/gi;

      if (linkRegex.test(message.content)) {
        if (message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        try {
          await message.delete();

          const reply = await message.channel.send(
            `<:no:1122370713932795997> ${message.author}, links não são permitidos neste servidor.`
          );

          setTimeout(() => reply.delete().catch(() => null), 5000);
        } catch (error) {
          console.error('Erro ao excluir a mensagem:', error);
        }
      }
    });
  },
};