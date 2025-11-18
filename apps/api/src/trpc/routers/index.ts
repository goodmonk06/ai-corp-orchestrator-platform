import { router } from '../trpc';
import { organizationsRouter } from './organizations';
import { usersRouter } from './users';
import { projectsRouter } from './projects';
import { tasksRouter } from './tasks';
import { agentsRouter } from './agents';
import { workflowsRouter } from './workflows';
import { runsRouter } from './runs';
import { notificationsRouter } from './notifications';
import { metricsRouter } from './metrics';

export const appRouter = router({
  organizations: organizationsRouter,
  users: usersRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  agents: agentsRouter,
  workflows: workflowsRouter,
  runs: runsRouter,
  notifications: notificationsRouter,
  metrics: metricsRouter,
});

export type AppRouter = typeof appRouter;
