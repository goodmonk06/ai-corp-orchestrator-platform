import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const organizationsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.prisma.organization.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              users: true,
              projects: true,
              agentProfiles: true,
              workflows: true,
            },
          },
        },
      });

      if (!org) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
      }

      return org;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).default('FREE'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.organization.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.organization.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.organization.delete({
        where: { id: input.id },
      });
    }),
});
