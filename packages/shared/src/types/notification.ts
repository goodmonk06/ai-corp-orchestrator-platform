import { z } from 'zod';

export const NotificationTypeSchema = z.enum([
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'TASK_DUE_SOON',
  'WORKFLOW_COMPLETED',
  'WORKFLOW_FAILED',
  'PROJECT_UPDATED',
  'MENTION',
  'SYSTEM',
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  actionUrl: z.string().optional(),
  read: z.boolean(),
  readAt: z.date().optional(),
  priority: NotificationPrioritySchema,
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  type: NotificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  actionUrl: z.string().url().optional(),
  priority: NotificationPrioritySchema.default('NORMAL'),
  metadata: z.record(z.any()).optional(),
});

export type CreateNotification = z.infer<typeof CreateNotificationSchema>;
