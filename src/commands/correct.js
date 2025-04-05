const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: 'correct',
  description: 'Corrige erros em um texto utilizando a inteligência da DeepL.',
  usage: '${currentPrefix}correct <texto>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  async execute(message, args) {
    if (args.length === 0) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você precisa fornecer um texto para corrigir.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const textToCorrect = args.join(' ');

    try {
      const apiKey = process.env.DEEPL_API_KEY;

      const responseToEnglish = await fetch(
        `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(
          textToCorrect
        )}&target_lang=EN`
      );

      const englishTranslation = await responseToEnglish.json();

      if (!englishTranslation.translations) {
        throw new Error('Erro ao traduzir para o inglês.');
      }

      const translatedToEnglish = englishTranslation.translations[0].text;

      const responseToPortuguese = await fetch(
        `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(
          translatedToEnglish
        )}&target_lang=PT-BR`
      );

      const portugueseTranslation = await responseToPortuguese.json();

      if (!portugueseTranslation.translations) {
        throw new Error('Erro ao traduzir de volta para o português.');
      }

      const correctedText = portugueseTranslation.translations[0].text;

      const correctionEmbed = new EmbedBuilder()
        .setColor('#0077FF')
        .setTitle('<:emoji_29:1217939003626492026> Texto Corrigido')
        .setDescription(`\`\`\`\n${correctedText}\n\`\`\``)
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const sentMessage = await message.channel.send({ embeds: [correctionEmbed] });

      if (message.deletable) {
        await message.delete();
      }

      setTimeout(() => {
        sentMessage.delete().catch((err) =>
          console.error('Erro ao apagar a mensagem:', err)
        );
      }, 60 * 1000);
    } catch (error) {
      console.error('Erro ao corrigir o texto:', error);
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível corrigir a mensagem fornecida.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
