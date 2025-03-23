const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

module.exports = {
  name: 'translatefile',
  description: 'Traduz o conteúdo de um arquivo para o idioma especificado.',
  usage: '${currentPrefix}translatefile <idioma_destino> <arquivo>',
  permissions: 'Enviar Mensagens',
  async execute(message, args) {
    if (!message.attachments.first()) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa enviar um arquivo para tradução junto com este comando.',
          iconURL: 'https://bit.ly/43PItSI',
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (args.length === 0) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa especificar o idioma de destino. Exemplo: `.translatefile en`',
          iconURL: 'https://bit.ly/43PItSI',
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const targetLanguage = args[0].toUpperCase();
    const attachment = message.attachments.first();

    try {
      const fileResponse = await fetch(attachment.url);
      const fileBuffer = await fileResponse.buffer();

      const apiUrl = process.env.API_URL_DOCUMENT;
      const apiKey = process.env.DEEPL_API_KEY;

      const form = new FormData();
      form.append('auth_key', apiKey);
      form.append('target_lang', targetLanguage);
      form.append('file', fileBuffer, attachment.name);

      const uploadResponse = await fetch(`${apiUrl}/v2/document`, {
        method: 'POST',
        body: form,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erro na solicitação: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.document_id || !uploadData.document_key) {
        const embedErro = new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({
            name: 'Ocorreu um erro ao enviar o arquivo para tradução.',
            iconURL: 'https://bit.ly/43PItSI',
          });
        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }

      let translationStatus;
      do {
        const statusResponse = await fetch(
          `${apiUrl}/v2/document/${uploadData.document_id}?auth_key=${apiKey}&document_key=${uploadData.document_key}`
        );

        if (!statusResponse.ok) {
          throw new Error(`Erro ao verificar status: ${statusResponse.statusText}`);
        }

        translationStatus = await statusResponse.json();

        if (translationStatus.status === 'error') {
          throw new Error('Erro durante a tradução do arquivo.');
        }

        if (translationStatus.status !== 'done') {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } while (translationStatus.status !== 'done');

      const translatedFileResponse = await fetch(
        `${apiUrl}/v2/document/${uploadData.document_id}/result?auth_key=${apiKey}&document_key=${uploadData.document_key}`
      );

      if (!translatedFileResponse.ok) {
        throw new Error(`Erro ao baixar arquivo traduzido: ${translatedFileResponse.statusText}`);
      }

      const translatedFileBuffer = await translatedFileResponse.buffer();

      const filePath = `./translated_${attachment.name}`;
      fs.writeFileSync(filePath, translatedFileBuffer);

      
      const embedSucesso = new EmbedBuilder()
        .setColor('#2ecc71')
        .setAuthor({
          name: 'A tradução foi concluída! Enviando o arquivo traduzido...',
          iconURL: 'https://bit.ly/4hygpGR',
        });

      await message.channel.send({ embeds: [embedSucesso], allowedMentions: { repliedUser: false } });

      
      await message.channel.send({
        files: [filePath],
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Erro ao traduzir o arquivo:', error);

      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Não foi possível traduzir o arquivo. Verifique se o arquivo é suportado.',
          iconURL: 'https://bit.ly/43PItSI',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
