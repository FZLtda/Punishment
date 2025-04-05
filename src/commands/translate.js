const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

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
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Uso incorreto! O comando correto é: `.translate [idioma_destino] [texto]`.\nExemplo: `.translate en Olá, como vai?`',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const targetLanguage = args.shift().toLowerCase();
    const textToTranslate = args.join(' ');

    try {
      const apiUrl = process.env.API_URL_TRANSLATE;
      const apiKey = process.env.DEEPL_API_KEY;

      const response = await fetch(
        `${apiUrl}/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(textToTranslate)}&target_lang=${targetLanguage}`
      );

      const data = await response.json();

      if (data.translations) {
        const translatedText = data.translations[0].text;

        const translateEmbed = new EmbedBuilder()
          .setColor('#fe3838')
          .setTitle('<:1000046512:1340411258427408444> Tradução')
          .setDescription(`\`\`\`\n${translatedText}\n\`\`\``)
          .setFooter({
            text: `${message.author.tag}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        const sentMessage = await message.channel.send({ embeds: [translateEmbed] });

        if (message.deletable) {
          await message.delete();
        }

        setTimeout(() => {
          sentMessage.delete().catch((err) => console.error('Erro ao apagar a mensagem:', err));
        }, 60 * 1000);
      } else {
        throw new Error('Erro ao processar a tradução.');
      }
    } catch (error) {
      console.error('Erro ao traduzir o texto:', error);

      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Não foi possível traduzir o texto devido a um erro.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
