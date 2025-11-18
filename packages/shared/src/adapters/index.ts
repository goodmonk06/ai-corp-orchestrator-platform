/**
 * Adapter Pattern Implementation
 *
 * This module provides extension points for integrating external services
 * into the AI Corporation Orchestrator Platform.
 *
 * All adapters follow a common pattern:
 * 1. Define an interface (IXxxAdapter)
 * 2. Provide concrete implementations
 * 3. Allow easy swapping via configuration
 */

// Notification Adapters
export * from './notification-adapter';

// Metrics Adapters
export * from './metrics-adapter';

// AI Provider Adapters
export * from './ai-provider-adapter';

// Storage Adapters
export * from './storage-adapter';
