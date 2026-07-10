import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Lock, LayoutGrid, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { invitationApi } from '../../api/invitationApi';
import { useAuthStore } from '../../store/authStore';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
            Invalid invitation link
          </h1>
          <p className="mt-2 text-sm text-surface-500">This invitation link is missing or malformed.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-brand-600 dark:text-brand-400">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await invitationApi.accept({ token, name, password });
      setAuth(res.data.data);
      toast.success('Welcome to TaskFlow!');
      navigate('/dashboard');
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to accept invitation'
        : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/30 dark:bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-300/20 dark:bg-accent-600/10 blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[var(--shadow-glow-brand)]">
              <LayoutGrid className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
              You've been invited!
            </h1>
            <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
              Complete your account to join the workspace
            </p>
          </div>

          <div className="card-surface p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<User className="h-4 w-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                autoFocus
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                leftIcon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Join Workspace
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}