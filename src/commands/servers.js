const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "servers",
  description: "Lista todos os servidores onde o bot está.",
  category: "utilidade",
  execute: async (client, message, args) => {
    try {
      if (!message.guild) return;

      if (!client.guilds || !client.guilds.cache) {
        return message.channel.send("Não foi possível recuperar os servidores.");
      }

      const guilds = [...client.guilds.cache.values()];
      if (guilds.length === 0) {
        return message.channel.send("O bot não está em nenhum servidor.");
      }

      const embed = new EmbedBuilder()
        .setTitle("📋 Servidores onde estou:")
        .setDescription(guilds.map(guild => `🔹 **${guild.name}** (ID: \`${guild.id}\`)`).join("\n"))
        .setColor("Blue")
        .setFooter({ text: `Total: ${guilds.length} servidores` });

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error("[ERRO] Falha ao executar o comando 'servers':", error);
      await message.channel.send("Ocorreu um erro ao tentar listar os servidores.");
    }
  }
};
