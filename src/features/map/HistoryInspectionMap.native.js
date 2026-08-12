import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export const HistoryInspectionMap = ({ inspections }) => {
  const first = inspections[0];
  return <MapView style={{ height: 320 }} initialRegion={{ latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 }}>{inspections.slice(0, 50).map((item) => <Marker key={item.id} coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={`Inspeção ${item.id}`} description={`${item.vesselName} · ${item.date}`} pinColor={item.markerColor} />)}</MapView>;
};
