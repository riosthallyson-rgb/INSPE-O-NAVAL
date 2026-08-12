const template = (id, expectedLabels, optionalLabels = []) => Object.freeze({ id, documentType: id, expectedLabels, optionalLabels, source: 'Estrutura operacional; confirmar campos na publicação aplicável.' });

export const DOCUMENT_TEMPLATES = Object.freeze([
  template('TIE', ['título de inscrição de embarcação', 'número de inscrição'], ['porto de inscrição', 'área de navegação', 'lotação', 'proprietário']),
  template('TIEM', ['título de inscrição de embarcação miúda', 'número de inscrição'], ['proprietário', 'porto de inscrição']),
  template('PRPM', ['provisão de registro da propriedade marítima'], ['nome da embarcação', 'proprietário']),
  template('CHA', ['carteira de habilitação de amador'], ['categoria', 'validade', 'número']),
  template('CIR', ['caderneta de inscrição e registro'], ['categoria', 'validade', 'número']),
  template('CTS', ['cartão de tripulação de segurança'], ['função', 'categoria', 'quantidade']),
]);

export const getDocumentTemplate = (type) => DOCUMENT_TEMPLATES.find((item) => item.documentType === type) || null;
