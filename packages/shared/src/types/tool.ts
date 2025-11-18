import { z } from 'zod';

export const ToolDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  organizationId: z.string().optional(),
  inputSchema: z.record(z.any()),
  outputSchema: z.record(z.any()).optional(),
  endpoint: z.string().optional(),
  isBuiltin: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
