import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { projectApi } from '../../api/projectApi';
import type { Project } from '../../types/project.types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, workspaceId, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await projectApi.create(workspaceId, { name: name.trim(), description: description.trim() });
      onCreated(res.data.data);
      toast.success('Project created!');
      reset();
      onClose();
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to create project'
        : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a project" description="Projects hold sprints and tasks">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. Employee Management System"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
}