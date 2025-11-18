import { describe, it, expect } from 'vitest';
import {
  OrganizationSchema,
  CreateOrganizationSchema,
  UserSchema,
  CreateUserSchema,
  ProjectSchema,
  CreateProjectSchema,
  TaskSchema,
  CreateTaskSchema,
} from '../index';

describe('Schema Validation', () => {
  describe('Organization', () => {
    it('should validate a valid organization', () => {
      const org = {
        id: 'org_123',
        name: 'Test Corp',
        slug: 'test-corp',
        plan: 'PRO' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = OrganizationSchema.safeParse(org);
      expect(result.success).toBe(true);
    });

    it('should validate create organization input', () => {
      const input = {
        name: 'New Corp',
        slug: 'new-corp',
        plan: 'FREE' as const,
      };

      const result = CreateOrganizationSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plan).toBe('FREE');
      }
    });

    it('should reject invalid slug format', () => {
      const input = {
        name: 'New Corp',
        slug: 'Invalid Slug!',
        plan: 'FREE' as const,
      };

      const result = CreateOrganizationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('User', () => {
    it('should validate a valid user', () => {
      const user = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        organizationId: 'org_123',
        role: 'MEMBER' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it('should validate create user with default role', () => {
      const input = {
        email: 'new@example.com',
        organizationId: 'org_123',
      };

      const result = CreateUserSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('MEMBER');
      }
    });

    it('should reject invalid email', () => {
      const input = {
        email: 'invalid-email',
        organizationId: 'org_123',
      };

      const result = CreateUserSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('Project', () => {
    it('should validate a valid project', () => {
      const project = {
        id: 'proj_123',
        name: 'Test Project',
        description: 'A test project',
        organizationId: 'org_123',
        status: 'ACTIVE' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = ProjectSchema.safeParse(project);
      expect(result.success).toBe(true);
    });

    it('should validate create project with default status', () => {
      const input = {
        name: 'New Project',
        organizationId: 'org_123',
      };

      const result = CreateProjectSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('PLANNING');
      }
    });

    it('should reject empty project name', () => {
      const input = {
        name: '',
        organizationId: 'org_123',
      };

      const result = CreateProjectSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('Task', () => {
    it('should validate a valid task', () => {
      const task = {
        id: 'task_123',
        title: 'Test Task',
        description: 'A test task',
        projectId: 'proj_123',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = TaskSchema.safeParse(task);
      expect(result.success).toBe(true);
    });

    it('should validate create task with defaults', () => {
      const input = {
        title: 'New Task',
        projectId: 'proj_123',
      };

      const result = CreateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('TODO');
        expect(result.data.priority).toBe('MEDIUM');
      }
    });

    it('should reject empty task title', () => {
      const input = {
        title: '',
        projectId: 'proj_123',
      };

      const result = CreateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
