import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('TaskFlow crashed:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
          <div className="w-full max-w-md text-center animate-fade-in">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-500/10 text-danger-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              An unexpected error occurred. Try reloading the page — if the problem continues, please let us know.
            </p>
            <Button className="mt-6" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={this.handleReload}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}