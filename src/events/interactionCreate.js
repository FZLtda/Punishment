module.exports = {
    name: 'interactionCreate',
    execute: async (interaction, client) => {
      if (interaction.isButton() && interaction.customId === 'accept_terms') {
        const command = client.commands.get('acceptTerms');
        if (command) {
          await command.execute(interaction);
        }
      }
    },
  };
  

  const { getVerifyConfig } = require('../utils/verifyUtils');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'verify_button') {
            const config = getVerifyConfig(interaction.guild.id);
            if (!config) {
                return interaction.reply({ content: 'O sistema de verificação não está configurado.', ephemeral: true });
            }

            const role = interaction.guild.roles.cache.get(config.roleId);
            if (!role) {
                return interaction.reply({ content: 'O cargo de verificação não foi encontrado.', ephemeral: true });
            }

            try {
                await interaction.member.roles.add(role);
                return interaction.reply({ content: '✅ Você foi verificado com sucesso!', ephemeral: true });
            } catch (error) {
                console.error('Erro ao adicionar o cargo:', error);
                return interaction.reply({ content: '❌ Ocorreu um erro ao verificar.', ephemeral: true });
            }
        }
    }
};