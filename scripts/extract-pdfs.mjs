import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const documentsDirectory = path.resolve(process.cwd(), 'assets', 'docs');
const files = fs
  .readdirSync(documentsDirectory)
  .filter((fileName) => fileName.toLowerCase().endsWith('.pdf'))
  .sort((left, right) => left.localeCompare(right, 'pt-BR'))
  .map((fileName) => path.join(documentsDirectory, fileName));

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

const extractTextFromPage = async (page) => {
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(' ');
};

const extractText = async (dataBuffer, maxPages = Number.POSITIVE_INFINITY) => {
  const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageCount = Math.min(numPages, maxPages);
  const texts = [];
  for (let i = 1; i <= pageCount; i += 1) {
    const page = await pdf.getPage(i);
    const text = await extractTextFromPage(page);
    texts.push(text);
  }
  return { numPages, text: texts.join('\n\n') };
};

const main = async () => {
  for (const file of files) {
    try {
      console.log('FILE:', file);
      const dataBuffer = new Uint8Array(fs.readFileSync(file));
      const result = await extractText(dataBuffer);
      console.log('PAGES:', result.numPages);
      console.log('TEXT:', result.text.slice(0, 2000));
      console.log('----');
    } catch (error) {
      console.error('ERROR', file, error.message);
    }
  }
};

main().catch((err) => {
  console.error('Fatal error', err);
});
