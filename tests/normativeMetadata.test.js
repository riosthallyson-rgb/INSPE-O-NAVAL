import fs from 'fs';
import path from 'path';
import { getPublicationById, publications } from '../src/data/publications';

describe('metadados normativos', () => {
  test('localiza uma publicação pela rota estável', () => {
    expect(getPublicationById('normam-201')?.source).toBe('normam-201.pdf');
    expect(getPublicationById('inexistente')).toBeUndefined();
  });
  test('todo PDF informa edição, páginas e estado de verificação', () => {
    publications.forEach((publication) => {
      expect(publication.officialTitle).toBeTruthy();
      expect(publication.edition).toBeTruthy();
      expect(publication.embeddedPages).toBeGreaterThan(0);
      expect(publication.officialSourceUrl).toMatch(/^https:\/\//);
      expect(publication.verificationStatus).toBe('pending');
    });
  });

  test('os PDFs declarados existem no pacote', () => {
    const pdfNames = fs.readdirSync(path.resolve(process.cwd(), 'assets', 'docs'));
    publications.forEach((publication) => {
      expect(pdfNames).toContain(publication.source);
    });
  });
});
