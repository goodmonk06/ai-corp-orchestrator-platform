import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { Context } from './context';
import { createLogger } from '@ai-corp/shared';

const logger = createLogger('trpc');

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const router = t.router;

// Logging middleware
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  logger.info({
    path,
    type,
    duration,
    status: result.ok ? 'success' : 'error',
  }, 'tRPC request');

  return result;
});

export const publicProcedure = t.procedure.use(loggingMiddleware);

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please provide valid credentials.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

// Middleware to check if organization context exists
const hasOrg = t.middleware(({ ctx, next }) => {
  if (!ctx.organizationId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Organization context required. Please provide x-organization-id header.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      organizationId: ctx.organizationId,
    },
  });
});

export const protectedProcedure = t.procedure.use(loggingMiddleware).use(isAuthed).use(hasOrg);
