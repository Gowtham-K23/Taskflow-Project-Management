import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500">
          <LayoutGrid className="h-8 w-8" />
        </div>
        <h1 className="font-display text-5xl font-bold text-surface-900 dark:text-surface-50">404</h1>
        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/dashboard">
          <Button className="mt-6" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}