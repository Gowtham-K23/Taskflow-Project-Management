import { useEffect, useState } from 'react';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { taskApi } from '../../api/taskApi';
import { workspaceApi } from '../../api/workspaceApi';
import type { Task } from '../../types/task.types';
import type { WorkspaceMember } from '../../types/workspace.types';
import { TaskCard } from '../../components/task/TaskCard';
import { TaskDetailModal } from '../../components/task/TaskDetailModal';
import { StatCard } from '../../components/shared/StatCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function MyTasksPage() {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    Promise.all([
      taskApi.getMyTasks(activeWorkspace.id),
      workspaceApi.getMembers(activeWorkspace.id),
    ])
      .then(([tasksRes, membersRes]) => {
        setTasks(tasksRes.data.data);
        setMembers(membersRes.data.data);
      })
      .finally(() => setIsLoading(false));
  }, [activeWorkspace]);

  if (!activeWorkspace) return null;

  const pending = tasks.filter((t) => t.status !== 'DONE');
  const completed = tasks.filter((t) => t.status === 'DONE');
  const overdue = tasks.filter((t) => t.overdue);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
          My Tasks
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Everything assigned to you in {activeWorkspace.name}
        </p>
      </div>

      {!isLoading && tasks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Pending" value={pending.length} icon={<Clock className="h-5 w-5" />} color="warning" />
          <StatCard label="Completed" value={completed.length} icon={<CheckSquare className="h-5 w-5" />} color="success" />
          <StatCard label="Overdue" value={overdue.length} icon={<AlertCircle className="h-5 w-5" />} color="danger" />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-6 w-6" />}
          title="No tasks assigned to you"
          description="When a Project Manager assigns you a task, it'll show up here"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
              onDragStart={() => {}}
            />
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          workspaceId={activeWorkspace.id}
          projectId={selectedTask.projectId}
          sprintId={selectedTask.sprintId}
          members={members}
          onUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setSelectedTask(updated);
          }}
          onDeleted={(taskId) => {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}