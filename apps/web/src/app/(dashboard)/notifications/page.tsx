'use client';

import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import Link from 'next/link';

const priorityColors = {
  LOW: 'border-gray-300',
  NORMAL: 'border-blue-300',
  HIGH: 'border-orange-300',
  URGENT: 'border-red-300',
};

const typeIcons = {
  TASK_ASSIGNED: '📋',
  TASK_COMPLETED: '✅',
  TASK_DUE_SOON: '⏰',
  WORKFLOW_COMPLETED: '🎉',
  WORKFLOW_FAILED: '❌',
  PROJECT_UPDATED: '📊',
  MENTION: '@',
  SYSTEM: '⚙️',
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<{
    read?: boolean;
    type?: string;
    priority?: string;
  }>({});

  const { data: notifications, isLoading, refetch } = trpc.notifications.list.useQuery({
    ...(filter.read !== undefined && { read: filter.read }),
    ...(filter.type && { type: filter.type as any }),
    ...(filter.priority && { priority: filter.priority as any }),
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteAllReadMutation = trpc.notifications.deleteAllRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  const handleDeleteAllRead = () => {
    if (confirm('Are you sure you want to delete all read notifications?')) {
      deleteAllReadMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark all as read
        </button>
        <button
          onClick={handleDeleteAllRead}
          disabled={deleteAllReadMutation.isPending}
          className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete all read
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Read Status
            </label>
            <select
              value={filter.read === undefined ? '' : filter.read.toString()}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  read: e.target.value === '' ? undefined : e.target.value === 'true',
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filter.type || ''}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  type: e.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="TASK_ASSIGNED">Task Assigned</option>
              <option value="TASK_COMPLETED">Task Completed</option>
              <option value="TASK_DUE_SOON">Task Due Soon</option>
              <option value="WORKFLOW_COMPLETED">Workflow Completed</option>
              <option value="WORKFLOW_FAILED">Workflow Failed</option>
              <option value="PROJECT_UPDATED">Project Updated</option>
              <option value="MENTION">Mention</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filter.priority || ''}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  priority: e.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                priorityColors[notification.priority as keyof typeof priorityColors]
              } ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {typeIcons[notification.type as keyof typeof typeIcons]}
                    </span>
                    <h3 className={`text-lg font-semibold text-gray-900 ${
                      !notification.read ? 'font-bold' : ''
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {notification.priority}
                    </span>
                  </div>
                  {notification.actionUrl && (
                    <Link
                      href={notification.actionUrl}
                      className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details →
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {Object.keys(filter).length > 0
              ? 'No notifications match your filters.'
              : 'You have no notifications at this time.'}
          </p>
        </div>
      )}
    </div>
  );
}
