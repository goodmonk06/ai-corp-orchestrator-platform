import { Command } from 'commander';
import { prisma } from '../lib/db';
import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';

export function agentCommands(program: Command) {
  const agents = program
    .command('agents')
    .alias('a')
    .description('Manage AI agents');

  // List agent profiles
  agents
    .command('list')
    .alias('ls')
    .description('List all agent profiles')
    .option('-o, --org <orgId>', 'Filter by organization ID')
    .option('-r, --role <role>', 'Filter by role')
    .action(async (options) => {
      const spinner = ora('Fetching agent profiles...').start();

      try {
        const where: any = {};
        if (options.org) where.organizationId = options.org;
        if (options.role) where.role = options.role;

        const agentsList = await prisma.agentProfile.findMany({
          where,
          include: {
            _count: {
              select: { agentInstances: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        spinner.stop();

        if (agentsList.length === 0) {
          console.log(chalk.yellow('No agent profiles found.'));
          return;
        }

        const data = [
          ['ID', 'Name', 'Role', 'Model', 'Active', 'Instances', 'Created'],
          ...agentsList.map((a) => [
            a.id.substring(0, 8) + '...',
            a.name,
            a.role,
            a.model,
            a.isActive ? '✓' : '✗',
            a._count.agentInstances.toString(),
            new Date(a.createdAt).toLocaleDateString(),
          ]),
        ];

        console.log(table(data));
        console.log(chalk.green(`\nTotal: ${agentsList.length} agent profiles`));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching agents:'), error.message);
        process.exit(1);
      }
    });

  // Get agent details
  agents
    .command('get <id>')
    .description('Get agent profile details')
    .action(async (id) => {
      const spinner = ora('Fetching agent profile...').start();

      try {
        const agent = await prisma.agentProfile.findUnique({
          where: { id },
          include: {
            organization: true,
            _count: {
              select: { agentInstances: true },
            },
          },
        });

        spinner.stop();

        if (!agent) {
          console.log(chalk.red(`Agent profile with ID ${id} not found.`));
          process.exit(1);
        }

        console.log(chalk.bold('\nAgent Profile Details:'));
        console.log(chalk.cyan('ID:'), agent.id);
        console.log(chalk.cyan('Name:'), agent.name);
        console.log(chalk.cyan('Role:'), agent.role);
        console.log(chalk.cyan('Organization:'), agent.organization.name);
        console.log(chalk.cyan('Model:'), agent.model);
        console.log(chalk.cyan('Temperature:'), agent.temperature);
        console.log(chalk.cyan('Max Tokens:'), agent.maxTokens);
        console.log(chalk.cyan('Active:'), agent.isActive ? 'Yes' : 'No');
        console.log(chalk.cyan('Instances:'), agent._count.agentInstances);
        console.log(chalk.cyan('Allowed Tools:'), agent.allowedTools.join(', ') || 'None');
        console.log(chalk.cyan('\nSystem Prompt:'));
        console.log(agent.systemPrompt);
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching agent:'), error.message);
        process.exit(1);
      }
    });
}
