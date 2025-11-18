'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectForm } from '@/components/projects/project-form';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: project, isLoading } = trpc.projects.getById.useQuery({ id: params.id });
  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      router.push(`/projects/${params.id}`);
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({
        id: params.id,
        ...data,
      });
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
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

  return (
    <div className="space-y-6">
      <Link href={`/projects/${params.id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
          <CardDescription>Update project details</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            initialData={{
              name: project.name,
              description: project.description || '',
              status: project.status,
              ownerId: project.ownerId || undefined,
            }}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
            submitLabel="Update Project"
          />
        </CardContent>
      </Card>
    </div>
  );
}
