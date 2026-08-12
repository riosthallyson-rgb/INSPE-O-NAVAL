import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const formatUnexpectedError = (error) =>
  error instanceof Error && error.message
    ? `Falha inesperada: ${error.message}`
    : 'Falha inesperada ao exibir esta tela.';

export class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={boundaryStyles.container} accessibilityRole="alert">
        <Text style={boundaryStyles.title}>Não foi possível abrir esta tela</Text>
        <Text style={boundaryStyles.message}>{formatUnexpectedError(this.state.error)}</Text>
        <Text style={boundaryStyles.guidance}>
          Seus registros permanecem no dispositivo. Tente novamente; se a falha continuar, reinicie o aplicativo.
        </Text>
        <TouchableOpacity
          style={boundaryStyles.button}
          onPress={this.handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Tentar abrir a tela novamente"
        >
          <Text style={boundaryStyles.buttonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const boundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#E8F0FF',
  },
  title: {
    color: '#0B2653',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  message: {
    color: '#7C2D12',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  guidance: {
    color: '#324A6E',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#214EAB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
