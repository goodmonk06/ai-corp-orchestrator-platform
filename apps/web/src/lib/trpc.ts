import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../api/src/trpc/routers';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
      headers() {
        // In production, get these from auth context
        return {
          'x-organization-id': process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '',
          'x-user-id': process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '',
        };
      },
    }),
  ],
});
