const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: "servers",
  description: "Lista os servidores onde o bot está e seus convites.",
  execute: async (client, message, args) => {
    if (message.author.id !== client.application?.owner?.id) {
      return message.reply("Only the bot owner can use this command!");
    }

    let serverList = [];

    for (const guild of client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();
        const invite = invites.first() || "Sem convite disponível";
        serverList.push(`**${guild.name}**: ${invite.url || invite}`);
      } catch (error) {
        serverList.push(`**${guild.name}**: Sem convite disponível`);
      }
    }

    const response = serverList.length
      ? serverList.join("\n")
      : "O bot não está em nenhum servidor.";

    message.reply(response);
  },
};
