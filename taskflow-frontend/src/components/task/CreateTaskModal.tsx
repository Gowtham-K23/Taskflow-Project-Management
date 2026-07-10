import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { taskApi } from '../../api/taskApi';
import type { Task, Priority } from '../../types/task.types';
import type { WorkspaceMember } from '../../types/workspace.types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
  projectId: number;
  sprintId: number;
  members: WorkspaceMember[];
  onCreated: (task: Task) => void;
}

const priorityOptions: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function CreateTaskModal({
  isOpen, onClose, workspaceId, projectId, sprintId, members, onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setTitle(''); setDescription(''); setPriority('MEDIUM'); setDueDate('');
    setEstimatedHours(''); setAssignedToUserId(''); setLabelInput(''); setLabels([]); setError('');
  };

  const addLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
    }
    setLabelInput('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await taskApi.create(workspaceId, projectId, sprintId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        assignedToUserId: assignedToUserId ? Number(assignedToUserId) : undefined,
        labels,
      });
      onCreated(res.data.data);
      toast.success('Task created!');
      reset();
      onClose();
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to create task'
        : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Develop Login Module"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe the task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="h-11 w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3.5 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            >
              {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Assign To
            </label>
            <select
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="h-11 w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3.5 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input
            label="Estimated Hours"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 8"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            Labels
          </label>
          <div className="flex gap-2">
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
              placeholder="Type a label and press Enter"
              className="h-10 flex-1 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            />
            <Button type="button" variant="outline" size="sm" onClick={addLabel}>Add</Button>
          </div>
          {labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {labels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1 rounded-full bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400"
                >
                  {label}
                  <button type="button" onClick={() => setLabels(labels.filter((l) => l !== label))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}