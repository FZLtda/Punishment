const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: "delete",
    description: "Exclui um canal do servidor.",
    execute: async (client, message, args, prefix) => {
        try {
            if (!message.guild) return;

            // Verifica se o usuário tem permissão para excluir canais
            if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.channel.send("❌ Você não tem permissão para excluir canais.");
            }

            // Verifica se o bot tem permissão para excluir canais
            const botMember = await message.guild.members.fetch(client.user.id);
            if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.channel.send("❌ Eu não tenho permissão para excluir canais.");
            }

            // Obtém o canal
            const channel = message.mentions.channels.first() ||
                            message.guild.channels.cache.get(args[0]) ||
                            message.channel;

            if (!channel) {
                return message.channel.send("❌ Canal não encontrado. Mencione um canal ou forneça um ID válido.");
            }

            // Impede a exclusão de categorias
            if (channel.type === 4) {
                return message.channel.send("❌ Não é possível excluir categorias, apenas canais de texto ou voz.");
            }

            // Protege canais importantes
            const canaisProtegidos = ["regras", "anúncios", "staff"];
            if (canaisProtegidos.includes(channel.name.toLowerCase())) {
                return message.channel.send("❌ Este canal é protegido e não pode ser excluído.");
            }

            // Confirmação antes da exclusão
            const confirmMessage = await message.channel.send(`⚠️ Tem certeza que deseja excluir o canal **${channel.name}**? Responda com **sim** em até 10 segundos.`);

            const filter = (msg) => msg.author.id === message.author.id && msg.content.toLowerCase() === "sim";
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ["time"] }).catch(() => null);

            if (!collected) {
                return message.channel.send("❌ Tempo esgotado! Cancelando a exclusão.");
            }

            // Exclui o canal
            await channel.delete();
            message.channel.send(`✅ O canal **${channel.name}** foi excluído com sucesso!`);

        } catch (error) {
            console.error("Erro ao excluir canal:", error);
            message.channel.send("❌ Ocorreu um erro inesperado ao tentar excluir o canal.");
        }
    }
};
