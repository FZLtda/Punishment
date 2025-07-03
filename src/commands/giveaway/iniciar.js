'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const ms = require('ms');
const { colors, emojis } = require('@config');
const logger = require('@logger');

module.exports = {
  name: 'sorteio',
  description: 'Cria um novo sorteio no canal especificado.',
  usage: '${currentPrefix}sorteio "<prêmio>" <vencedores> <duração> <#canal>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages', 'AddReactions'],
  deleteMessage: true,

  async execute(message, args) {
    const conteudo = message.content.trim();
    
    // Regex aceita aspas duplas, curvas e espaços flexíveis
    const regex = /["“”](.+?)["“”]\s+(\d+)\s+([^\s]+)\s+<#(\d+)>/;
    const match = conteudo.match(regex);

    if (!match) {
      logger.warn(`Formato inválido por ${message.author.tag} (${message.author.id})`);
      return sendError(message, `Formato inválido.\nUso correto: \`${this.usage.replace('${currentPrefix}', '!')}\``);
    }

    const [_, premio, vencedoresRaw, duracaoRaw, canalId] = match;

    const vencedores = parseInt(vencedoresRaw, 10);
    const duracao = ms(duracaoRaw);
    const canal = message.guild.channels.cache.get(canalId);

    if (!premio || isNaN(vencedores) || !duracao || !canal) {
      logger.warn(`Dados inválidos recebidos. premio=${premio}, vencedores=${vencedores}, duracao=${duracao}, canal=${canalId}`);
      return sendError(message, 'Um ou mais parâmetros estão inválidos. Verifique se todos os campos foram preenchidos corretamente.');
    }

    if (canal.type !== ChannelType.GuildText) {
      logger.warn(`Canal inválido mencionado (${canalId}) por ${message.author.tag}`);
      return sendError(message, 'O canal mencionado precisa ser um **canal de texto**.');
    }

    const terminaEm = new Date(Date.now() + duracao);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Novo Sorteio Iniciado!')
      .setDescription([
        `**Prêmio:** ${premio}`,
        `**Participação:** Reaja com 🎉`,
        `**Duração:** termina <t:${Math.floor(terminaEm.getTime() / 1000)}:R>`,
      ].join('\n'))
      .setColor(colors.red)
      .setFooter({ text: `Serão ${vencedores} vencedor(es)!`, iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    try {
      const sorteioMsg = await canal.send({ embeds: [embed] });
      await sorteioMsg.react('🎉');

      await Giveaway.create({
        guildId: message.guild.id,
        channelId: canal.id,
        messageId: sorteioMsg.id,
        prize: premio,
        winners: vencedores,
        endsAt: terminaEm,
        createdBy: message.author.id
      });

      const confirm = `${emojis.success} Sorteio criado com sucesso em ${canal}!`;
      logger.info(`Sorteio criado por ${message.author.tag} | Prêmio: "${premio}" | Vencedores: ${vencedores} | Canal: ${canal.name}`);
      return message.channel.send({ content: confirm, allowedMentions: { repliedUser: false } });

    } catch (err) {
      logger.error(`Erro inesperado ao criar sorteio: ${err.stack || err.message}`);
      return sendError(message, 'Não foi possível criar o sorteio devido a um erro interno. Tente novamente mais tarde.');
    }
  }
};

// Função utilitária de erro
function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(`${emojis.error} ${texto}`);
    
  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
