'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';

interface ProjectFormProps {
  initialData?: {
    name: string;
    description: string;
    status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    ownerId?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

export function ProjectForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'PLANNING',
    ownerId: initialData?.ownerId || '',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: users } = trpc.users.list.useQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status as any,
        ownerId: formData.ownerId || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter project name"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter project description"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div>
        <label htmlFor="ownerId" className="block text-sm font-medium mb-2">
          Owner
        </label>
        <select
          id="ownerId"
          value={formData.ownerId}
          onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Unassigned</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
