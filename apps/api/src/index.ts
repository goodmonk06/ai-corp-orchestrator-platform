import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from './trpc/context';
import { appRouter } from './trpc/routers';
import { createLogger } from '@ai-corp/shared';

const logger = createLogger('api-server');

const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const server = Fastify({
    logger: false, // Use our custom logger
    maxParamLength: 5000,
  });

  // Register CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Register tRPC
  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        logger.error({ path, error: error.message }, 'tRPC error');
      },
    },
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Start server
  try {
    await server.listen({ port: PORT, host: HOST });
    logger.info(`🚀 API Server running at http://${HOST}:${PORT}`);
    logger.info(`📡 tRPC endpoint: http://${HOST}:${PORT}/trpc`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

main();
