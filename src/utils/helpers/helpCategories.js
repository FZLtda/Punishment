"use strict";

/**
 * Punishment - Command Categories
 *
 * Este arquivo define todas as categorias e comandos
 * exibidos no sistema de ajuda do bot.
 *
 * Estrutura:
 * Categoria → Comandos → Metadados
 *
 * Cada comando possui:
 * name        → Nome do comando
 * description → Descrição curta
 * usage       → Como usar o comando
 * permissions → Permissões necessárias
 * details     → Explicação detalhada
 * id          → ID interno do comando
 */

const { emojis } = require("@config");

module.exports = [
  
  // Administração
  
  {
    id: "adm",
    name: "Administração",
    emoji: emojis.adm,
    description: "Comandos administrativos e de configuração do servidor.",
    commands: [
      {
        name: "prefix",
        description: "Altera o prefixo utilizado pelo bot no servidor.",
        usage: "prefix <novo_prefixo>",
        permissions: ["Administrator"],
        details:
          "Define um novo prefixo para os comandos do bot.\n\n" +
          "Exemplo:\n" +
          "`prefix !`\n\n" +
          "Após alterar, os comandos passarão a funcionar assim:\n" +
          "`!ban`, `!kick`, `!help`.",
        id: "000000000000000001",
      },
      {
        name: "addemoji",
        description: "Adiciona um novo emoji personalizado ao servidor.",
        usage: "addemoji <nome> <URL>",
        permissions: ["ManageEmojisAndStickers"],
        details:
          "Permite adicionar um emoji ao servidor utilizando o nome desejado e a URL de uma imagem.\n\n" +
          "Exemplo:\n" +
          "`addemoji punbot https://punbot.xyz/logo.png`",
        id: "000000000000000002",
      },
      {
        name: "copyemoji",
        description: "Copia um emoji de outro servidor.",
        usage: "copyemoji <emoji> [nome]",
        permissions: ["ManageEmojisAndStickers"],
        details:
          "Importa um emoji diretamente de outro servidor.\n\n" +
          "Se nenhum nome for definido, o nome original do emoji será utilizado.",
        id: "000000000000000003",
      },
      {
        name: "backup",
        description: "Cria um backup da estrutura atual do servidor.",
        usage: "backup",
        permissions: ["Administrator"],
        details:
          "Salva a estrutura do servidor, incluindo:\n" +
          "• Canais\n" +
          "• Cargos\n" +
          "• Permissões\n\n" +
          "Observação:\n" +
          "Mensagens, arquivos e histórico de chat não são incluídos.",
        id: "000000000000000004",
      },
      {
        name: "restore",
        description: "Restaura um backup previamente criado.",
        usage: "restore <ID>",
        permissions: ["Administrator"],
        details:
          `${emojis.attentionEmoji} Atenção!\n\n` +
          "Restaurar um backup substituirá a estrutura atual do servidor.\n\n" +
          "Isso pode alterar:\n" +
          "• Canais\n" +
          "• Cargos\n" +
          "• Permissões\n\n" +
          "Use este comando apenas se tiver certeza.",
        id: "000000000000000005",
      },
      {
        name: "addroles",
        description: "Adiciona múltiplos cargos a um usuário.",
        usage: "addroles <@usuário> <@cargo1> [@cargo2] ...",
        permissions: ["ManageRoles"],
        details:
          "Permite adicionar vários cargos a um usuário em um único comando.\n\n" +
          "Exemplo:\n" +
          "`addroles @User @VIP @Membro`",
        id: "000000000000000006",
      },
      {
        name: "removeroles",
        description: "Remove todos os cargos de um usuário.",
        usage: "removeroles <@usuário>",
        permissions: ["ManageRoles"],
        details:
          "Remove todos os cargos personalizados do usuário.\n\n" +
          "O cargo padrão `@everyone` não é removido.",
        id: "000000000000000007",
      },
      {
        name: "log",
        description: "Gerencia o sistema de logs do servidor.",
        usage: "log <set|off|status> [#canal]",
        permissions: ["ManageGuild"],
        details:
          "Permite configurar o sistema de logs do servidor.\n\n" +
          "**Ativar logs**\n" +
          "`log set #canal`\n\n" +
          "**Desativar logs**\n" +
          "`log off`\n\n" +
          "**Verificar status**\n" +
          "`log status`",
        id: "000000000000000008",
      },
    ],
  },

  // Moderação
  
  {
    id: "mod",
    name: "Moderação",
    emoji: emojis.mod,
    description: "Ferramentas para gerenciar e moderar usuários no servidor.",
    commands: [
      {
        name: "ban",
        description: "Remove permanentemente um usuário do servidor.",
        usage: "ban <@usuário> [motivo]",
        permissions: ["BanMembers"],
        details:
          "Bane o usuário do servidor.\n\n" +
          "Ele só poderá voltar caso seja desbanido manualmente.\n\n" +
          "Exemplo:\n" +
          "`ban @User Spam`",
        id: "000000000000000009",
      },
      {
        name: "unban",
        description: "Remove o banimento de um usuário.",
        usage: "unban <ID_do_usuário>",
        permissions: ["BanMembers"],
        details:
          "Desbane um usuário utilizando o ID dele.\n\n" +
          "Exemplo:\n" +
          "`unban 123456789012345678`",
        id: "000000000000000010",
      },
      {
        name: "kick",
        description: "Expulsa um usuário do servidor.",
        usage: "kick <@usuário> [motivo]",
        permissions: ["KickMembers"],
        details:
          "Remove o usuário do servidor.\n\n" +
          "Diferente do banimento, ele poderá entrar novamente usando um convite.",
        id: "000000000000000011",
      },
      {
        name: "mute",
        description: "Silencia um usuário por um período.",
        usage: "mute <@usuário> <tempo> [motivo]",
        permissions: ["ModerateMembers"],
        details:
          "Impede o usuário de enviar mensagens por um tempo determinado.\n\n" +
          "Formatos aceitos:\n" +
          "`10m` → 10 minutos\n" +
          "`2h` → 2 horas\n" +
          "`1d` → 1 dia",
        id: "000000000000000012",
      },
      {
        name: "unmute",
        description: "Remove o silêncio de um usuário.",
        usage: "unmute <@usuário>",
        permissions: ["ModerateMembers"],
        details:
          "Permite que o usuário volte a enviar mensagens normalmente.",
        id: "000000000000000013",
      },
      {
        name: "clear",
        description: "Remove múltiplas mensagens de um canal.",
        usage: "clear <quantidade>",
        permissions: ["ManageMessages"],
        details:
          "Apaga várias mensagens de uma vez.\n\n" +
          "Exemplo:\n" +
          "`clear 50`\n\n" +
          "Limite máximo: **100 mensagens**.",
        id: "000000000000000014",
      },
      {
        name: "lock",
        description: "Bloqueia um canal para envio de mensagens.",
        usage: "lock [motivo]",
        permissions: ["ManageChannels"],
        details:
          "Impede que membros comuns enviem mensagens no canal.",
        id: "000000000000000015",
      },
      {
        name: "unlock",
        description: "Desbloqueia um canal.",
        usage: "unlock [motivo]",
        permissions: ["ManageChannels"],
        details:
          "Remove o bloqueio aplicado pelo comando `lock`.",
        id: "000000000000000016",
      },
      {
        name: "lockuser",
        description: "Bloqueia um usuário específico no canal.",
        usage: "lockuser <@usuário>",
        permissions: ["ManageRoles"],
        details:
          "Impede que o usuário envie mensagens neste canal.",
        id: "000000000000000017",
      },
      {
        name: "unlockuser",
        description: "Remove o bloqueio de um usuário.",
        usage: "unlockuser <@usuário>",
        permissions: ["ManageRoles"],
        details:
          "Permite que o usuário volte a enviar mensagens normalmente.",
        id: "000000000000000018",
      },
      {
        name: "send",
        description: "Envia uma mensagem utilizando o bot.",
        usage: "send [#canal] <mensagem>",
        permissions: ["Administrator"],
        details:
          "Faz o bot enviar uma mensagem personalizada em um canal.",
        id: "000000000000000019",
      },
      {
        name: "slowmode",
        description: "Define um intervalo entre mensagens no canal.",
        usage: "slowmode <tempo>",
        permissions: ["ManageChannels"],
        details:
          "Define o tempo mínimo que usuários devem esperar entre mensagens.",
        id: "000000000000000020",
      },
    ],
  },

  // Informações
  
  {
    id: "info",
    name: "Informações",
    emoji: emojis.info,
    description: "Comandos que exibem informações sobre usuários e o bot.",
    commands: [
      {
        name: "avatar",
        description: "Mostra o avatar de um usuário.",
        usage: "avatar [@usuário]",
        permissions: [],
        details:
          "Se nenhum usuário for mencionado, mostra seu próprio avatar.",
        id: "000000000000000021",
      },
      {
        name: "botinfo",
        description: "Exibe informações sobre o bot.",
        usage: "botinfo",
        permissions: [],
        details:
          "Mostra versão, tempo online, servidores conectados.",
        id: "000000000000000022",
      },
      {
        name: "ping",
        description: "Mostra a latência do bot.",
        usage: "ping",
        permissions: [],
        details:
          "Exibe o tempo de resposta entre o bot e a API do Discord.",
        id: "000000000000000023",
      },
      {
        name: "stats",
        description: "Exibe estatísticas do bot.",
        usage: "stats",
        permissions: [],
        details:
          "Mostra uso de memória, tempo de atividade e informações do sistema.",
        id: "000000000000000024",
      },
      {
        name: "userinfo",
        description: "Mostra informações de um usuário.",
        usage: "userinfo [@usuário]",
        permissions: [],
        details:
          "Inclui data de criação da conta, entrada no servidor e cargos.",
        id: "000000000000000025",
      },
    ],
  },

  // Utilitários
  
  {
    id: "util",
    name: "Utilitários",
    emoji: emojis.util,
    description: "Comandos úteis e ferramentas adicionais.",
    commands: [
      {
        name: "doar",
        description: "Apoie o desenvolvimento do bot com uma doação.",
        usage: "doar <valor>",
        permissions: [],
        details:
          "Você será redirecionado para a página de pagamento.",
        id: "000000000000000026",
      },
      {
        name: "privacy",
        description: "Exibe a política de privacidade.",
        usage: "privacy",
        permissions: [],
        details:
          "Mostra como os dados são coletados, utilizados e protegidos.",
        id: "000000000000000027",
      },
      {
        name: "t",
        description: "Traduz textos para diferentes idiomas.",
        usage: "t <idioma> <texto>",
        permissions: [],
        details:
          "Métodos de tradução:\n\n" +
          "**Comando**\n" +
          "`t en Olá`\n\n" +
          "**Reação**\n" +
          "Reaja com a bandeira de um idioma suportado.",
        id: "000000000000000028",
      },
    ],
  },

  // Sorteios

  {
    id: "giveaway",
    name: "Sorteios",
    emoji: emojis.give,
    description: "Comandos para criar e gerenciar sorteios no servidor.",
    commands: [
      {
        name: "sorteio",
        description: "Inicia um novo sorteio.",
        usage: "sorteio <prêmio> <vencedores> <tempo> [#canal]",
        permissions: ["ManageMessages"],
        details:
          "Cria um sorteio definindo prêmio, quantidade de vencedores e duração.",
        id: "000000000000000029",
      },
      {
        name: "rerolar",
        description: "Escolhe um novo vencedor.",
        usage: "rerolar <ID_da_mensagem>",
        permissions: ["ManageMessages"],
        details:
          "Seleciona outro vencedor caso o anterior não seja válido.",
        id: "000000000000000030",
      },
      {
        name: "finalizar",
        description: "Finaliza um sorteio manualmente.",
        usage: "finalizar <ID_da_mensagem>",
        permissions: ["ManageMessages"],
        details:
          "Encerra imediatamente um sorteio ativo.",
        id: "000000000000000031",
      },
      {
        name: "cancelar",
        description: "Cancela um sorteio.",
        usage: "cancelar <ID_da_mensagem>",
        permissions: ["ManageMessages"],
        details:
          "O sorteio será encerrado sem selecionar vencedores.",
        id: "000000000000000032",
      },
    ],
  },
];
