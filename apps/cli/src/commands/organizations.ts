import { Command } from 'commander';
import { prisma } from '../lib/db';
import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';

export function organizationCommands(program: Command) {
  const orgs = program
    .command('organizations')
    .alias('org')
    .description('Manage organizations');

  // List organizations
  orgs
    .command('list')
    .alias('ls')
    .description('List all organizations')
    .action(async () => {
      const spinner = ora('Fetching organizations...').start();

      try {
        const organizations = await prisma.organization.findMany({
          include: {
            _count: {
              select: {
                users: true,
                projects: true,
                workflows: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        spinner.stop();

        if (organizations.length === 0) {
          console.log(chalk.yellow('No organizations found.'));
          return;
        }

        const data = [
          ['ID', 'Name', 'Slug', 'Plan', 'Users', 'Projects', 'Workflows', 'Created'],
          ...organizations.map((o) => [
            o.id.substring(0, 8) + '...',
            o.name,
            o.slug,
            o.plan,
            o._count.users.toString(),
            o._count.projects.toString(),
            o._count.workflows.toString(),
            new Date(o.createdAt).toLocaleDateString(),
          ]),
        ];

        console.log(table(data));
        console.log(chalk.green(`\nTotal: ${organizations.length} organizations`));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching organizations:'), error.message);
        process.exit(1);
      }
    });

  // Get organization by ID
  orgs
    .command('get <id>')
    .description('Get organization details')
    .action(async (id) => {
      const spinner = ora('Fetching organization...').start();

      try {
        const org = await prisma.organization.findUnique({
          where: { id },
          include: {
            users: true,
            _count: {
              select: {
                projects: true,
                workflows: true,
                agentProfiles: true,
              },
            },
          },
        });

        spinner.stop();

        if (!org) {
          console.log(chalk.red(`Organization with ID ${id} not found.`));
          process.exit(1);
        }

        console.log(chalk.bold('\nOrganization Details:'));
        console.log(chalk.cyan('ID:'), org.id);
        console.log(chalk.cyan('Name:'), org.name);
        console.log(chalk.cyan('Slug:'), org.slug);
        console.log(chalk.cyan('Plan:'), org.plan);
        console.log(chalk.cyan('Users:'), org.users.length);
        console.log(chalk.cyan('Projects:'), org._count.projects);
        console.log(chalk.cyan('Workflows:'), org._count.workflows);
        console.log(chalk.cyan('Agent Profiles:'), org._count.agentProfiles);
        console.log(chalk.cyan('Created:'), new Date(org.createdAt).toLocaleString());
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching organization:'), error.message);
        process.exit(1);
      }
    });

  // Create organization
  orgs
    .command('create')
    .description('Create a new organization')
    .requiredOption('-n, --name <name>', 'Organization name')
    .requiredOption('-s, --slug <slug>', 'Organization slug')
    .option('-p, --plan <plan>', 'Plan (FREE, PRO, ENTERPRISE)', 'FREE')
    .action(async (options) => {
      const spinner = ora('Creating organization...').start();

      try {
        const org = await prisma.organization.create({
          data: {
            name: options.name,
            slug: options.slug,
            plan: options.plan,
          },
        });

        spinner.stop();
        console.log(chalk.green('✓ Organization created successfully!'));
        console.log(chalk.cyan('ID:'), org.id);
        console.log(chalk.cyan('Name:'), org.name);
        console.log(chalk.cyan('Slug:'), org.slug);
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error creating organization:'), error.message);
        process.exit(1);
      }
    });
}
