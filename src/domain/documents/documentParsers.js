import { createExtractedField } from './documentEvidence';

const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const afterLabel = (text, labels) => {
  for (const label of labels) {
    const match = text.match(new RegExp(`${label}\\s*[:\-]?\\s*([^\\n\\r]+)`, 'i'));
    if (match) return clean(match[1]);
  }
  return null;
};
const field = (name, value, confidence = 0.8) => createExtractedField({ field: name, value, confidence: value ? confidence : 0 });

export const parseBrazilianDate = (value) => {
  const match = clean(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]); const month = Number(match[2]); const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? `${match[1]}/${match[2]}/${match[3]}` : null;
};

export const parseVesselDocumentText = (text) => {
  const source = String(text || '');
  const registration = afterLabel(source, ['n[úu]mero de inscri[cç][aã]o', 'inscri[cç][aã]o']);
  return [
    field('registrationNumber', registration ? registration.replace(/[^0-9A-Za-z.-]/g, '') : null, 0.92),
    field('vesselName', afterLabel(source, ['nome da embarca[cç][aã]o', 'nome']), 0.88),
    field('vesselType', afterLabel(source, ['tipo da embarca[cç][aã]o', 'tipo']), 0.82),
    field('registrationPort', afterLabel(source, ['porto de inscri[cç][aã]o']), 0.82),
    field('authorizedNavigationArea', afterLabel(source, ['[áa]rea de navega[cç][aã]o']), 0.82),
    field('authorizedCapacity', afterLabel(source, ['lota[cç][aã]o']), 0.78),
    field('lengthMeters', afterLabel(source, ['comprimento']), 0.75),
    field('grossTonnage', afterLabel(source, ['ab', 'arquea[cç][aã]o bruta']), 0.75),
    field('ownerName', afterLabel(source, ['propriet[áa]rio']), 0.78),
    field('issueDate', parseBrazilianDate(afterLabel(source, ['data de emiss[aã]o'])), 0.72),
    field('validUntil', parseBrazilianDate(afterLabel(source, ['validade'])), 0.72),
  ];
};

export const parseLicenseDocumentText = (text) => {
  const source = String(text || '');
  return [field('holderName', afterLabel(source, ['nome']), 0.85), field('licenseNumber', afterLabel(source, ['n[úu]mero']), 0.9), field('category', afterLabel(source, ['categoria']), 0.82), field('validUntil', parseBrazilianDate(afterLabel(source, ['validade'])), 0.75)];
};

export const parseCtsText = (text) => String(text || '').split(/\r?\n/).map(clean).filter((line) => line.includes('|')).map((line) => {
  const [role, category, quantity] = line.split('|').map(clean);
  return { role: role || null, category: category || null, quantity: /^\d+$/.test(quantity) ? quantity : null, confirmedByUser: false };
});
