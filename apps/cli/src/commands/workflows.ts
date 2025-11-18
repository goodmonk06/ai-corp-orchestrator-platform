import { Command } from 'commander';
import { prisma } from '../lib/db';
import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';

export function workflowCommands(program: Command) {
  const workflows = program
    .command('workflows')
    .alias('w')
    .description('Manage workflows');

  // List workflows
  workflows
    .command('list')
    .alias('ls')
    .description('List all workflows')
    .option('-o, --org <orgId>', 'Filter by organization ID')
    .action(async (options) => {
      const spinner = ora('Fetching workflows...').start();

      try {
        const where: any = {};
        if (options.org) where.organizationId = options.org;

        const workflowsList = await prisma.workflow.findMany({
          where,
          include: {
            _count: {
              select: { runs: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        spinner.stop();

        if (workflowsList.length === 0) {
          console.log(chalk.yellow('No workflows found.'));
          return;
        }

        const data = [
          ['ID', 'Name', 'Trigger', 'Active', 'Runs', 'Created'],
          ...workflowsList.map((w) => [
            w.id.substring(0, 8) + '...',
            w.name,
            w.trigger,
            w.isActive ? '✓' : '✗',
            w._count.runs.toString(),
            new Date(w.createdAt).toLocaleDateString(),
          ]),
        ];

        console.log(table(data));
        console.log(chalk.green(`\nTotal: ${workflowsList.length} workflows`));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching workflows:'), error.message);
        process.exit(1);
      }
    });

  // Get workflow runs
  workflows
    .command('runs <workflowId>')
    .description('List workflow runs')
    .option('-l, --limit <limit>', 'Limit results', '10')
    .action(async (workflowId, options) => {
      const spinner = ora('Fetching workflow runs...').start();

      try {
        const runs = await prisma.workflowRun.findMany({
          where: { workflowId },
          include: {
            workflow: true,
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(options.limit),
        });

        spinner.stop();

        if (runs.length === 0) {
          console.log(chalk.yellow('No runs found for this workflow.'));
          return;
        }

        const data = [
          ['ID', 'Status', 'Started', 'Completed', 'Duration'],
          ...runs.map((r) => [
            r.id.substring(0, 8) + '...',
            r.status,
            r.startedAt ? new Date(r.startedAt).toLocaleString() : 'N/A',
            r.completedAt ? new Date(r.completedAt).toLocaleString() : 'N/A',
            r.startedAt && r.completedAt
              ? `${Math.round((new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)}s`
              : 'N/A',
          ]),
        ];

        console.log(table(data));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching runs:'), error.message);
        process.exit(1);
      }
    });
}
