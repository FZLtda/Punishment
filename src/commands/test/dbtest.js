const { EmbedBuilder } = require('discord.js');
const Test = require('../../models/test');
const { green, red } = require('../../config/colors.json');

module.exports = {
  name: 'dbtest',
  description: 'Testa a conexão e escrita no MongoDB.',
  category: 'Utilidade',
  async execute(message, args) {
    try {
      const saved = await Test.create({
        userId: message.author.id,
        content: args.join(' ') || 'Mensagem padrão de teste'
      });

      const embed = new EmbedBuilder()
        .setColor(green)
        .setTitle('✅ Teste com MongoDB')
        .setDescription(`A mensagem foi salva com sucesso!\n\n**ID:** ${saved._id}`)
        .setFooter({ text: `Usuário: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao salvar no MongoDB:', error);
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription('❌ Ocorreu um erro ao salvar no MongoDB.')
        ]
      });
    }
  }
};
