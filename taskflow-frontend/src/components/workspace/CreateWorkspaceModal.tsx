import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { workspaceApi } from '../../api/workspaceApi';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await workspaceApi.create({ name: name.trim() });
      const newWorkspace = res.data.data;
      setWorkspaces([...workspaces, newWorkspace]);
      setActiveWorkspace(newWorkspace);
      toast.success('Workspace created!');
      setName('');
      onClose();
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to create workspace'
        : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a workspace"
      description="A workspace organizes your projects, teams, and tasks"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workspace Name"
          placeholder="e.g. ABC Technologies"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          autoFocus
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}