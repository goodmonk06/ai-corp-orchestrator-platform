'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
  BLOCKED: 'bg-red-100 text-red-800',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: task, isLoading } = trpc.tasks.getById.useQuery({ id: params.id });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      router.push('/tasks');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ id: params.id });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/tasks" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
          ← Back to Tasks
        </Link>
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex space-x-2">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Status and Priority Badges */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {task.priority} Priority
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Project</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <Link
                  href={`/projects/${task.project.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {task.project.name}
                </Link>
              </dd>
            </div>

            {/* Assignee */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Assignee</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {task.assignee ? (task.assignee.name || task.assignee.email) : 'Unassigned'}
              </dd>
            </div>

            {/* Due Date */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'No due date'}
              </dd>
            </div>

            {/* Created */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>

            {/* Updated */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(task.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>

            {/* Task ID */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Task ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{task.id}</dd>
            </div>
          </dl>
        </div>

        {/* Metadata */}
        {task.metadata && Object.keys(task.metadata).length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h2>
            <pre className="bg-gray-50 rounded p-3 text-sm overflow-x-auto">
              {JSON.stringify(task.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {deleteMutation.isError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">
            Error deleting task: {deleteMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
