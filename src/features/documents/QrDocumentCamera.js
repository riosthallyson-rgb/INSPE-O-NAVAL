import React, { useEffect, useState } from 'react';
import { Alert, Modal, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Card } from '../../components';
import { getTheme } from '../../theme/tokens';

export const QrDocumentCamera = ({ visible, darkMode, onClose, onScanned }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanLocked, setScanLocked] = useState(false);

  useEffect(() => {
    if (visible) setScanLocked(false);
  }, [visible]);

  const requestCamera = async () => {
    try {
      const result = await requestPermission();
      if (!result?.granted) {
        Alert.alert('Câmera não autorizada', 'Ative a permissão de câmera nas configurações do aparelho para ler o QR Code ao vivo. Você ainda pode importar uma foto do documento.');
      }
    } catch (error) {
      Alert.alert('Câmera indisponível', error?.message || 'Não foi possível solicitar acesso à câmera. Verifique as permissões do aparelho e tente novamente.');
    }
  };

  const handleScan = (scan) => {
    if (scanLocked || !scan?.data) return;
    setScanLocked(true);
    onScanned(scan);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={[typography.sectionTitle, { color: colors.text, marginTop: spacing.xl }]}>Ler QR Code do documento</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>Centralize o QR dentro da moldura. Evite reflexos, ajuste a distância e aguarde o foco.</Text>

        {!permission?.granted ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Card darkMode={darkMode} variant="warning">
              <Text style={[typography.bodyStrong, { color: colors.text }]}>Permissão da câmera necessária</Text>
              <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>A leitura ao vivo só funciona com acesso à câmera. Negar a permissão não bloqueia o restante da inspeção.</Text>
            </Card>
            <Button label="Permitir câmera" onPress={requestCamera} darkMode={darkMode} />
            <Button label="Voltar" variant="secondary" onPress={onClose} darkMode={darkMode} style={{ marginTop: spacing.sm }} />
          </View>
        ) : (
          <View style={{ flex: 1, marginVertical: spacing.lg, borderRadius: radii.card, overflow: 'hidden' }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              autofocus="on"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanLocked ? undefined : handleScan}
            >
              <View pointerEvents="none" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '72%', maxWidth: 280, aspectRatio: 1, borderWidth: 3, borderColor: colors.onAction, borderRadius: radii.card }} />
              </View>
            </CameraView>
          </View>
        )}

        {permission?.granted ? <Button label="Cancelar leitura" variant="secondary" onPress={onClose} darkMode={darkMode} /> : null}
        <Text style={[typography.caption, { color: colors.pending, marginTop: spacing.sm }]}>A leitura extrai dados para conferência. Ela não confirma a autenticidade nem valida o documento.</Text>
      </View>
    </Modal>
  );
};
