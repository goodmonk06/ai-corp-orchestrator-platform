import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const tasksRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          projectId: z.string().optional(),
          status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).optional(),
          assigneeId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findMany({
        where: {
          project: {
            organizationId: ctx.organizationId,
          },
          ...(input?.projectId && { projectId: input.projectId }),
          ...(input?.status && { status: input.status }),
          ...(input?.assigneeId && { assigneeId: input.assigneeId }),
        },
        include: {
          project: true,
          assignee: true,
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.id,
          project: {
            organizationId: ctx.organizationId,
          },
        },
        include: {
          project: true,
          assignee: true,
        },
      });

      if (!task) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }

      return task;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        projectId: z.string(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).default('TODO'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
        assigneeId: z.string().optional(),
        dueDate: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dueDate, ...rest } = input;
      return ctx.prisma.task.create({
        data: {
          ...rest,
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        assigneeId: z.string().optional(),
        dueDate: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, dueDate, ...data } = input;
      return ctx.prisma.task.update({
        where: { id },
        data: {
          ...data,
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.delete({
        where: { id: input.id },
      });
    }),
});
