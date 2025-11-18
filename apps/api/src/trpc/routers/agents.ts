import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const agentsRouter = router({
  listProfiles: protectedProcedure
    .input(
      z
        .object({
          role: z
            .enum([
              'CEO',
              'CFO',
              'CTO',
              'CMO',
              'HR',
              'PM',
              'DEVELOPER',
              'DESIGNER',
              'ANALYST',
              'CUSTOM',
            ])
            .optional(),
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.agentProfile.findMany({
        where: {
          organizationId: ctx.organizationId,
          ...(input?.role && { role: input.role }),
          ...(input?.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
          _count: {
            select: {
              agentInstances: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  getProfileById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.agentProfile.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          agentInstances: {
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent profile not found' });
      }

      return profile;
    }),

  createProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        role: z.enum([
          'CEO',
          'CFO',
          'CTO',
          'CMO',
          'HR',
          'PM',
          'DEVELOPER',
          'DESIGNER',
          'ANALYST',
          'CUSTOM',
        ]),
        personality: z.string().optional(),
        systemPrompt: z.string(),
        allowedTools: z.array(z.string()).optional(),
        model: z.string().default('gpt-4-turbo-preview'),
        temperature: z.number().min(0).max(2).default(0.7),
        maxTokens: z.number().default(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.agentProfile.create({
        data: {
          ...input,
          organizationId: ctx.organizationId!,
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        personality: z.string().optional(),
        systemPrompt: z.string().optional(),
        allowedTools: z.array(z.string()).optional(),
        model: z.string().optional(),
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.agentProfile.update({
        where: {
          id,
          organizationId: ctx.organizationId,
        },
        data,
      });
    }),

  deleteProfile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.agentProfile.delete({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      });
    }),

  listInstances: protectedProcedure
    .input(
      z
        .object({
          profileId: z.string().optional(),
          workflowRunId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.agentInstance.findMany({
        where: {
          profile: {
            organizationId: ctx.organizationId,
          },
          ...(input?.profileId && { profileId: input.profileId }),
          ...(input?.workflowRunId && { workflowRunId: input.workflowRunId }),
        },
        include: {
          profile: true,
          workflowRun: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),
});
