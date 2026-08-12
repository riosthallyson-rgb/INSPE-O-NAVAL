import { formatUnexpectedError } from '../src/components/AppErrorBoundary';

describe('mensagem de falha inesperada', () => {
  test('preserva uma mensagem técnica útil sem inventar causa', () => {
    expect(formatUnexpectedError(new Error('PDF indisponível'))).toBe(
      'Falha inesperada: PDF indisponível'
    );
  });

  test('usa mensagem segura para valores desconhecidos', () => {
    expect(formatUnexpectedError(null)).toBe('Falha inesperada ao exibir esta tela.');
  });
});
