import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
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
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Organization ID required' });
  }
  return next({
    ctx: {
      ...ctx,
      organizationId: ctx.organizationId,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed).use(hasOrg);
