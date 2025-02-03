const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

module.exports = {
  name: 'translatefile',
  description: 'Traduz o conteúdo de um arquivo para o idioma especificado.',
  async execute(message, args) {
    if (!message.attachments.first()) {
      return message.reply(
        '<:no:1122370713932795997> Você precisa enviar um arquivo para tradução junto com este comando.'
      );
    }

    if (args.length === 0) {
      return message.reply(
        '<:no:1122370713932795997> Você precisa especificar o idioma de destino. Exemplo: `.translatefile en`'
      );
    }

    const targetLanguage = args[0].toUpperCase();
    const attachment = message.attachments.first();

    try {
      const fileResponse = await fetch(attachment.url);
      const fileBuffer = await fileResponse.buffer();

      const form = new FormData();
      form.append('auth_key', process.env.DEEPL_API_KEY);
      form.append('target_lang', targetLanguage);
      form.append('file', fileBuffer, attachment.name);

      const uploadResponse = await fetch(
        'https://api-free.deepl.com/v2/document',
        {
          method: 'POST',
          body: form,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadData.document_id || !uploadData.document_key) {
        return message.reply('<:no:1122370713932795997> Ocorreu um erro ao enviar o arquivo para tradução.');
      }

      let translationStatus;
      do {
        const statusResponse = await fetch(
          `https://api-free.deepl.com/v2/document/${uploadData.document_id}?auth_key=${process.env.DEEPL_API_KEY}&document_key=${uploadData.document_key}`
        );
        translationStatus = await statusResponse.json();

        if (translationStatus.status === 'error') {
          throw new Error('Erro durante a tradução do arquivo.');
        }

        if (translationStatus.status !== 'done') {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } while (translationStatus.status !== 'done');

      const translatedFileResponse = await fetch(
        `https://api-free.deepl.com/v2/document/${uploadData.document_id}/result?auth_key=${process.env.DEEPL_API_KEY}&document_key=${uploadData.document_key}`
      );
      const translatedFileBuffer = await translatedFileResponse.buffer();

      const filePath = `./translated_${attachment.name}`;
      fs.writeFileSync(filePath, translatedFileBuffer);

      await message.reply({
        content: '<:emoji_33:1219788320234803250> A tradução foi concluída! Aqui está o arquivo traduzido:',
        files: [filePath],
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Erro ao traduzir o arquivo:', error);
      return message.reply('<:no:1122370713932795997> Não foi possível traduzir o arquivo.');
    }
  },
};