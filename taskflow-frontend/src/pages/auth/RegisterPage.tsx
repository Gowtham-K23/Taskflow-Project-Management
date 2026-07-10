import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, LayoutGrid, Briefcase, UserCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types/auth.types';
import { isAxiosError } from 'axios';

const roleOptions: { value: Role; label: string; description: string; icon: typeof Briefcase }[] = [
  {
    value: 'PROJECT_MANAGER',
    label: 'Project Manager',
    description: 'Create workspaces, manage projects & teams',
    icon: Briefcase,
  },
  {
    value: 'TEAM_MEMBER',
    label: 'Team Member',
    description: 'Work on assigned tasks & collaborate',
    icon: UserCircle,
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PROJECT_MANAGER');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
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
      const res = await authApi.register({ name, email, password, role });
      setAuth(res.data.data);
      toast.success('Account created! Welcome to TaskFlow.');
      navigate('/dashboard');
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Registration failed'
        : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-300/30 dark:bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-300/20 dark:bg-accent-600/10 blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[var(--shadow-glow-brand)]">
              <LayoutGrid className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
              Start managing projects with your team
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
                autoComplete="name"
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                leftIcon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                leftIcon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="new-password"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">
                  I am joining as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = role === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        className={clsx(
                          'relative flex flex-col items-start gap-2 rounded-xl border-2 p-3.5 text-left transition-all duration-200',
                          isSelected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                            : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700'
                        )}
                      >
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500">
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                        <Icon
                          className={clsx(
                            'h-5 w-5',
                            isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400'
                          )}
                        />
                        <div>
                          <p className={clsx(
                            'text-sm font-semibold',
                            isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-surface-800 dark:text-surface-200'
                          )}>
                            {option.label}
                          </p>
                          <p className="mt-0.5 text-xs leading-snug text-surface-500 dark:text-surface-400">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create Account
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}