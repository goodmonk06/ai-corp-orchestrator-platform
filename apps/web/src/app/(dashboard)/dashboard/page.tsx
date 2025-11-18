'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Bot, Workflow, PlayCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: agents } = trpc.agents.listProfiles.useQuery();
  const { data: workflows } = trpc.workflows.list.useQuery();
  const { data: runs } = trpc.runs.list.useQuery({ limit: 10 });

  const stats = [
    {
      name: 'Active Projects',
      value: projects?.filter((p) => p.status === 'ACTIVE').length || 0,
      icon: FolderKanban,
      color: 'text-blue-600',
    },
    {
      name: 'AI Agents',
      value: agents?.filter((a) => a.isActive).length || 0,
      icon: Bot,
      color: 'text-purple-600',
    },
    {
      name: 'Workflows',
      value: workflows?.filter((w) => w.isActive).length || 0,
      icon: Workflow,
      color: 'text-green-600',
    },
    {
      name: 'Recent Runs',
      value: runs?.length || 0,
      icon: PlayCircle,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your AI Corporation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Latest project activity</CardDescription>
          </CardHeader>
          <CardContent>
            {projects?.slice(0, 5).map((project) => (
              <div key={project.id} className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.status}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {project._count?.tasks || 0} tasks
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Workflow Runs</CardTitle>
            <CardDescription>Latest workflow executions</CardDescription>
          </CardHeader>
          <CardContent>
            {runs?.slice(0, 5).map((run) => (
              <div key={run.id} className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{run.workflow.name}</p>
                  <p className="text-sm text-muted-foreground">{run.status}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
