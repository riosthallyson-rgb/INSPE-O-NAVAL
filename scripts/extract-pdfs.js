const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const documentsDirectory = path.resolve(process.cwd(), 'assets', 'docs');
const files = fs
  .readdirSync(documentsDirectory)
  .filter((fileName) => fileName.toLowerCase().endsWith('.pdf'))
  .sort((left, right) => left.localeCompare(right, 'pt-BR'))
  .map((fileName) => path.join(documentsDirectory, fileName));

(async () => {
  for (const file of files) {
    try {
      console.log('FILE:', file);
      const dataBuffer = fs.readFileSync(file);
      const data = await pdf(dataBuffer);
      console.log('PAGES:', data.numpages);
      const txt = data.text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
      console.log('FIRST 2000 CHARS:');
      console.log(txt.slice(0, 2000));
      console.log('----');
    } catch (error) {
      console.error('ERROR', file, error && error.message ? error.message : error);
    }
  }
})();
