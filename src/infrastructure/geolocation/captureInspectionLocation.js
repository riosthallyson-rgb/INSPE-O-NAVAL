import * as Location from 'expo-location';
import { createInspectionLocation } from '../../domain/geospatial/inspectionLocation';

export const captureCurrentInspectionLocation = async ({ inspectionId, timeoutMs = 15000 }) => {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('Permissão de localização não concedida.');
  const capture = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  let timeout;
  try {
    const position = await Promise.race([capture, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Não foi possível obter a localização dentro do tempo esperado.')), timeoutMs); })]);
    return createInspectionLocation({ id: `local-${Date.now()}`, inspectionId, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, altitude: position.coords.altitude, heading: position.coords.heading, capturedAt: new Date(position.timestamp).toISOString(), method: 'GPS' });
  } finally {
    clearTimeout(timeout);
  }
};
