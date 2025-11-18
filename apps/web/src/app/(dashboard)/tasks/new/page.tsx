'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { TaskForm, TaskFormData } from '@/components/tasks/task-form';

export default function NewTaskPage() {
  const router = useRouter();
  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: (task) => {
      router.push(`/tasks/${task.id}`);
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    createMutation.mutate({
      title: data.title,
      description: data.description || undefined,
      projectId: data.projectId,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Task</h1>
        <p className="text-gray-600">Add a new task to your project.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TaskForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitLabel="Create Task"
        />
      </div>

      {createMutation.isError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">
            Error creating task: {createMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
