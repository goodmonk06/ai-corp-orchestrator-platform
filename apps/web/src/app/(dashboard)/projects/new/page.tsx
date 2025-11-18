'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectForm } from '@/components/projects/project-form';

export default function NewProjectPage() {
  const router = useRouter();
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      router.push(`/projects/${project.id}`);
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/projects">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Add a new project to your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            submitLabel="Create Project"
          />
        </CardContent>
      </Card>
    </div>
  );
}
