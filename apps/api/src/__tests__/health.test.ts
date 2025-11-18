import { describe, it, expect } from 'vitest';

describe('API Health', () => {
  it('should have valid environment configuration', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should validate database URL format', () => {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test';
    expect(dbUrl).toMatch(/^postgresql:\/\//);
  });

  it('should validate port configuration', () => {
    const port = parseInt(process.env.PORT || '3001');
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThan(65536);
  });
});
