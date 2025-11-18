import { z } from 'zod';

// Project Template
export const ProjectTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  organizationId: z.string().optional(),
  defaultTasks: z.array(z.any()),
  metadata: z.record(z.any()).optional(),
  estimatedDays: z.number().optional(),
  isPublic: z.boolean(),
  usageCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectTemplate = z.infer<typeof ProjectTemplateSchema>;

export const CreateProjectTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  organizationId: z.string().optional(),
  defaultTasks: z.array(z.any()),
  metadata: z.record(z.any()).optional(),
  estimatedDays: z.number().positive().optional(),
  isPublic: z.boolean().default(false),
});

export type CreateProjectTemplate = z.infer<typeof CreateProjectTemplateSchema>;

// Workflow Template
export const WorkflowTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  organizationId: z.string().optional(),
  steps: z.array(z.any()),
  variables: z.record(z.any()).optional(),
  documentation: z.string().optional(),
  isPublic: z.boolean(),
  usageCount: z.number(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;

export const CreateWorkflowTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  organizationId: z.string().optional(),
  steps: z.array(z.any()),
  variables: z.record(z.any()).optional(),
  documentation: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type CreateWorkflowTemplate = z.infer<typeof CreateWorkflowTemplateSchema>;
