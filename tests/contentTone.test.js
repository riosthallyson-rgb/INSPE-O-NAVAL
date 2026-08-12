import fs from 'fs';
import path from 'path';

const sourceFiles = [];
const collectFiles = (directory) => {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(target);
    else if (/\.(js|md)$/.test(entry.name)) sourceFiles.push(target);
  });
};

collectFiles(path.resolve(process.cwd(), 'src'));

describe('tom do produto', () => {
  test('não usa emojis no código da aplicação', () => {
    const emojiPattern = /\p{Extended_Pictographic}/u;
    sourceFiles.forEach((file) => {
      expect(fs.readFileSync(file, 'utf8')).not.toMatch(emojiPattern);
    });
  });

  test('só apresenta IA quando o resultado confirma o modo remoto', () => {
    const compassSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/normative/NormativeSearchScreen.js'),
      'utf8'
    );
    expect(compassSource).toContain('status="Pesquisa local"');
    expect(compassSource).not.toContain('IA fundamentada');
  });

  test('usa Bússola como nome da funcionalidade normativa', () => {
    const applicationSource = sourceFiles
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');

    expect(applicationSource).toContain('Bússola');
    expect(applicationSource).not.toMatch(/Busca Normativa/i);
  });
});
