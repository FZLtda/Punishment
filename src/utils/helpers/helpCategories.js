'use strict';

const { emojis } = require('@config');

module.exports = [
  // Administração
  {
    id: 'adm',
    name: 'Administração',
    emoji: emojis.adm,
    description: 'Comandos administrativos e de configuração do servidor.',
    commands: [
      {
        name: 'prefix',
        description: 'Altera o prefixo do bot.',
        usage: 'prefix <novo prefixo>',
        permissions: ['Administrator'],
        details: 'O prefixo define como os comandos são reconhecidos no servidor. Exemplo: `prefix !` fará com que todos os comandos sejam chamados com `!comando`.',
        id: '000000000000000001',
      },
      {
        name: 'addemoji',
        description: 'Adiciona um emoji ao servidor.',
        usage: 'addemoji <URL> [nome]',
        permissions: ['ManageEmojisAndStickers'],
        details: 'É necessário usar uma URL de imagem válida (PNG, JPEG ou GIF). O nome é opcional, caso não seja informado o bot tentará usar o nome do arquivo.',
        id: '000000000000000002',
      },
      {
        name: 'copyemoji',
        description: 'Copia um emoji de outro servidor.',
        usage: 'copyemoji <emoji>',
        permissions: ['ManageEmojisAndStickers'],
        details: 'Ideal para importar emojis personalizados rapidamente. O emoji precisa ser acessível para o bot (servidor em comum).',
        id: '000000000000000003',
      },
      {
        name: 'backup',
        description: 'Cria um backup do servidor.',
        usage: 'backup',
        permissions: ['Administrator'],
        details: 'O backup salva canais, cargos, permissões e configurações básicas. Arquivos de mídia e histórico de mensagens não são incluídos.',
        id: '000000000000000004',
      },
      {
        name: 'restore',
        description: 'Restaura um backup existente.',
        usage: 'restore <ID>',
        permissions: ['Administrator'],
        details: `${emojis.attentionEmoji} Tenha cuidado! A restauração sobrescreverá a estrutura atual do servidor com a do backup selecionado.`,
        id: '000000000000000005',
      },
      {
        name: 'addroles',
        description: 'Adiciona múltiplos cargos a um usuário.',
        usage: 'addroles <@usuário> <@cargo1> [@cargo2] ...',
        permissions: ['ManageRoles'],
        details: 'Permite atribuir diversos cargos de uma só vez. Exemplo: `addroles @User @VIP @Staff`.',
        id: '000000000000000006',
      },
      {
        name: 'removeroles',
        description: 'Remove todos os cargos de um usuário (exceto o padrão).',
        usage: 'removeroles <@usuário>',
        permissions: ['ManageRoles'],
        details: 'Remove todos os cargos personalizados atribuídos a um usuário, mantendo apenas o cargo padrão (@everyone).',
        id: '000000000000000007',
      },
      {
        name: 'setlog',
        description: 'Define o canal de logs.',
        usage: 'setlog <#canal>',
        permissions: ['ManageGuild'],
        details: 'O canal configurado receberá registros de moderação, punições, alterações de configuração e eventos importantes.',
        id: '000000000000000008',
      },
    ],
  },

  // Moderação
  {
    id: 'mod',
    name: 'Moderação',
    emoji: emojis.mod,
    description: 'Ferramentas para moderação de usuários e canais.',
    commands: [
      { name: 'ban', description: 'Bane um usuário do servidor.', usage: 'ban <@usuário> [motivo]', permissions: ['BanMembers'], details: 'Remove o usuário permanentemente até que seja desbanido manualmente.', id: '000000000000000009' },
      { name: 'unban', description: 'Remove o banimento de um usuário.', usage: 'unban <ID do usuário>', permissions: ['BanMembers'], details: 'É necessário o ID do usuário. Exemplo: `unban 123456789012345678`.', id: '000000000000000010' },
      { name: 'kick', description: 'Expulsa um usuário do servidor.', usage: 'kick <@usuário> [motivo]', permissions: ['KickMembers'], details: 'Expulsão é temporária, o usuário pode entrar novamente com convite.', id: '000000000000000011' },
      { name: 'mute', description: 'Silencia um usuário por tempo determinado.', usage: 'mute <@usuário> <tempo> [motivo]', permissions: ['ModerateMembers'], details: 'O tempo deve estar em formato válido: 10m, 2h, 1d.', id: '000000000000000012' },
      { name: 'unmute', description: 'Remove o silêncio de um usuário.', usage: 'unmute <@usuário>', permissions: ['ModerateMembers'], details: 'Libera o usuário para voltar a falar nos canais.', id: '000000000000000013' },
      { name: 'clear', description: 'Limpa mensagens de um canal.', usage: 'clear <quantidade>', permissions: ['ManageMessages'], details: 'Quantidade máxima recomendada: 100 mensagens por vez.', id: '000000000000000014' },
      { name: 'lock', description: 'Trava um canal para todos.', usage: 'lock [motivo]', permissions: ['ManageChannels'], details: 'Impede que membros sem permissões especiais enviem mensagens no canal.', id: '000000000000000015' },
      { name: 'unlock', description: 'Destrava um canal.', usage: 'unlock [motivo]', permissions: ['ManageChannels'], details: 'Remove as restrições aplicadas com o comando `lock`.', id: '000000000000000016' },
      { name: 'lockuser', description: 'Impede um usuário específico de enviar mensagens.', usage: 'lockuser <@usuário>', permissions: ['ManageRoles'], details: 'Aplica uma restrição personalizada ao usuário.', id: '000000000000000017' },
      { name: 'unlockuser', description: 'Libera um usuário silenciado.', usage: 'unlockuser <@usuário>', permissions: ['ManageRoles'], details: 'Remove a restrição aplicada com `lockuser`.', id: '000000000000000018' },
      { name: 'send', description: 'Envia uma mensagem como o bot.', usage: 'send <#canal> <mensagem>', permissions: ['Administrator'], details: 'Permite que o bot envie mensagens personalizadas em qualquer canal.', id: '000000000000000019' },
      { name: 'slowmode', description: 'Define o modo lento em um canal.', usage: 'slowmode <tempo>', permissions: ['ManageChannels'], details: 'O tempo pode ser definido em segundos, minutos ou horas.', id: '000000000000000020' },
    ],
  },

  // Informações
  {
    id: 'info',
    name: 'Informações',
    emoji: emojis.info,
    description: 'Comandos para exibir informações sobre usuários e o bot.',
    commands: [
      { name: 'avatar', description: 'Exibe o avatar de um usuário.', usage: 'avatar [@usuário]', permissions: [], details: 'Se nenhum usuário for mencionado, exibe o avatar de quem usou o comando.', id: '000000000000000021' },
      { name: 'botinfo', description: 'Mostra informações sobre o bot.', usage: 'botinfo', permissions: [], details: 'Exibe nome, versão, tempo online, número de servidores e desenvolvedor.', id: '000000000000000022' },
      { name: 'ping', description: 'Exibe a latência do bot.', usage: 'ping', permissions: [], details: 'Mostra o tempo de resposta entre o bot e o Discord.', id: '000000000000000023' },
      { name: 'stats', description: 'Exibe estatísticas do bot.', usage: 'stats', permissions: [], details: 'Inclui memória usada, tempo de atividade e informações do sistema.', id: '000000000000000024' },
      { name: 'userinfo', description: 'Exibe informações de um usuário.', usage: 'userinfo [@usuário]', permissions: [], details: 'Inclui data de criação, entrada no servidor, cargos e status.', id: '000000000000000025' },
    ],
  },

  // Utilitários
  {
    id: 'util',
    name: 'Utilitários',
    emoji: emojis.util,
    description: 'Funções úteis e auxiliares para o servidor.',
    commands: [
      { name: 'doar', description: 'Faça uma doação para apoiar o desenvolvimento do bot.', usage: 'doar <valor>', permissions: [], details: 'Você será redirecionado para a página de pagamento (Mercado Pago).', id: '000000000000000026' },
      { name: 'privacy', description: 'Exibe a política de privacidade.', usage: 'privacy', permissions: [], details: 'Mostra como os seus dados são usados, armazenados e protegidos pelo bot.', id: '000000000000000027' },
      { 
        name: 't', 
        description: 'Traduz um texto para o idioma desejado.', 
        usage: 't <idioma> <texto>', 
        permissions: [], 
        details: 'Você pode traduzir de duas formas:\n1. **Por comando** → `t en Olá` (traduz "Olá" para inglês).\n2. **Por reação** → reaja com a bandeira do idioma suportado que o bot traduz automaticamente a mensagem reagida.', 
        id: '000000000000000028' 
      },
    ],
  },

  // Sorteios
  {
    id: 'giveaway',
    name: 'Sorteios',
    emoji: emojis.give,
    description: 'Comandos para criar e gerenciar sorteios no servidor.',
    commands: [
      { name: 'sorteio', description: 'Inicia um novo sorteio.', usage: 'sorteio <prêmio> <vencedores> <tempo> [#canal]', permissions: ['ManageMessages'], details: 'Exemplo: `sorteio Nitro 1 1h #geral` cria um sorteio de 1 Nitro com duração de 1 hora.', id: '000000000000000029' },
      { name: 'rerolar', description: 'Escolhe um novo vencedor para um sorteio finalizado.', usage: 'rerolar <ID_da_mensagem>', permissions: ['ManageMessages'], details: 'Útil caso o vencedor inicial não seja válido.', id: '000000000000000030' },
      { name: 'finalizar', description: 'Finaliza manualmente um sorteio ativo.', usage: 'finalizar <ID_da_mensagem>', permissions: ['ManageMessages'], details: 'Força o término imediato do sorteio.', id: '000000000000000031' },
      { name: 'cancelar', description: 'Cancela um sorteio em andamento.', usage: 'cancelar <ID_da_mensagem>', permissions: ['ManageMessages'], details: 'O sorteio será encerrado e nenhum vencedor será sorteado.', id: '000000000000000032' },
    ],
  },
];
