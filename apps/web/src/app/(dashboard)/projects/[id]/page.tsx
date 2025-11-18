'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: project, isLoading } = trpc.projects.getById.useQuery({ id: params.id });
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      router.push('/projects');
    },
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: params.id });
    } catch (error) {
      alert('Failed to delete project');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <Link href="/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PLANNING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    ON_HOLD: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/projects/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <CardDescription className="mt-2">
                {project.description || 'No description provided'}
              </CardDescription>
            </div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                statusColors[project.status]
              }`}
            >
              {project.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
              <p className="mt-1 text-lg">
                {project.owner ? project.owner.name || project.owner.email : 'Unassigned'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
              <p className="mt-1 text-lg">{project.tasks?.length || 0}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="mt-1 text-lg">{formatDateTime(project.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="mt-1 text-lg">{formatDateTime(project.updatedAt)}</p>
            </div>
          </div>

          {project.metadata && Object.keys(project.metadata).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h3>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
                {JSON.stringify(project.metadata, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Tasks associated with this project</CardDescription>
        </CardHeader>
        <CardContent>
          {project.tasks && project.tasks.length > 0 ? (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.status} • Priority: {task.priority}
                    </p>
                  </div>
                  {task.assignee && (
                    <div className="text-sm text-muted-foreground">
                      Assigned to: {task.assignee.name || task.assignee.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tasks yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
