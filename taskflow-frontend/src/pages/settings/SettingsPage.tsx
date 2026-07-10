import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { User, Lock, Palette, LogOut, Mail, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { userApi } from '../../api/userApi';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import type { UserProfile } from '../../types/auth.types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user: authUser, logout, setAuth, token } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    userApi
      .getProfile()
      .then((res) => {
        setProfile(res.data.data);
        setName(res.data.data.name);
      })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ name: name.trim() });
      setProfile(res.data.data);

      // Keep the auth store in sync so the sidebar/topbar reflect the new name immediately
      if (authUser && token) {
        setAuth({
          token,
          userId: authUser.userId,
          name: res.data.data.name,
          email: authUser.email,
          role: authUser.role,
        });
      }

      toast.success('Profile updated successfully');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message ?? 'Failed to update profile' : 'Failed';
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (newPassword.length < 6) errors.newPassword = 'Must be at least 6 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingPassword(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message ?? 'Failed to change password' : 'Failed';
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    if (!confirm('Are you sure you want to log out?')) return;
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile overview */}
      {!isLoadingProfile && profile && (
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} size="lg" />
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold text-surface-900 dark:text-surface-50">
                {profile.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                </span>
              </div>
            </div>
            <Badge color="brand">
              <Shield className="h-3 w-3" />
              {profile.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Team Member'}
            </Badge>
          </div>
        </Card>
      )}

      {/* Update profile */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-500" />
              Profile Information
            </span>
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={profile?.email ?? ''} disabled hint="Email cannot be changed" />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSavingProfile}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-500" />
              Change Password
            </span>
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={passwordErrors.currentPassword}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={passwordErrors.newPassword}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordErrors.confirmPassword}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSavingPassword}>Update Password</Button>
          </div>
        </form>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-brand-500" />
              Appearance
            </span>
          </CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-700 dark:text-surface-200">Theme</p>
            <p className="text-xs text-surface-400">
              Currently using {theme === 'dark' ? 'dark' : 'light'} mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-danger-200 dark:border-danger-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">Log out</p>
            <p className="text-xs text-surface-400">Sign out of your account on this device</p>
          </div>
          <Button variant="danger" leftIcon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
}