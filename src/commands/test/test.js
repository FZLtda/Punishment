// Importa as classes necessárias do pacote discord.js
const { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    // Define os dados do comando de contexto de usuário
    data: new ContextMenuCommandBuilder()
        .setName('Adicionar Cargo') // O nome que aparecerá no menu de contexto
        .setType(ApplicationCommandType.User), // Define que é um comando de contexto de usuário

    // Função de execução do comando
    async execute(interaction) {
        // interaction.targetUser contém o usuário no qual o comando de contexto foi usado
        const targetUser = interaction.targetUser;

        // Cria um modal para solicitar o nome/ID do cargo
        const modal = new ModalBuilder()
            .setCustomId(`addRoleModal_${targetUser.id}`) // ID personalizado para identificar este modal e o usuário alvo
            .setTitle(`Adicionar Cargo a ${targetUser.tag}`); // Título do modal

        // Cria um campo de texto para o modal
        const roleInput = new TextInputBuilder()
            .setCustomId('roleNameOrId') // ID personalizado para o campo de texto
            .setLabel("Nome ou ID do Cargo") // Rótulo do campo
            .setStyle(TextInputStyle.Short) // Estilo do campo (curto ou parágrafo)
            .setPlaceholder('Ex: Membro, 123456789012345678') // Texto de exemplo
            .setRequired(true); // Torna o campo obrigatório

        // Adiciona o campo de texto ao modal
        const firstActionRow = new ActionRowBuilder().addComponents(roleInput);
        modal.addComponents(firstActionRow);

        // Mostra o modal para o usuário que invocou o comando
        await interaction.showModal(modal);
    },
};
