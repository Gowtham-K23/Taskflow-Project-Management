import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Calendar, Clock, Send, Paperclip, Trash2, Download, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge } from '../shared/PriorityBadge';
import { StatusBadge } from '../shared/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { taskApi } from '../../api/taskApi';
import { commentApi } from '../../api/commentApi';
import { attachmentApi } from '../../api/attachmentApi';
import type { Task, TaskStatus } from '../../types/task.types';
import type { Comment } from '../../types/comment.types';
import type { Attachment } from '../../types/attachment.types';
import type { WorkspaceMember } from '../../types/workspace.types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  workspaceId: number;
  projectId: number;
  sprintId: number;
  members: WorkspaceMember[];
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: number) => void;
}

const statusFlow: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export function TaskDetailModal({
  isOpen, onClose, task, workspaceId, projectId, sprintId, members, onUpdated, onDeleted,
}: TaskDetailModalProps) {
  const user = useAuthStore((s) => s.user);
  const isPM = user?.role === 'PROJECT_MANAGER';
  const isAssignee = task.assignedToUserId === user?.userId;
  const canChangeStatus = isPM || isAssignee;

  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    commentApi.getByTask(workspaceId, task.id).then((res) => setComments(res.data.data));
    attachmentApi.getByTask(workspaceId, task.id).then((res) => setAttachments(res.data.data));
  }, [isOpen, workspaceId, task.id]);

  const handleStatusChange = async (status: TaskStatus) => {
    if (status === 'DONE' && !isPM) {
      toast.error('Only a Project Manager can mark a task as Done');
      return;
    }
    try {
      const res = await taskApi.updateStatus(workspaceId, projectId, sprintId, task.id, { status });
      onUpdated(res.data.data);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message ?? 'Failed to update status' : 'Failed';
      toast.error(message);
    }
  };

  const handleAssign = async (userId: string) => {
    if (!userId) return;
    try {
      const res = await taskApi.assign(workspaceId, projectId, sprintId, task.id, { userId: Number(userId) });
      onUpdated(res.data.data);
      toast.success('Task reassigned');
    } catch {
      toast.error('Failed to assign task');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsCommentLoading(true);
    try {
      const res = await commentApi.create(workspaceId, task.id, { content: newComment.trim() });
      setComments((prev) => [...prev, res.data.data]);
      setNewComment('');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await attachmentApi.upload(workspaceId, task.id, file);
      setAttachments((prev) => [...prev, res.data.data]);
      toast.success('File uploaded');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message ?? 'Upload failed' : 'Upload failed';
      toast.error(message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const res = await attachmentApi.download(workspaceId, attachment.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await taskApi.delete(workspaceId, projectId, sprintId, task.id);
      toast.success('Task deleted');
      onDeleted(task.id);
      onClose();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-h-[75vh] overflow-y-auto -mx-6 -my-5 px-6 py-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
              {task.title}
            </h2>
          </div>
          {isPM && (
            <Button variant="ghost" size="sm" onClick={handleDeleteTask} className="text-danger-500 hover:bg-danger-500/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {task.description && (
          <p className="mt-3 text-sm leading-relaxed text-surface-600 dark:text-surface-300">
            {task.description}
          </p>
        )}

        {task.labels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span key={label} className="rounded-full bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Meta grid */}
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 p-4 sm:grid-cols-4">
          <MetaItem icon={<Calendar className="h-3.5 w-3.5" />} label="Due Date">
            {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
          </MetaItem>
          <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Estimated">
            {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
          </MetaItem>
          <MetaItem icon={<User className="h-3.5 w-3.5" />} label="Created By">
            {task.createdByName}
          </MetaItem>
          <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Created">
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </MetaItem>
        </div>

        {/* Status + Assignment controls */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-surface-500 dark:text-surface-400">
              Status
            </label>
            <div className="flex gap-1.5">
              {statusFlow.map((s) => (
                <button
                  key={s}
                  disabled={!canChangeStatus}
                  onClick={() => handleStatusChange(s)}
                  className={clsx(
                    'flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all',
                    task.status === s
                      ? 'bg-brand-600 text-white shadow-[var(--shadow-soft)]'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700',
                    !canChangeStatus && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-surface-500 dark:text-surface-400">
              Assigned To
            </label>
            {isPM ? (
              <select
                value={task.assignedToUserId ?? ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="h-10 w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex h-10 items-center gap-2 rounded-lg bg-surface-100 dark:bg-surface-800 px-3">
                {task.assignedToName ? (
                  <>
                    <Avatar name={task.assignedToName} size="xs" />
                    <span className="text-sm text-surface-700 dark:text-surface-200">{task.assignedToName}</span>
                  </>
                ) : (
                  <span className="text-sm text-surface-400">Unassigned</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">
              Attachments ({attachments.length})
            </h3>
            <label className="cursor-pointer">
              <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700">
                <Paperclip className="h-3.5 w-3.5" />
                {isUploading ? 'Uploading...' : 'Add file'}
              </span>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-lg border border-surface-200 dark:border-surface-800 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-surface-400" />
                    <span className="truncate text-sm text-surface-700 dark:text-surface-200">{att.fileName}</span>
                  </div>
                  <button onClick={() => handleDownload(att)} className="text-surface-400 hover:text-brand-600">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-surface-800 dark:text-surface-100">
            Comments ({comments.length})
          </h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <Avatar name={comment.userName} size="sm" />
                <div className="flex-1 rounded-xl bg-surface-50 dark:bg-surface-800/60 px-3.5 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-800 dark:text-surface-100">
                      {comment.userName}
                    </span>
                    <span className="text-[11px] text-surface-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-surface-600 dark:text-surface-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
              placeholder="Write a comment..."
              className="h-10 flex-1 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3.5 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
            <Button size="icon" onClick={handleAddComment} isLoading={isCommentLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MetaItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[11px] font-medium text-surface-400">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-sm font-medium text-surface-700 dark:text-surface-200">{children}</p>
    </div>
  );
}