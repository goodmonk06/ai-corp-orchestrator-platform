import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { workflowQueue } from '../../lib/queue';

const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  agentProfileId: z.string().optional(),
  action: z.enum(['LLM_CALL', 'TOOL_CALL', 'HUMAN_REVIEW', 'CONDITIONAL', 'PARALLEL']),
  config: z.record(z.any()),
  nextStepId: z.string().optional(),
  onError: z.enum(['STOP', 'CONTINUE', 'RETRY']).default('STOP'),
});

export const workflowsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.workflow.findMany({
        where: {
          organizationId: ctx.organizationId,
          ...(input?.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
          _count: {
            select: {
              runs: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.prisma.workflow.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          runs: {
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      return workflow;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        steps: z.array(WorkflowStepSchema),
        trigger: z.enum(['MANUAL', 'SCHEDULED', 'EVENT']).default('MANUAL'),
        schedule: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workflow.create({
        data: {
          ...input,
          organizationId: ctx.organizationId!,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        steps: z.array(WorkflowStepSchema).optional(),
        isActive: z.boolean().optional(),
        trigger: z.enum(['MANUAL', 'SCHEDULED', 'EVENT']).optional(),
        schedule: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.workflow.update({
        where: {
          id,
          organizationId: ctx.organizationId,
        },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workflow.delete({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      });
    }),

  execute: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        initialContext: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workflow exists and belongs to organization
      const workflow = await ctx.prisma.workflow.findFirst({
        where: {
          id: input.workflowId,
          organizationId: ctx.organizationId,
        },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      if (!workflow.isActive) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Workflow is not active' });
      }

      // Create workflow run
      const run = await ctx.prisma.workflowRun.create({
        data: {
          workflowId: input.workflowId,
          organizationId: ctx.organizationId!,
          status: 'PENDING',
        },
      });

      // Queue workflow execution
      await workflowQueue.add('execute-workflow', {
        runId: run.id,
        workflowId: input.workflowId,
        organizationId: ctx.organizationId,
        initialContext: input.initialContext,
      });

      return run;
    }),
});
