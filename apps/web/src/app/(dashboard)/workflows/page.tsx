'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = trpc.workflows.list.useQuery();
  const executeMutation = trpc.workflows.execute.useMutation();

  const handleExecute = async (workflowId: string) => {
    try {
      await executeMutation.mutateAsync({ workflowId });
      alert('Workflow started!');
    } catch (error) {
      alert('Failed to start workflow');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Orchestrate multi-agent workflows</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {workflows?.map((workflow) => {
          const steps = (workflow.steps as any[]) || [];
          return (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description || 'No description'}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleExecute(workflow.id)}
                    disabled={!workflow.isActive}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Run
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Steps:</span>
                    <span className="font-medium">{steps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trigger:</span>
                    <span>{workflow.trigger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Runs:</span>
                    <span>{workflow._count?.runs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={workflow.isActive ? 'text-green-600' : 'text-gray-400'}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{formatDate(workflow.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
