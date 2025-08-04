'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const Giveaway = require('@models/Giveaway');
const { colors, emojis } = require('@config');
const logger = require('@logger');
const ms = require('ms');

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

    // Regex: aspas duplas ou curvas + espaço flexível
    const regex = /["“”](.+?)["“”]\s+(\d+)\s+([^\s]+)\s+<#(\d+)>/;
    const match = conteudo.match(regex);

    if (!match) {
      logger.warn(`[SORTEIO] Formato inválido por ${message.author.tag} (${message.author.id})`);
      return sendWarning(message,`Formato inválido.\nUso correto: \`${this.usage.replace('${currentPrefix}', '.')}\``
      );
    }

    const [_, premio, vencedoresRaw, duracaoRaw, canalId] = match;
    const vencedores = parseInt(vencedoresRaw, 10);
    const duracao = ms(duracaoRaw);
    const canal = message.guild.channels.cache.get(canalId);

    if (!premio || isNaN(vencedores) || !duracao || !canal) {
      logger.warn(
        `[SORTEIO] Dados inválidos recebidos por ${message.author.tag} (${message.author.id}) | prêmio=${premio}, vencedores=${vencedores}, duração=${duracaoRaw}, canal=${canalId}`
      );
      return sendWarning(message, 'Um ou mais parâmetros são inválidos. Verifique se todos os campos foram preenchidos corretamente.');
    }

    if (canal.type !== ChannelType.GuildText) {
      logger.warn(`[SORTEIO] Canal inválido mencionado (${canalId}) por ${message.author.tag}`);
      return sendWarning(message, 'O canal mencionado precisa ser um **canal de texto**.');
    }

    const terminaEm = new Date(Date.now() + duracao);
    const plural = vencedores === 1 ? 'vencedor' : 'vencedores';

    const embed = new EmbedBuilder()
      .setTitle('🎉 Novo Sorteio Iniciado!')
      .setDescription([
        `**Prêmio:** ${premio}`,
        `**Participação:** Reaja com 🎉`,
        `**Duração:** termina <t:${Math.floor(terminaEm.getTime() / 1000)}:R>`
      ].join('\n'))
      .setColor(colors.red)
      .setFooter({
        text: `Ser${vencedores === 1 ? 'á' : 'ão'} ${vencedores} ${plural}`,
        iconURL: message.client.user.displayAvatarURL()
      })
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

      const confirm = `${emojis.successEmoji} Sorteio criado com sucesso em ${canal}!`;
      logger.info(`[SORTEIO] Criado por ${message.author.tag} | Prêmio: "${premio}" | Vencedores: ${vencedores} | Canal: ${canal.name}`);
      return message.channel.send({ content: confirm, allowedMentions: { repliedUser: false } });

    } catch (err) {
      logger.error(`[SORTEIO] Erro ao criar sorteio: ${err.stack || err.message}`);
      return sendWarning(message, 'Não foi possível criar o sorteio devido a um erro interno. Tente novamente mais tarde.');
    }
  }
};
