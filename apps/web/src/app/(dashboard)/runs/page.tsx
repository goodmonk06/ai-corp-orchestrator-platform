'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, PlayCircle, Ban } from 'lucide-react';

const statusIcons = {
  PENDING: Clock,
  RUNNING: PlayCircle,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  CANCELLED: Ban,
};

const statusColors = {
  PENDING: 'text-gray-500',
  RUNNING: 'text-blue-500',
  COMPLETED: 'text-green-500',
  FAILED: 'text-red-500',
  CANCELLED: 'text-orange-500',
};

export default function RunsPage() {
  const { data: runs, isLoading } = trpc.runs.list.useQuery({ limit: 50 });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Workflow Runs</h1>
        <p className="text-muted-foreground">Monitor workflow execution history</p>
      </div>

      <div className="space-y-4">
        {runs?.map((run) => {
          const StatusIcon = statusIcons[run.status];
          return (
            <Card key={run.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{run.workflow.name}</CardTitle>
                  <div className={`flex items-center gap-2 ${statusColors[run.status]}`}>
                    <StatusIcon className="h-5 w-5" />
                    <span className="font-medium">{run.status}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="font-medium">
                      {run.startedAt ? formatDateTime(run.startedAt) : 'Not started'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">
                      {run.completedAt ? formatDateTime(run.completedAt) : 'In progress'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agent Instances</p>
                    <p className="font-medium">{run.agentInstances?.length || 0}</p>
                  </div>
                </div>
                {run.error && (
                  <div className="mt-4 rounded-md bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-800">Error:</p>
                    <p className="text-sm text-red-700">{run.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
