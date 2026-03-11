"use strict";

const { emojis } = require("@config");

module.exports = [
  // Administração
  {
    id: "adm",
    name: "Administração",
    emoji: emojis.adm,
    description: "Configurações avançadas e gestão do servidor.",
    commands: [
      {
        name: "prefix",
        aliases: ["setprefix", "p"],
        description: "Altera o prefixo do bot.",
        usage: "prefix <novo_prefixo>",
        example: "prefix !",
        permissions: ["Administrator"],
        cooldown: 5,
        details: "Define o caractere que o bot usará para identificar comandos. Exemplo: `prefix !` fará com que o bot responda a `!help`.",
        id: "adm_01",
      },
      {
        name: "addemoji",
        aliases: ["ae", "uploademoji"],
        description: "Adiciona um emoji ao servidor.",
        usage: "addemoji <nome> <URL>",
        example: "addemoji smile https://i.imgur.com/link.png",
        permissions: ["ManageEmojisAndStickers"],
        cooldown: 3,
        details: "Faz o upload de uma imagem externa diretamente para os emojis do servidor.",
        id: "adm_02",
      },
      {
        name: "copyemoji",
        aliases: ["ce", "steal"],
        description: "Copia um emoji de outro servidor.",
        usage: "copyemoji <emoji> [nome]",
        example: "copyemoji :cool_dog: dog",
        permissions: ["ManageEmojisAndStickers"],
        cooldown: 3,
        details: "Importa um emoji que você viu em outro servidor. O bot deve estar presente em ambos.",
        id: "adm_03",
      },
      {
        name: "backup",
        aliases: ["bcreate"],
        description: "Cria um backup do servidor.",
        usage: "backup",
        example: "backup",
        permissions: ["Administrator"],
        cooldown: 60,
        details: "Gera um código único com a estrutura de canais e cargos. Útil para migrações.",
        id: "adm_04",
      },
      {
        name: "restore",
        aliases: ["bload"],
        description: "Restaura um backup existente.",
        usage: "restore <ID>",
        example: "restore abc-123-xyz",
        permissions: ["Administrator"],
        cooldown: 300,
        details: `${emojis.attentionEmoji} Cuidado: Isso apagará canais e cargos atuais para aplicar o backup.`,
        id: "adm_05",
      },
      {
        name: "addroles",
        aliases: ["ar", "multirole"],
        description: "Adiciona múltiplos cargos a um usuário.",
        usage: "addroles <@usuário> <@cargo1> [@cargo2] ...",
        example: "addroles @Zev @VIP @Membro",
        permissions: ["ManageRoles"],
        cooldown: 3,
        details: "Atribui vários cargos de uma vez só, otimizando o trabalho da staff.",
        id: "adm_06",
      },
      {
        name: "removeroles",
        aliases: ["rr", "clearroles"],
        description: "Remove todos os cargos de um usuário.",
        usage: "removeroles <@usuário>",
        example: "removeroles @User",
        permissions: ["ManageRoles"],
        cooldown: 5,
        details: "Limpa todos os cargos customizados do membro, deixando-o apenas com @everyone.",
        id: "adm_07",
      },
      {
        name: "log",
        aliases: ["logs", "setlog"],
        description: "Gerencia o sistema de logs.",
        usage: "log <set|off|status> [#canal]",
        example: "log set #puni-logs",
        permissions: ["ManageGuild"],
        cooldown: 10,
        details: "Configura onde o bot enviará registros de auditoria (mensagens apagadas, bans, etc).",
        id: "adm_08",
      },
    ],
  },

  // Moderação
  {
    id: "mod",
    name: "Moderação",
    emoji: emojis.mod,
    description: "Ferramentas disciplinares para a Staff.",
    commands: [
      { name: "ban", aliases: ["b", "punish"], description: "Bane um usuário.", usage: "ban <@usuário> [motivo]", example: "ban @User Spam", permissions: ["BanMembers"], cooldown: 2, details: "Remove o membro permanentemente.", id: "mod_01" },
      { name: "unban", aliases: ["ub"], description: "Remove banimento.", usage: "unban <ID>", example: "unban 123456789", permissions: ["BanMembers"], cooldown: 2, details: "Revoga o banimento usando o ID do usuário.", id: "mod_02" },
      { name: "kick", aliases: ["k"], description: "Expulsa um usuário.", usage: "kick <@usuário> [motivo]", example: "kick @User Desrespeito", permissions: ["KickMembers"], cooldown: 2, details: "Remove o usuário, mas permite retorno via convite.", id: "mod_03" },
      { name: "mute", aliases: ["timeout", "m"], description: "Silencia temporariamente.", usage: "mute <@usuário> <tempo> [motivo]", example: "mute @User 10m Flood", permissions: ["ModerateMembers"], cooldown: 2, details: "Usa o sistema de timeout oficial do Discord.", id: "mod_04" },
      { name: "unmute", aliases: ["untimeout"], description: "Remove o silêncio.", usage: "unmute <@usuário>", example: "unmute @User", permissions: ["ModerateMembers"], cooldown: 2, details: "Retira o timeout antes do tempo expirar.", id: "mod_05" },
      { name: "clear", aliases: ["purge", "c"], description: "Limpa o chat.", usage: "clear <quantidade>", example: "clear 50", permissions: ["ManageMessages"], cooldown: 5, details: "Apaga mensagens em massa (máximo 100).", id: "mod_06" },
      { name: "lock", aliases: ["l"], description: "Trava o canal.", usage: "lock [motivo]", example: "lock Raid", permissions: ["ManageChannels"], cooldown: 5, details: "Ninguém sem permissão poderá digitar.", id: "mod_07" },
      { name: "unlock", aliases: ["ul"], description: "Destrava o canal.", usage: "unlock", example: "unlock", permissions: ["ManageChannels"], cooldown: 5, details: "Libera o chat novamente.", id: "mod_08" },
      { name: "lockuser", aliases: ["lu"], description: "Trava um usuário específico.", usage: "lockuser <@user>", example: "lockuser @User", permissions: ["ManageRoles"], cooldown: 3, details: "Impede um membro de falar em todos os canais.", id: "mod_09" },
      { name: "send", aliases: ["say", "echo"], description: "Fala pelo bot.", usage: "send [#canal] <texto>", example: "send #geral Olá!", permissions: ["Administrator"], cooldown: 2, details: "O bot envia sua mensagem de forma anônima.", id: "mod_10" },
      { name: "slowmode", aliases: ["sm"], description: "Define modo lento.", usage: "slowmode <tempo>", example: "slowmode 10s", permissions: ["ManageChannels"], cooldown: 5, details: "Controla a velocidade das mensagens no canal.", id: "mod_11" },
    ],
  },

  // Informações
  {
    id: "info",
    name: "Informações",
    emoji: emojis.info,
    description: "Consulta de dados e estatísticas.",
    commands: [
      { name: "avatar", aliases: ["av", "pfp"], description: "Exibe foto de perfil.", usage: "avatar [@user]", example: "avatar @Zev", permissions: [], cooldown: 3, details: "Mostra o avatar em tamanho real.", id: "info_01" },
      { name: "botinfo", aliases: ["bi", "about"], description: "Info do Punishment.", usage: "botinfo", example: "botinfo", permissions: [], cooldown: 5, details: "Versão, uptime e estatísticas técnicas.", id: "info_02" },
      { name: "ping", aliases: ["latency"], description: "Latência do bot.", usage: "ping", example: "ping", permissions: [], cooldown: 2, details: "Tempo de resposta com a API do Discord.", id: "info_03" },
      { name: "stats", aliases: ["status", "sys"], description: "Status do sistema.", usage: "stats", example: "stats", permissions: [], cooldown: 5, details: "Uso de CPU, RAM e sistema operacional.", id: "info_04" },
      { name: "userinfo", aliases: ["ui", "whois"], description: "Info do usuário.", usage: "userinfo [@user]", example: "userinfo @User", permissions: [], cooldown: 3, details: "Cargos, entrada no servidor e badges.", id: "info_05" },
    ],
  },

  // Utilitários
  {
    id: "util",
    name: "Utilitários",
    emoji: emojis.util,
    description: "Recursos de utilidade geral.",
    commands: [
      { name: "doar", aliases: ["pix", "donate"], description: "Apoie o bot.", usage: "doar", example: "doar", permissions: [], cooldown: 10, details: "Link para apoiar o desenvolvimento do bot.", id: "util_01" },
      { name: "privacy", aliases: ["tos", "termos"], description: "Política de dados.", usage: "privacy", example: "privacy", permissions: [], cooldown: 10, details: "Como tratamos suas informações.", id: "util_02" },
      { 
        name: "t", 
        aliases: ["translate", "traduzir"], 
        description: "Tradutor multi-idiomas.", 
        usage: "t <idioma> <texto>", 
        example: "t en Olá mundo", 
        permissions: [], 
        cooldown: 3,
        details: "Traduz textos via comando ou reação de bandeira.", 
        id: "util_03" 
      },
    ],
  },

  // Sorteios
  {
    id: "giveaway",
    name: "Sorteios",
    emoji: emojis.give,
    description: "Criação e gestão de sorteios.",
    commands: [
      { name: "sorteio", aliases: ["gstart", "giveaway"], description: "Inicia sorteio.", usage: "sorteio <premio> <venc> <tempo>", example: "sorteio Nitro 1 1d", permissions: ["ManageMessages"], cooldown: 10, details: "Cria um sorteio interativo no canal.", id: "give_01" },
      { name: "rerolar", aliases: ["greroll"], description: "Novo vencedor.", usage: "rerolar <ID>", example: "rerolar 123456", permissions: ["ManageMessages"], cooldown: 5, details: "Sorteia outro ganhador para um sorteio encerrado.", id: "give_02" },
      { name: "finalizar", aliases: ["gend"], description: "Encerra sorteio.", usage: "finalizar <ID>", example: "finalizar 123456", permissions: ["ManageMessages"], cooldown: 5, details: "Termina o sorteio imediatamente.", id: "give_03" },
    ],
  },
];

