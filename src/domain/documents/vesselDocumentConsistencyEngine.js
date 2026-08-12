const compare = (field, label, documented, observed) => documented && observed && String(documented).trim().toLowerCase() !== String(observed).trim().toLowerCase() ? { field, label, documented: String(documented), observed: String(observed), status: 'POSSIBLE_DIVERGENCE', confirmedByUser: false } : null;

export const compareVesselDocument = ({ confirmedDocumentValues = {}, vessel = {}, occupancy = {} }) => {
  const comparisons = [
    compare('vesselName', 'Nome da embarcação', confirmedDocumentValues.vesselName, vessel.name),
    compare('vesselType', 'Tipo', confirmedDocumentValues.vesselType, vessel.type),
    compare('authorizedNavigationArea', 'Área de navegação', confirmedDocumentValues.authorizedNavigationArea, vessel.navigationArea),
  ].filter(Boolean);
  const authorized = Number.parseInt(confirmedDocumentValues.authorizedCapacity, 10);
  const onBoard = Number.parseInt(occupancy.totalPersons, 10);
  if (Number.isFinite(authorized) && Number.isFinite(onBoard) && onBoard > authorized) comparisons.push({ field: 'authorizedCapacity', label: 'Lotação', documented: String(authorized), observed: String(onBoard), status: 'POSSIBLE_CAPACITY_EXCESS', confirmedByUser: false });
  return comparisons;
};
