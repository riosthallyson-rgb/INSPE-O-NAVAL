import React from 'react';
import { Modal, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '../../components';
import { getTheme } from '../../theme/tokens';

export const QrDocumentCamera = ({ visible, darkMode, onClose, onScanned }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const [permission, requestPermission] = useCameraPermissions();
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen"><View style={{ flex: 1, backgroundColor: '#071521', padding: spacing.lg }}><Text style={[typography.sectionTitle, { color: '#FFFFFF', marginTop: spacing.xl }]}>Ler QR Code do documento</Text><Text style={[typography.body, { color: '#D8E5EE', marginTop: spacing.sm }]}>Centralize o QR dentro da moldura. Evite reflexos, ajuste a distância e aguarde o foco.</Text>{!permission?.granted ? <View style={{ flex: 1, justifyContent: 'center' }}><Text style={[typography.body, { color: '#FFFFFF', marginBottom: spacing.md }]}>Permissão da câmera não concedida.</Text><Button label="Permitir câmera" onPress={requestPermission} darkMode={darkMode} /><Button label="Voltar" variant="secondary" onPress={onClose} darkMode={darkMode} style={{ marginTop: spacing.sm }} /></View> : <View style={{ flex: 1, marginVertical: spacing.lg, borderRadius: 20, overflow: 'hidden' }}><CameraView style={{ flex: 1 }} facing="back" autofocus="on" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScanned}><View pointerEvents="none" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{ width: 250, height: 250, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 20 }} /></View></CameraView></View>}{permission?.granted ? <Button label="Cancelar leitura" variant="secondary" onPress={onClose} darkMode={darkMode} /> : null}<Text style={[typography.caption, { color: colors.pending, marginTop: spacing.sm }]}>Ler o QR Code não confirma a autenticidade do documento.</Text></View></Modal>;
};
