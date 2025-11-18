import { Command } from 'commander';
import { prisma } from '../lib/db';
import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';

export function taskCommands(program: Command) {
  const tasks = program
    .command('tasks')
    .alias('t')
    .description('Manage tasks');

  // List tasks
  tasks
    .command('list')
    .alias('ls')
    .description('List all tasks')
    .option('-p, --project <projectId>', 'Filter by project ID')
    .option('-s, --status <status>', 'Filter by status')
    .option('-a, --assignee <userId>', 'Filter by assignee')
    .action(async (options) => {
      const spinner = ora('Fetching tasks...').start();

      try {
        const where: any = {};
        if (options.project) where.projectId = options.project;
        if (options.status) where.status = options.status;
        if (options.assignee) where.assigneeId = options.assignee;

        const tasksList = await prisma.task.findMany({
          where,
          include: {
            project: true,
            assignee: true,
          },
          orderBy: [
            { priority: 'desc' },
            { dueDate: 'asc' },
          ],
        });

        spinner.stop();

        if (tasksList.length === 0) {
          console.log(chalk.yellow('No tasks found.'));
          return;
        }

        const data = [
          ['ID', 'Title', 'Project', 'Status', 'Priority', 'Assignee', 'Due Date'],
          ...tasksList.map((t) => [
            t.id.substring(0, 8) + '...',
            t.title.substring(0, 30),
            t.project.name.substring(0, 20),
            t.status,
            t.priority,
            t.assignee?.name || t.assignee?.email || 'Unassigned',
            t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A',
          ]),
        ];

        console.log(table(data));
        console.log(chalk.green(`\nTotal: ${tasksList.length} tasks`));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching tasks:'), error.message);
        process.exit(1);
      }
    });

  // Create task
  tasks
    .command('create')
    .description('Create a new task')
    .requiredOption('-t, --title <title>', 'Task title')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-d, --description <description>', 'Task description')
    .option('-s, --status <status>', 'Task status', 'TODO')
    .option('--priority <priority>', 'Task priority', 'MEDIUM')
    .option('-a, --assignee <userId>', 'Assignee user ID')
    .option('--due <date>', 'Due date (YYYY-MM-DD)')
    .action(async (options) => {
      const spinner = ora('Creating task...').start();

      try {
        const task = await prisma.task.create({
          data: {
            title: options.title,
            description: options.description,
            projectId: options.project,
            status: options.status,
            priority: options.priority,
            assigneeId: options.assignee,
            dueDate: options.due ? new Date(options.due) : undefined,
          },
        });

        spinner.stop();
        console.log(chalk.green('✓ Task created successfully!'));
        console.log(chalk.cyan('ID:'), task.id);
        console.log(chalk.cyan('Title:'), task.title);
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error creating task:'), error.message);
        process.exit(1);
      }
    });

  // Update task status
  tasks
    .command('update <id>')
    .description('Update a task')
    .option('-t, --title <title>', 'Task title')
    .option('-d, --description <description>', 'Task description')
    .option('-s, --status <status>', 'Task status')
    .option('--priority <priority>', 'Task priority')
    .option('-a, --assignee <userId>', 'Assignee user ID')
    .action(async (id, options) => {
      const spinner = ora('Updating task...').start();

      try {
        const data: any = {};
        if (options.title) data.title = options.title;
        if (options.description !== undefined) data.description = options.description;
        if (options.status) data.status = options.status;
        if (options.priority) data.priority = options.priority;
        if (options.assignee !== undefined) data.assigneeId = options.assignee;

        const task = await prisma.task.update({
          where: { id },
          data,
        });

        spinner.stop();
        console.log(chalk.green('✓ Task updated successfully!'));
        console.log(chalk.cyan('ID:'), task.id);
        console.log(chalk.cyan('Title:'), task.title);
        console.log(chalk.cyan('Status:'), task.status);
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error updating task:'), error.message);
        process.exit(1);
      }
    });

  // Delete task
  tasks
    .command('delete <id>')
    .description('Delete a task')
    .option('-f, --force', 'Skip confirmation')
    .action(async (id, options) => {
      if (!options.force) {
        console.log(chalk.yellow('Warning: This will permanently delete the task.'));
        console.log(chalk.yellow('Use --force to skip this confirmation.'));
        process.exit(0);
      }

      const spinner = ora('Deleting task...').start();

      try {
        await prisma.task.delete({
          where: { id },
        });

        spinner.stop();
        console.log(chalk.green('✓ Task deleted successfully!'));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error deleting task:'), error.message);
        process.exit(1);
      }
    });
}
