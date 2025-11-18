import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  organizationId: z.string(),
  status: ProjectStatusSchema,
  ownerId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string(),
  status: ProjectStatusSchema.default('PLANNING'),
  ownerId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;
