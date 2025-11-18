#!/usr/bin/env node

import { Command } from 'commander';
import { organizationCommands } from './commands/organizations';
import { projectCommands } from './commands/projects';
import { taskCommands } from './commands/tasks';
import { workflowCommands } from './commands/workflows';
import { agentCommands } from './commands/agents';
import { notificationCommands } from './commands/notifications';

const program = new Command();

program
  .name('ai-corp')
  .description('CLI tool for AI Corporation Orchestrator Platform')
  .version('1.0.0');

// Register command modules
organizationCommands(program);
projectCommands(program);
taskCommands(program);
workflowCommands(program);
agentCommands(program);
notificationCommands(program);

// Parse arguments
program.parse(process.argv);
