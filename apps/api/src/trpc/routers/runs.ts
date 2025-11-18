import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const runsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          workflowId: z.string().optional(),
          status: z
            .enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'])
            .optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.workflowRun.findMany({
        where: {
          organizationId: ctx.organizationId,
          ...(input?.workflowId && { workflowId: input.workflowId }),
          ...(input?.status && { status: input.status }),
        },
        include: {
          workflow: true,
          agentInstances: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input?.limit || 50,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const run = await ctx.prisma.workflowRun.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          workflow: true,
          agentInstances: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!run) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow run not found' });
      }

      return run;
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const run = await ctx.prisma.workflowRun.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      });

      if (!run) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow run not found' });
      }

      if (run.status === 'COMPLETED' || run.status === 'FAILED' || run.status === 'CANCELLED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot cancel completed run' });
      }

      return ctx.prisma.workflowRun.update({
        where: { id: input.id },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
        },
      });
    }),

  retry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const run = await ctx.prisma.workflowRun.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          workflow: true,
        },
      });

      if (!run) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow run not found' });
      }

      if (run.status !== 'FAILED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only retry failed runs' });
      }

      // Create new run based on failed run
      return ctx.prisma.workflowRun.create({
        data: {
          workflowId: run.workflowId,
          organizationId: ctx.organizationId!,
          status: 'PENDING',
        },
      });
    }),
});
