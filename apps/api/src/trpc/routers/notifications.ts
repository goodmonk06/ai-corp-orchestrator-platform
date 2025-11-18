import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const notificationsRouter = router({
  // List notifications for the current user
  list: protectedProcedure
    .input(
      z
        .object({
          read: z.boolean().optional(), // Filter by read status
          type: z
            .enum([
              'TASK_ASSIGNED',
              'TASK_COMPLETED',
              'TASK_DUE_SOON',
              'WORKFLOW_COMPLETED',
              'WORKFLOW_FAILED',
              'PROJECT_UPDATED',
              'MENTION',
              'SYSTEM',
            ])
            .optional(),
          priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.notification.findMany({
        where: {
          userId: ctx.userId,
          organizationId: ctx.organizationId,
          ...(input?.read !== undefined && { read: input.read }),
          ...(input?.type && { type: input.type }),
          ...(input?.priority && { priority: input.priority }),
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: input?.limit || 50,
      });
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.notification.count({
      where: {
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        read: false,
      },
    });
  }),

  // Get notification by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
          organizationId: ctx.organizationId,
        },
      });

      if (!notification) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Notification not found' });
      }

      return notification;
    }),

  // Create notification (typically used by system)
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum([
          'TASK_ASSIGNED',
          'TASK_COMPLETED',
          'TASK_DUE_SOON',
          'WORKFLOW_COMPLETED',
          'WORKFLOW_FAILED',
          'PROJECT_UPDATED',
          'MENTION',
          'SYSTEM',
        ]),
        title: z.string().min(1),
        message: z.string().min(1),
        actionUrl: z.string().optional(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.notification.create({
        data: {
          ...input,
          organizationId: ctx.organizationId,
        },
      });
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.notification.update({
        where: {
          id: input.id,
          userId: ctx.userId,
          organizationId: ctx.organizationId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.notification.updateMany({
      where: {
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.notification.delete({
        where: {
          id: input.id,
          userId: ctx.userId,
          organizationId: ctx.organizationId,
        },
      });
    }),

  // Delete all read notifications
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.notification.deleteMany({
      where: {
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        read: true,
      },
    });
  }),
});
