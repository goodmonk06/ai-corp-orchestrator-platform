'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Bot } from 'lucide-react';

const roleColors: Record<string, string> = {
  CEO: 'bg-purple-100 text-purple-800',
  CFO: 'bg-blue-100 text-blue-800',
  CTO: 'bg-green-100 text-green-800',
  CMO: 'bg-orange-100 text-orange-800',
  HR: 'bg-pink-100 text-pink-800',
  PM: 'bg-yellow-100 text-yellow-800',
  DEVELOPER: 'bg-cyan-100 text-cyan-800',
  DESIGNER: 'bg-indigo-100 text-indigo-800',
  ANALYST: 'bg-teal-100 text-teal-800',
  CUSTOM: 'bg-gray-100 text-gray-800',
};

export default function AgentsPage() {
  const { data: agents, isLoading } = trpc.agents.listProfiles.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">Configure your AI agent team</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Agent
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents?.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{agent.name}</CardTitle>
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                      roleColors[agent.role]
                    }`}
                  >
                    {agent.role}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{agent.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instances:</span>
                  <span>{agent._count?.agentInstances || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={agent.isActive ? 'text-green-600' : 'text-gray-400'}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {agent.personality && (
                <p className="mt-4 text-sm text-muted-foreground">{agent.personality}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
