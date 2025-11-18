'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { TaskForm, TaskFormData } from '@/components/tasks/task-form';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const { data: task, isLoading } = trpc.tasks.getById.useQuery({ id: params.id });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      router.push(`/tasks/${params.id}`);
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    updateMutation.mutate({
      id: params.id,
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-4">The task you're trying to edit doesn't exist.</p>
          <Link
            href="/tasks"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
          ← Back to Task
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Task</h1>
        <p className="text-gray-600">Update the details of "{task.title}".</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TaskForm
          initialData={{
            title: task.title,
            description: task.description || '',
            projectId: task.projectId,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId || '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </div>

      {updateMutation.isError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">
            Error updating task: {updateMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
