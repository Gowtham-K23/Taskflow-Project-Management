import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { sprintApi } from '../../api/sprintApi';
import { taskApi } from '../../api/taskApi';
import { workspaceApi } from '../../api/workspaceApi';
import { useAuthStore } from '../../store/authStore';
import type { Sprint } from '../../types/sprint.types';
import type { Task, TaskStatus } from '../../types/task.types';
import type { WorkspaceMember } from '../../types/workspace.types';
import { TaskCard } from '../../components/task/TaskCard';
import { CreateTaskModal } from '../../components/task/CreateTaskModal';
import { TaskDetailModal } from '../../components/task/TaskDetailModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'REVIEW', label: 'Review' },
  { status: 'DONE', label: 'Done' },
];

export default function SprintBoardPage() {
  const { workspaceId, projectId, sprintId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isPM = user?.role === 'PROJECT_MANAGER';

  const wsId = Number(workspaceId);
  const pId = Number(projectId);
  const spId = Number(sprintId);

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    Promise.all([
      sprintApi.getById(wsId, pId, spId),
      taskApi.getAll(wsId, pId, spId),
      workspaceApi.getMembers(wsId),
    ])
      .then(([sprintRes, tasksRes, membersRes]) => {
        setSprint(sprintRes.data.data);
        setTasks(tasksRes.data.data);
        setMembers(membersRes.data.data);
      })
      .finally(() => setIsLoading(false));
  }, [wsId, pId, spId]);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', String(taskId));
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = Number(e.dataTransfer.getData('taskId'));
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    if (newStatus === 'DONE' && !isPM) {
      toast.error('Only a Project Manager can mark a task as Done');
      return;
    }

    const previousTasks = tasks;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await taskApi.updateStatus(wsId, pId, spId, taskId, { status: newStatus });
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update task status');
    }
  };

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 shimmer-bg rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-96 shimmer-bg rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!sprint) return null;

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <button
        onClick={() => navigate(`/projects/${pId}`)}
        className="mb-4 flex w-fit items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
              {sprint.name}
            </h1>
            <Badge color={sprint.status === 'ACTIVE' ? 'info' : sprint.status === 'COMPLETED' ? 'success' : 'neutral'} dot>
              {sprint.status}
            </Badge>
          </div>
          {sprint.goal && <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{sprint.goal}</p>}
        </div>
        {isPM && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateModalOpen(true)}>
            New Task
          </Button>
        )}
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {columns.map((col) => {
          const colTasks = tasksByStatus(col.status);
          return (
            <div
              key={col.status}
              onDragOver={(e) => { e.preventDefault(); setDragOverStatus(col.status); }}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={clsx(
              'flex w-72 shrink-0 flex-col rounded-xl border-2 border-dashed p-3 transition-colors min-h-[400px] sm:w-auto',
              dragOverStatus === col.status
                  ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-500/5'
                  : 'border-transparent bg-surface-100/50 dark:bg-surface-800/30'
            )}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-200">{col.label}</h3>
                <span className="rounded-full bg-surface-200 dark:bg-surface-700 px-2 py-0.5 text-xs font-medium text-surface-600 dark:text-surface-300">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-2.5">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onDragStart={handleDragStart}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-lg py-8 text-center text-xs text-surface-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={wsId}
        projectId={pId}
        sprintId={spId}
        members={members}
        onCreated={(task) => setTasks((prev) => [...prev, task])}
      />

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          workspaceId={wsId}
          projectId={pId}
          sprintId={spId}
          members={members}
          onUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setSelectedTask(updated);
          }}
          onDeleted={(taskId) => setTasks((prev) => prev.filter((t) => t.id !== taskId))}
        />
      )}
    </div>
  );
}