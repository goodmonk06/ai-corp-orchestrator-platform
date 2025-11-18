import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'MEMBER', 'VIEWER']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  organizationId: z.string(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  organizationId: z.string(),
  role: UserRoleSchema.default('MEMBER'),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
