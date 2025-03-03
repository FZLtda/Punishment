const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: "deleteChannel",
    description: "Exclui um canal do servidor.",
    execute: async (client, message, args, prefix) => {
        try {
            // Verifica se o usuário tem permissão para gerenciar canais
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.reply("❌ Você não tem permissão para excluir canais.");
            }

            // Verifica se o bot tem permissão para excluir canais
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.reply("❌ Eu não tenho permissão para excluir canais.");
            }

            // Obtém o canal (mencionado, por ID ou o próprio canal da mensagem)
            const channel = message.mentions.channels.first() ||
                            message.guild.channels.cache.get(args[0]) ||
                            message.channel;

            if (!channel) {
                return message.reply("❌ Canal não encontrado. Mencione um canal ou forneça um ID válido.");
            }

            // Impede a exclusão de categorias
            if (channel.type === 4) {
                return message.reply("❌ Não é possível excluir categorias, apenas canais de texto ou voz.");
            }

            // Protege canais importantes
            const canaisProtegidos = ["regras", "anúncios", "staff"];
            if (canaisProtegidos.includes(channel.name.toLowerCase())) {
                return message.reply("❌ Este canal é protegido e não pode ser excluído.");
            }

            // Confirmação antes da exclusão
            const confirmMessage = await message.reply(`⚠️ Tem certeza que deseja excluir o canal **${channel.name}**? Responda com **sim** em até 10 segundos.`);

            // Aguarda a resposta do usuário
            const filter = (msg) => msg.author.id === message.author.id && msg.content.toLowerCase() === "sim";
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ["time"] }).catch(() => null);

            if (!collected) {
                return message.reply("❌ Tempo esgotado! Cancelando a exclusão.");
            }

            // Exclui o canal
            await channel.delete();
            message.channel.send(`✅ O canal **${channel.name}** foi excluído com sucesso!`);

        } catch (error) {
            console.error("Erro ao excluir canal:", error);
            message.reply("❌ Ocorreu um erro inesperado ao tentar excluir o canal.");
        }
    }
};
