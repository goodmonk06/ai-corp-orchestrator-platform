import { inferAsyncReturnType } from '@trpc/server';
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export const createContext = async ({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}) => {
  // TODO: Add authentication and extract user/org from JWT token
  // For now, we'll use headers for demo purposes
  const organizationId = req.headers['x-organization-id'] as string | undefined;
  const userId = req.headers['x-user-id'] as string | undefined;

  return {
    prisma,
    organizationId,
    userId,
    req,
    res,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
