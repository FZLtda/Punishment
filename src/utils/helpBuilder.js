function buildHelpPages(commands, options = {}) {
  const comandos = [...commands.values()];
  const porPagina = options.porPagina || 5;
  const totalPaginas = Math.ceil(comandos.length / porPagina);

  const paginas = [];

  for (let i = 0; i < totalPaginas; i++) {
    const inicio = i * porPagina;
    const fim = inicio + porPagina;
    const comandosPagina = comandos.slice(inicio, fim);

    const embed = new options.EmbedBuilder()
      .setColor(options.colors.green)
      .setTitle('Lista de Comandos')
      .setDescription('Use `/help <comando>` para detalhes.')
      .addFields(
        ...comandosPagina.map(cmd => ({
          name: `/${cmd.data.name}`,
          value: cmd.data.description || 'Sem descrição.',
          inline: true
        }))
      )
      .setFooter({
        text: `Página ${i + 1}/${totalPaginas}`,
        iconURL: options.clientAvatar
      });

    paginas.push(embed);
  }

  return paginas;
}

module.exports = { buildHelpPages };
