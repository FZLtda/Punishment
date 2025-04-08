const fs = require('fs');
const path = require('path');

function loadFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  return files.flatMap(file =>
    file.isDirectory()
      ? loadFiles(path.join(dir, file.name))
      : file.name.endsWith('.js') || file.name.endsWith('.ts')
        ? [path.join(dir, file.name)]
        : []
  );
}

module.exports = loadFiles;
