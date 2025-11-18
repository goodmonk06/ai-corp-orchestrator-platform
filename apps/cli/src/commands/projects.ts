import { Command } from 'commander';
import { prisma } from '../lib/db';
import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';

export function projectCommands(program: Command) {
  const projects = program
    .command('projects')
    .alias('p')
    .description('Manage projects');

  // List projects
  projects
    .command('list')
    .alias('ls')
    .description('List all projects')
    .option('-o, --org <orgId>', 'Filter by organization ID')
    .option('-s, --status <status>', 'Filter by status')
    .action(async (options) => {
      const spinner = ora('Fetching projects...').start();

      try {
        const where: any = {};
        if (options.org) {
          where.organizationId = options.org;
        }
        if (options.status) {
          where.status = options.status;
        }

        const projectsList = await prisma.project.findMany({
          where,
          include: {
            owner: true,
            _count: {
              select: { tasks: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        spinner.stop();

        if (projectsList.length === 0) {
          console.log(chalk.yellow('No projects found.'));
          return;
        }

        const data = [
          ['ID', 'Name', 'Status', 'Owner', 'Tasks', 'Created'],
          ...projectsList.map((p) => [
            p.id.substring(0, 8) + '...',
            p.name,
            p.status,
            p.owner?.name || p.owner?.email || 'N/A',
            p._count.tasks.toString(),
            new Date(p.createdAt).toLocaleDateString(),
          ]),
        ];

        console.log(table(data));
        console.log(chalk.green(`\nTotal: ${projectsList.length} projects`));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching projects:'), error.message);
        process.exit(1);
      }
    });

  // Get project by ID
  projects
    .command('get <id>')
    .description('Get project details by ID')
    .action(async (id) => {
      const spinner = ora('Fetching project...').start();

      try {
        const project = await prisma.project.findUnique({
          where: { id },
          include: {
            owner: true,
            organization: true,
            tasks: {
              include: {
                assignee: true,
              },
            },
          },
        });

        spinner.stop();

        if (!project) {
          console.log(chalk.red(`Project with ID ${id} not found.`));
          process.exit(1);
        }

        console.log(chalk.bold('\nProject Details:'));
        console.log(chalk.cyan('ID:'), project.id);
        console.log(chalk.cyan('Name:'), project.name);
        console.log(chalk.cyan('Description:'), project.description || 'N/A');
        console.log(chalk.cyan('Status:'), project.status);
        console.log(chalk.cyan('Organization:'), project.organization.name);
        console.log(chalk.cyan('Owner:'), project.owner?.name || project.owner?.email || 'N/A');
        console.log(chalk.cyan('Created:'), new Date(project.createdAt).toLocaleString());
        console.log(chalk.cyan('Updated:'), new Date(project.updatedAt).toLocaleString());

        if (project.tasks.length > 0) {
          console.log(chalk.bold('\nTasks:'));
          const taskData = [
            ['Title', 'Status', 'Priority', 'Assignee'],
            ...project.tasks.map((t) => [
              t.title,
              t.status,
              t.priority,
              t.assignee?.name || t.assignee?.email || 'Unassigned',
            ]),
          ];
          console.log(table(taskData));
        } else {
          console.log(chalk.yellow('\nNo tasks in this project.'));
        }
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching project:'), error.message);
        process.exit(1);
      }
    });

  // Create project
  projects
    .command('create')
    .description('Create a new project')
    .requiredOption('-n, --name <name>', 'Project name')
    .requiredOption('-o, --org <orgId>', 'Organization ID')
    .option('-d, --description <description>', 'Project description')
    .option('-s, --status <status>', 'Project status', 'PLANNING')
    .option('--owner <ownerId>', 'Owner user ID')
    .action(async (options) => {
      const spinner = ora('Creating project...').start();

      try {
        const project = await prisma.project.create({
          data: {
            name: options.name,
            description: options.description,
            status: options.status,
            organizationId: options.org,
            ownerId: options.owner,
          },
        });

        spinner.stop();
        console.log(chalk.green('✓ Project created successfully!'));
        console.log(chalk.cyan('ID:'), project.id);
        console.log(chalk.cyan('Name:'), project.name);
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error creating project:'), error.message);
        process.exit(1);
      }
    });

  // Update project
  projects
    .command('update <id>')
    .description('Update a project')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <description>', 'Project description')
    .option('-s, --status <status>', 'Project status')
    .option('--owner <ownerId>', 'Owner user ID')
    .action(async (id, options) => {
      const spinner = ora('Updating project...').start();

      try {
        const data: any = {};
        if (options.name) data.name = options.name;
        if (options.description !== undefined) data.description = options.description;
        if (options.status) data.status = options.status;
        if (options.owner !== undefined) data.ownerId = options.owner;

        const project = await prisma.project.update({
          where: { id },
          data,
        });

        spinner.stop();
        console.log(chalk.green('✓ Project updated successfully!'));
        console.log(chalk.cyan('ID:'), project.id);
        console.log(chalk.cyan('Name:'), project.name);
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error updating project:'), error.message);
        process.exit(1);
      }
    });

  // Delete project
  projects
    .command('delete <id>')
    .description('Delete a project')
    .option('-f, --force', 'Skip confirmation')
    .action(async (id, options) => {
      if (!options.force) {
        console.log(chalk.yellow('Warning: This will permanently delete the project and all its tasks.'));
        console.log(chalk.yellow('Use --force to skip this confirmation.'));
        process.exit(0);
      }

      const spinner = ora('Deleting project...').start();

      try {
        await prisma.project.delete({
          where: { id },
        });

        spinner.stop();
        console.log(chalk.green('✓ Project deleted successfully!'));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error deleting project:'), error.message);
        process.exit(1);
      }
    });
}
