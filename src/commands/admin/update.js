const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'update',
  description: 'Atualiza as dependências do bot via npm install.',
  usage: '${currentPrefix}update-deps',
  userPermissions: ['Administrator'],
  botPermissions: [],
  deleteMessage: true,

  async execute(message) {
    if (message.author.id !== '1006909671908585586') {
      return message.reply({ content: 'Apenas o desenvolvedor pode executar esse comando.', ephemeral: true });
    }

    const embedProcessando = new EmbedBuilder()
      .setColor('Yellow')
      .setDescription('<:1000043158:1336324199202947144> Atualizando dependências...');

    const msg = await message.channel.send({ embeds: [embedProcessando] });

    exec('npm install', (error, stdout, stderr) => {
      if (error) {
        const embedErro = new EmbedBuilder()
          .setColor(`${yellow}`)
          .setAuthor({ name: 'Erro ao atualizar as dependências.', iconURL: `${icon_attention}` })
          .setDescription(`\`\`\`bash\n${stderr || error.message}\n\`\`\``);

        return msg.edit({ embeds: [embedErro] });
      }

      const embedSucesso = new EmbedBuilder()
        .setColor('Green')
        .setTitle('<:sucesso:1358918549846098201> Dependências atualizadas com sucesso!')
        .setDescription('As dependências do projeto foram atualizadas via `npm install`.')
        .addFields({ name: 'Saída', value: `\`\`\`bash\n${stdout.slice(0, 1000)}\n\`\`\`` })
        .setTimestamp();

      return msg.edit({ embeds: [embedSucesso] });
    });
  },
};
