import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export const InspectionPointMap = ({ latitude, longitude }) => <MapView style={{ height: 220, marginTop: 16 }} initialRegion={{ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }} scrollEnabled zoomEnabled><Marker coordinate={{ latitude, longitude }} title="Local da inspeção" /></MapView>;
