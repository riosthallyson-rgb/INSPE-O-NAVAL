import { createExtractedField } from './documentEvidence';

const FIELD_ALIASES = Object.freeze({
  registrationNumber: ['registrationnumber', 'registration', 'inscricao', 'numerodeinscricao', 'tie', 'tiem', 'prpm'],
  vesselName: ['vesselname', 'nomeembarcacao', 'nomedaembarcacao', 'embarcacao', 'nome'],
  vesselType: ['vesseltype', 'tipoembarcacao', 'tipodaembarcacao', 'tipo'],
  registrationPort: ['registrationport', 'portodeinscricao', 'porto'],
  authorizedNavigationArea: ['authorizednavigationarea', 'areadenavegacao', 'navegacao'],
  authorizedCapacity: ['authorizedcapacity', 'lotacaoautorizada', 'lotacao', 'capacidade'],
  lengthMeters: ['lengthmeters', 'comprimentometros', 'comprimento', 'loa'],
  grossTonnage: ['grosstonnage', 'arqueacaobruta', 'ab'],
  ownerName: ['ownername', 'proprietario', 'nomeproprietario', 'armador'],
  ownerTaxId: ['ownertaxid', 'cpfcnpj', 'cpf', 'cnpj', 'documentoproprietario'],
  validUntil: ['validuntil', 'validade', 'datadevalidade', 'vencimento'],
  holderName: ['holdername', 'nometitular', 'titular', 'condutor'],
  licenseNumber: ['licensenumber', 'numerohabilitacao', 'habilitacao', 'cha', 'cir'],
  category: ['category', 'categoria'],
});

export const QR_VESSEL_FIELD_ORDER = Object.freeze([
  'registrationNumber',
  'vesselName',
  'vesselType',
  'registrationPort',
  'authorizedNavigationArea',
  'authorizedCapacity',
  'lengthMeters',
  'grossTonnage',
  'ownerName',
  'ownerTaxId',
  'validUntil',
]);

const normalizeKey = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

const cleanValue = (value) => {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/\s+/g, ' ').trim();
  return cleaned || null;
};

const canonicalField = (key) => {
  const normalized = normalizeKey(key);
  return Object.entries(FIELD_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || null;
};

const objectToValues = (object) => Object.entries(object || {}).reduce((result, [key, value]) => {
  const field = canonicalField(key);
  const cleaned = cleanValue(value);
  if (field && cleaned !== null) result[field] = cleaned;
  return result;
}, {});

const parseJsonPayload = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') return null;
    const candidate = parsed.document && typeof parsed.document === 'object' ? parsed.document : parsed;
    const values = objectToValues(candidate);
    return Object.keys(values).length ? { format: 'json', values } : null;
  } catch {
    return null;
  }
};

const parseKeyValuePayload = (raw) => {
  const segments = raw.split(/[;|\n\r]+/).map((segment) => segment.trim()).filter(Boolean);
  const values = {};
  for (const segment of segments) {
    const separator = segment.includes('=') ? '=' : segment.includes(':') ? ':' : null;
    if (!separator) continue;
    const index = segment.indexOf(separator);
    const field = canonicalField(segment.slice(0, index));
    const value = cleanValue(segment.slice(index + 1));
    if (field && value !== null) values[field] = value;
  }
  return Object.keys(values).length ? { format: 'key-value', values } : null;
};

const parsePositionalPayload = (raw) => {
  const segments = raw.split('|').map((segment) => cleanValue(segment));
  if (segments.length < 2 || segments.some((value) => value?.includes('='))) return null;
  const values = {};
  QR_VESSEL_FIELD_ORDER.forEach((field, index) => {
    if (segments[index]) values[field] = segments[index];
  });
  return Object.keys(values).length >= 2 ? { format: 'positional', values } : null;
};

const toExtractedFields = (values) => Object.entries(values).map(([field, value]) => createExtractedField({
  field,
  value,
  confidence: 0.95,
  sourceImage: 'qr',
}));

export const parseQrDocumentPayload = (payload) => {
  const raw = String(payload || '').trim();
  if (!raw) return { status: 'empty', format: null, extractedFields: [], raw: '' };

  const parsed = parseJsonPayload(raw) || parseKeyValuePayload(raw) || parsePositionalPayload(raw);
  if (!parsed) return { status: 'unrecognized', format: null, extractedFields: [], raw };

  return {
    status: 'parsed',
    format: parsed.format,
    extractedFields: toExtractedFields(parsed.values),
    raw,
  };
};

export const mergeQrExtractedFields = (currentFields = [], qrFields = []) => {
  const byField = new Map((currentFields || []).map((item) => [item.field, item]));
  for (const item of qrFields || []) {
    const previous = byField.get(item.field);
    if (!previous || !previous.confirmedByUser) {
      byField.set(item.field, {
        ...(previous || {}),
        ...item,
        confirmedByUser: false,
      });
    }
  }
  return [...byField.values()];
};
