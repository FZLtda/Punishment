const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'translate',
  description: 'Traduz um texto para o idioma especificado.',
  usage: '${currentPrefix}translate <idioma_destino> <texto>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    if (args.length < 2) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Uso incorreto! O comando correto é: `.translate [idioma_destino] [texto]`.\nExemplo: `.translate en Olá, como vai?`',
          iconURL: emojis.attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const targetLanguage = args.shift().toLowerCase();
    const textToTranslate = args.join(' ');
    const apiUrl = process.env.API_URL_TRANSLATE;
    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('[Translate] API_URL_TRANSLATE ou DEEPL_API_KEY não definidas!');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'Configuração da API está incompleta.',
            iconURL: emojis.attention
          })],
        allowedMentions: { repliedUser: false }
      });
    }

    try {
      const response = await fetch(
        `${apiUrl}/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(textToTranslate)}&target_lang=${targetLanguage}`
      );

      const data = await response.json();

      if (!response.ok || !data.translations?.length) {
        throw new Error(`Resposta inválida da API: ${JSON.stringify(data)}`);
      }

      const translatedText = data.translations[0].text;

      const translateEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(':1000046512: Tradução')
        .setDescription(`\`\`\`\n${translatedText}\n\`\`\``)
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      const sentMessage = await message.channel.send({ embeds: [translateEmbed] });

      if (message.deletable) {
        await message.delete();
      }

      setTimeout(() => {
        sentMessage.delete().catch(err =>
          console.error('[Translate] Falha ao apagar resposta:', err)
        );
      }, 60_000);

    } catch (error) {
      console.error('[Translate] Erro ao traduzir:', error);

      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível traduzir o texto devido a um erro.',
          iconURL: emojis.attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
