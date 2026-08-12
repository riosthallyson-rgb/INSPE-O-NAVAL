import App from './src/App';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';

export default function RootApp() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}
