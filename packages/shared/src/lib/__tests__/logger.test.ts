import { describe, it, expect } from 'vitest';
import { createLogger } from '../logger';

describe('Logger', () => {
  it('should create a logger with specified name', () => {
    const logger = createLogger('test-logger');
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should have pino bindings', () => {
    const logger = createLogger('test-service');
    const bindings = logger.bindings();
    expect(bindings.name).toBe('test-service');
  });
});
