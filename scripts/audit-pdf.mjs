import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const [fileName, ...rawTerms] = process.argv.slice(2);
if (!fileName || !rawTerms.length) throw new Error('Uso: node scripts/audit-pdf.mjs arquivo.pdf "termo"');
const terms = rawTerms.map((term) => term.toLocaleLowerCase('pt-BR'));
const filePath = path.resolve(process.cwd(), 'assets', 'docs', fileName);
const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fs.readFileSync(filePath)) }).promise;

for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const text = content.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
  const normalized = text.toLocaleLowerCase('pt-BR');
  if (terms.some((term) => normalized.includes(term))) console.log(`\n=== PDF PAGE ${pageNumber} ===\n${text}`);
}
