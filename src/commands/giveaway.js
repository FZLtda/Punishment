const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

const giveaways = new Map();

module.exports = {
  name: 'giveaway',
  description: 'Gerencia sorteios no servidor.',
  usage: '.giveaway <start|end> <tempo> <vencedores> <prêmio>',
  permissions: 'Gerenciar Servidor',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply({ content: 'Você não tem permissão para gerenciar sorteios.', ephemeral: true });
    }

    if (!args.length) {
      return message.reply('Uso correto: `.giveaway <start|end> <tempo> <vencedores> <prêmio>`');
    }

    const subcommand = args.shift().toLowerCase();

    if (subcommand === 'start') {
      if (args.length < 3) {
        return message.reply('Uso correto: `.giveaway start <tempo> <vencedores> <prêmio>`');
      }

      const duration = ms(args[0]);
      const winnersCount = parseInt(args[1]);
      const prize = args.slice(2).join(' ');

      if (isNaN(duration) || duration <= 0) {
        return message.reply('O tempo do sorteio deve ser válido, ex: `1h`, `30m`, `2d`.');
      }
      if (isNaN(winnersCount) || winnersCount < 1) {
        return message.reply('O número de vencedores deve ser pelo menos `1`.');
      }

      
      const embed = new EmbedBuilder()
        .setTitle('🎉 Sorteio Iniciado!')
        .setDescription(`🎁 **Prêmio:** ${prize}\n⏳ **Duração:** ${args[0]}\n🏆 **Vencedores:** ${winnersCount}\n\nClique no botão para participar!`)
        .setColor('#FFD700')
        .setFooter({ text: `Iniciado por ${message.author.tag}` })
        .setTimestamp(Date.now() + duration);

      
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('join_giveaway')
          .setLabel('🎟️ Participar')
          .setStyle(ButtonStyle.Success)
      );

      const giveawayMessage = await message.channel.send({ embeds: [embed], components: [row] });

      
      giveaways.set(giveawayMessage.id, {
        messageId: giveawayMessage.id,
        channelId: message.channel.id,
        guildId: message.guild.id,
        prize,
        winnersCount,
        endTime: Date.now() + duration,
        participants: [],
      });

      
      message.delete().catch(() => null);

      
      setTimeout(() => finalizeGiveaway(giveawayMessage.id, message.client), duration);
    }

    if (subcommand === 'end') {
      if (!args.length) {
        return message.reply('Uso correto: `.giveaway end <ID da mensagem>`');
      }

      const messageId = args[0];
      const giveaway = giveaways.get(messageId);

      if (!giveaway) {
        return message.reply('Nenhum sorteio encontrado com esse ID.');
      }

      finalizeGiveaway(messageId, message.client);

      
      message.delete().catch(() => null);
    }
  },
};


async function finalizeGiveaway(messageId, client) {
  const giveaway = giveaways.get(messageId);
  if (!giveaway) return;

  const channel = await client.channels.fetch(giveaway.channelId);
  if (!channel) return;

  const giveawayMessage = await channel.messages.fetch(giveaway.messageId);
  if (!giveawayMessage) return;

  const winners = giveaway.participants.sort(() => Math.random() - 0.5).slice(0, giveaway.winnersCount);

  const embed = EmbedBuilder.from(giveawayMessage.embeds[0])
    .setTitle('🎉 Sorteio Encerrado!')
    .setColor('#FF5733')
    .setDescription(`🎁 **Prêmio:** ${giveaway.prize}\n🏆 **Vencedores:** ${winners.length ? winners.map((w) => `<@${w}>`).join(', ') : 'Nenhum vencedor'}`);

  giveawayMessage.edit({ embeds: [embed], components: [] });

  giveaways.delete(messageId);

  if (winners.length) {
    channel.send(`🎊 Parabéns ${winners.map((w) => `<@${w}>`).join(', ')}! Vocês ganharam **${giveaway.prize}**!`);
  } else {
    channel.send('😢 Nenhum vencedor foi selecionado.');
  }
}
