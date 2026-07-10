import { useEffect, useState } from 'react';
import { UserPlus, Users, Mail, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { workspaceApi } from '../../api/workspaceApi';
import { invitationApi } from '../../api/invitationApi';
import type { Invitation } from '../../api/invitationApi';
import type { WorkspaceMember } from '../../types/workspace.types';
import { InviteMemberModal } from '../../components/workspace/InviteMemberModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function MembersPage() {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    Promise.all([
      workspaceApi.getMembers(activeWorkspace.id),
      invitationApi.getAll(activeWorkspace.id),
    ])
      .then(([membersRes, invitationsRes]) => {
        setMembers(membersRes.data.data);
        setInvitations(invitationsRes.data.data.filter((i) => i.status === 'PENDING'));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(loadData, [activeWorkspace]);

  const handleCancelInvite = async (invitationId: number) => {
    if (!activeWorkspace) return;
    try {
      await invitationApi.cancel(activeWorkspace.id, invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      toast.success('Invitation cancelled');
    } catch {
      toast.error('Failed to cancel invitation');
    }
  };

  if (!activeWorkspace) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
            Team
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {activeWorkspace.name} · {members.length} member{members.length !== 1 && 's'}
          </p>
        </div>
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          Invite Member
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Active members */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-surface-700 dark:text-surface-200">
              <Users className="h-4 w-4" />
              Members
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div key={member.userId} className="card-surface flex items-center gap-3 p-4">
                  <Avatar name={member.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-surface-800 dark:text-surface-100">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-surface-400">{member.email}</p>
                  </div>
                  <Badge color={member.role === 'PROJECT_MANAGER' ? 'brand' : 'neutral'}>
                    {member.role === 'PROJECT_MANAGER' ? 'PM' : 'Member'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Pending invitations */}
          {invitations.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-surface-700 dark:text-surface-200">
                <Clock className="h-4 w-4" />
                Pending Invitations
              </h2>
              <div className="space-y-2">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="card-surface flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-100">
                          {invite.email}
                        </p>
                        <p className="text-xs text-surface-400">
                          Invited {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })} by {invite.invitedByName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color="warning">{invite.role === 'PROJECT_MANAGER' ? 'PM' : 'Member'}</Badge>
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <InviteMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={activeWorkspace.id}
        onInvited={(invite) => setInvitations((prev) => [invite, ...prev])}
      />
    </div>
  );
}