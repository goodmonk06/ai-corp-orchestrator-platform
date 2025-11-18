import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const metricsRouter = router({
  // Record a metric
  record: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        value: z.number(),
        labels: z.record(z.string()).optional(),
        timestamp: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.metric.create({
        data: {
          organizationId: ctx.organizationId,
          name: input.name,
          value: input.value,
          labels: input.labels,
          timestamp: input.timestamp || new Date(),
        },
      });
    }),

  // Record multiple metrics in batch
  recordBatch: protectedProcedure
    .input(
      z.object({
        metrics: z.array(
          z.object({
            name: z.string().min(1),
            value: z.number(),
            labels: z.record(z.string()).optional(),
            timestamp: z.date().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.metric.createMany({
        data: input.metrics.map((m) => ({
          organizationId: ctx.organizationId,
          name: m.name,
          value: m.value,
          labels: m.labels,
          timestamp: m.timestamp || new Date(),
        })),
      });
    }),

  // Query metrics
  query: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        labels: z.record(z.string()).optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        limit: z.number().min(1).max(10000).default(1000),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.organizationId,
      };

      if (input.name) {
        where.name = input.name;
      }

      if (input.startTime || input.endTime) {
        where.timestamp = {};
        if (input.startTime) {
          where.timestamp.gte = input.startTime;
        }
        if (input.endTime) {
          where.timestamp.lte = input.endTime;
        }
      }

      // Note: Labels are JSON, so exact matching is complex
      // This is a simplified version
      const metrics = await ctx.prisma.metric.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: input.limit,
      });

      // Filter by labels in application code if provided
      if (input.labels && Object.keys(input.labels).length > 0) {
        return metrics.filter((metric) => {
          if (!metric.labels || typeof metric.labels !== 'object') return false;
          return Object.entries(input.labels!).every(
            ([key, value]) => (metric.labels as any)[key] === value
          );
        });
      }

      return metrics;
    }),

  // Get metric names for the organization
  getMetricNames: protectedProcedure.query(async ({ ctx }) => {
    const metrics = await ctx.prisma.metric.findMany({
      where: { organizationId: ctx.organizationId },
      select: { name: true },
      distinct: ['name'],
    });

    return metrics.map((m) => m.name);
  }),

  // Get aggregated metrics
  aggregate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        aggregation: z.enum(['sum', 'avg', 'min', 'max', 'count']),
        labels: z.record(z.string()).optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.organizationId,
        name: input.name,
      };

      if (input.startTime || input.endTime) {
        where.timestamp = {};
        if (input.startTime) {
          where.timestamp.gte = input.startTime;
        }
        if (input.endTime) {
          where.timestamp.lte = input.endTime;
        }
      }

      const metrics = await ctx.prisma.metric.findMany({
        where,
        orderBy: { timestamp: 'asc' },
      });

      // Filter by labels if provided
      let filteredMetrics = metrics;
      if (input.labels && Object.keys(input.labels).length > 0) {
        filteredMetrics = metrics.filter((metric) => {
          if (!metric.labels || typeof metric.labels !== 'object') return false;
          return Object.entries(input.labels!).every(
            ([key, value]) => (metric.labels as any)[key] === value
          );
        });
      }

      // Calculate aggregation
      let result: number;
      switch (input.aggregation) {
        case 'sum':
          result = filteredMetrics.reduce((sum, m) => sum + m.value, 0);
          break;
        case 'avg':
          result = filteredMetrics.length > 0
            ? filteredMetrics.reduce((sum, m) => sum + m.value, 0) / filteredMetrics.length
            : 0;
          break;
        case 'min':
          result = filteredMetrics.length > 0
            ? Math.min(...filteredMetrics.map((m) => m.value))
            : 0;
          break;
        case 'max':
          result = filteredMetrics.length > 0
            ? Math.max(...filteredMetrics.map((m) => m.value))
            : 0;
          break;
        case 'count':
          result = filteredMetrics.length;
          break;
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Unknown aggregation: ${input.aggregation}`,
          });
      }

      return {
        name: input.name,
        aggregation: input.aggregation,
        value: result,
        count: filteredMetrics.length,
        startTime: input.startTime,
        endTime: input.endTime,
      };
    }),

  // Delete old metrics (for cleanup)
  deleteOld: protectedProcedure
    .input(
      z.object({
        olderThan: z.date(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.organizationId,
        timestamp: {
          lt: input.olderThan,
        },
      };

      if (input.name) {
        where.name = input.name;
      }

      const result = await ctx.prisma.metric.deleteMany({ where });

      return {
        deleted: result.count,
      };
    }),
});
