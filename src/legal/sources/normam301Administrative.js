export const NORMAM_301_ADMIN_SOURCE = Object.freeze({
  sourceId: 'normam-301',
  sourceTitle: 'NORMAM-301/DPC',
  sourceVersion: '2026',
  checkedAt: '2026-08-08T00:00:00.000Z',
});

const template = (id, title, annex, pdfPage, pages, fields) => Object.freeze({
  id,
  title,
  annex,
  pages,
  fields,
  source: { ...NORMAM_301_ADMIN_SOURCE, section: `Anexo ${annex}`, page: pdfPage },
});

export const ADMINISTRATIVE_DOCUMENT_TEMPLATES = Object.freeze({
  NOTICE_TO_APPEAR: template('notice-to-appear', 'Notificação para Comparecimento', '3-A', 44, 1, ['organization', 'authority', 'legalDevice', 'interestedParty', 'vesselOrWork', 'organizationAddress', 'deadline', 'serviceHours', 'observedFacts', 'inspector']),
  INFRACTION_NOTICE: template('infraction-notice', 'Auto de Infração ao RLESTA', '3-B', 46, 2, ['officialDocumentNumber', 'processNumber', 'organization', 'noticeDate', 'offender', 'offenderTaxId', 'representative', 'representativeTaxId', 'vesselName', 'registrationNumber', 'address', 'location', 'occurredDate', 'occurredTime', 'article', 'clause', 'officialText', 'inspectorDescription', 'issuingOfficer', 'acknowledgement']),
  WITHDRAWAL_NOTICE: template('withdrawal-notice', 'Notificação para Retirada', '3-C', 48, 1, ['organization', 'date', 'interestedParty', 'address', 'organizationAddress', 'deadline', 'responsibleOfficer']),
  SUMMONS_NOTICE: template('summons-notice', 'Edital de Convocação', '3-D', 50, 1, ['organization', 'authority', 'organizationAddress', 'deadline', 'vesselDescription', 'date']),
  SEAL: template('seal', 'Tipo de Lacre e Autorização para Retirada de Lacre', '3-E', 52, 1, ['sealNumber', 'vesselName', 'location', 'dateTime', 'relatedNotice', 'observations', 'organization', 'legalBasis', 'inspector', 'removalAuthorization']),
  VESSEL_DELIVERY: template('vessel-delivery', 'Termo de Entrega de Embarcação', '3-F', 54, 1, ['organization', 'recipient', 'vesselName', 'type', 'classification', 'registrationNumber', 'engineBrand', 'owner', 'apprehensionDate', 'deliveryDate', 'authority']),
  APPREHENSION_NOTICE: template('apprehension-notice', 'Auto de Apreensão', '3-J', 68, 1, ['officialDocumentNumber', 'date', 'location', 'inspector', 'legalBasis', 'owner', 'vesselName', 'registrationNumber', 'registrationPort', 'engineNumber', 'conservationState', 'seizedMaterial', 'witnesses']),
  CUSTODIAN_TERM: template('custodian-term', 'Termo de Fiel Depositário', '3-K', 70, 2, ['organization', 'custodian', 'seizedAssets', 'apprehensionDate', 'apprehensionNoticeNumber', 'legalBasis', 'location', 'date', 'inspector', 'witnesses']),
});

export const getAdministrativeTemplate = (type) => ADMINISTRATIVE_DOCUMENT_TEMPLATES[type] || null;

