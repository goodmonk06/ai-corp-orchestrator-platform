import { Command } from 'commander';
import { prisma } from '../lib/db';
import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';

export function notificationCommands(program: Command) {
  const notifications = program
    .command('notifications')
    .alias('n')
    .description('Manage notifications');

  // List notifications
  notifications
    .command('list')
    .alias('ls')
    .description('List notifications')
    .option('-u, --user <userId>', 'Filter by user ID')
    .option('-r, --read <boolean>', 'Filter by read status (true/false)')
    .option('-t, --type <type>', 'Filter by notification type')
    .option('-l, --limit <limit>', 'Limit results', '20')
    .action(async (options) => {
      const spinner = ora('Fetching notifications...').start();

      try {
        const where: any = {};
        if (options.user) where.userId = options.user;
        if (options.read !== undefined) where.read = options.read === 'true';
        if (options.type) where.type = options.type;

        const notificationsList = await prisma.notification.findMany({
          where,
          include: {
            user: true,
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
          take: parseInt(options.limit),
        });

        spinner.stop();

        if (notificationsList.length === 0) {
          console.log(chalk.yellow('No notifications found.'));
          return;
        }

        const data = [
          ['ID', 'User', 'Type', 'Title', 'Priority', 'Read', 'Created'],
          ...notificationsList.map((n) => [
            n.id.substring(0, 8) + '...',
            n.user.name || n.user.email,
            n.type,
            n.title.substring(0, 30),
            n.priority,
            n.read ? '✓' : '✗',
            new Date(n.createdAt).toLocaleDateString(),
          ]),
        ];

        console.log(table(data));
        console.log(chalk.green(`\nShowing ${notificationsList.length} notifications`));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error fetching notifications:'), error.message);
        process.exit(1);
      }
    });

  // Create notification
  notifications
    .command('create')
    .description('Create a notification')
    .requiredOption('-u, --user <userId>', 'User ID')
    .requiredOption('-o, --org <orgId>', 'Organization ID')
    .requiredOption('-t, --title <title>', 'Notification title')
    .requiredOption('-m, --message <message>', 'Notification message')
    .requiredOption('--type <type>', 'Notification type')
    .option('-p, --priority <priority>', 'Priority (LOW, NORMAL, HIGH, URGENT)', 'NORMAL')
    .option('-a, --action <url>', 'Action URL')
    .action(async (options) => {
      const spinner = ora('Creating notification...').start();

      try {
        const notification = await prisma.notification.create({
          data: {
            userId: options.user,
            organizationId: options.org,
            type: options.type,
            title: options.title,
            message: options.message,
            priority: options.priority,
            actionUrl: options.action,
          },
        });

        spinner.stop();
        console.log(chalk.green('✓ Notification created successfully!'));
        console.log(chalk.cyan('ID:'), notification.id);
        console.log(chalk.cyan('Title:'), notification.title);
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error creating notification:'), error.message);
        process.exit(1);
      }
    });

  // Mark as read
  notifications
    .command('mark-read <id>')
    .description('Mark notification as read')
    .action(async (id) => {
      const spinner = ora('Marking notification as read...').start();

      try {
        await prisma.notification.update({
          where: { id },
          data: {
            read: true,
            readAt: new Date(),
          },
        });

        spinner.stop();
        console.log(chalk.green('✓ Notification marked as read!'));
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error marking notification:'), error.message);
        process.exit(1);
      }
    });
}
