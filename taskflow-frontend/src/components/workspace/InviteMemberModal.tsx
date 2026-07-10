import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Mail } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { invitationApi } from '../../api/invitationApi';
import type { Role } from '../../types/auth.types';
import type { Invitation } from '../../api/invitationApi';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
  onInvited: (invitation: Invitation) => void;
}

const roleOptions: Role[] = ['TEAM_MEMBER', 'PROJECT_MANAGER'];

export function InviteMemberModal({ isOpen, onClose, workspaceId, onInvited }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('TEAM_MEMBER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await invitationApi.create(workspaceId, { email: email.trim(), role });
      onInvited(res.data.data);
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setRole('TEAM_MEMBER');
      onClose();
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to send invitation'
        : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite a team member" description="They'll receive an email with a link to join">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="colleague@company.com"
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">
            Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roleOptions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={clsx(
                  'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all',
                  role === r
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-700'
                )}
              >
                {r === 'TEAM_MEMBER' ? 'Team Member' : 'Project Manager'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Send Invitation</Button>
        </div>
      </form>
    </Modal>
  );
}