import { normalizeCompassText } from '../index/compassIndex';

export const classifyCompassIntent = (question) => {
  const value = normalizeCompassText(question);
  if (/neste local|aqui|regras do local|jurisdicao|npcp|npcf/.test(value)) return 'LOCATION_RULES';
  if (/o que e|defina|diferenca/.test(value)) return 'DEFINITION';
  if (/prazo|quantos dias/.test(value)) return 'DEADLINE';
  if (/apreens|retirada de trafego|impedimento de saida/.test(value)) return 'ADMINISTRATIVE_MEASURE';
  if (/cha|cir|habilita/.test(value)) return 'DRIVER_LICENSE';
  if (/tie|prpm|documento/.test(value)) return 'DOCUMENT';
  if (/colete|boia|extintor|luzes|salvatagem/.test(value)) return 'EQUIPMENT';
  if (/lotacao|capacidade|lista.*passageir|passageir.*lista|transbordo/.test(value)) return 'PASSENGER_OPERATION';
  return 'GENERAL_SEARCH';
};
