import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './app/router';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--color-surface-0)',
            color: 'var(--color-surface-900)',
            borderRadius: '0.75rem',
            boxShadow: 'var(--shadow-elevated)',
            fontSize: '0.875rem',
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;