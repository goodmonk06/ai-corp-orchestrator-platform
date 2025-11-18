/**
 * Metrics Adapter Interface
 *
 * Allows plugging in different metrics/monitoring backends
 * (Prometheus, Datadog, CloudWatch, New Relic, etc.)
 */

export interface MetricPoint {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

export interface MetricQuery {
  name: string;
  labels?: Record<string, string>;
  startTime?: Date;
  endTime?: Date;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface MetricQueryResult {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

export interface IMetricsAdapter {
  /**
   * Adapter name/identifier
   */
  readonly name: string;

  /**
   * Record a single metric point
   */
  record(metric: MetricPoint): Promise<void>;

  /**
   * Record multiple metric points in batch
   */
  recordBatch(metrics: MetricPoint[]): Promise<void>;

  /**
   * Increment a counter metric
   */
  increment(name: string, value?: number, labels?: Record<string, string>): Promise<void>;

  /**
   * Record a gauge metric (current value)
   */
  gauge(name: string, value: number, labels?: Record<string, string>): Promise<void>;

  /**
   * Record a histogram/timing metric
   */
  histogram(name: string, value: number, labels?: Record<string, string>): Promise<void>;

  /**
   * Query metrics
   */
  query(query: MetricQuery): Promise<MetricQueryResult[]>;

  /**
   * Get adapter status
   */
  getStatus(): Promise<{
    healthy: boolean;
    message?: string;
  }>;
}

/**
 * In-Memory Metrics Adapter (for development/testing)
 */
export class InMemoryMetricsAdapter implements IMetricsAdapter {
  readonly name = 'in-memory';
  private metrics: Map<string, MetricPoint[]> = new Map();

  async record(metric: MetricPoint): Promise<void> {
    const key = this.getKey(metric.name, metric.labels);
    const existing = this.metrics.get(key) || [];
    existing.push({
      ...metric,
      timestamp: metric.timestamp || new Date(),
    });
    this.metrics.set(key, existing);
  }

  async recordBatch(metrics: MetricPoint[]): Promise<void> {
    await Promise.all(metrics.map((m) => this.record(m)));
  }

  async increment(name: string, value = 1, labels?: Record<string, string>): Promise<void> {
    const key = this.getKey(name, labels);
    const existing = this.metrics.get(key) || [];
    const lastValue = existing[existing.length - 1]?.value || 0;

    await this.record({
      name,
      value: lastValue + value,
      labels,
    });
  }

  async gauge(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async histogram(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async query(query: MetricQuery): Promise<MetricQueryResult[]> {
    const key = this.getKey(query.name, query.labels);
    const metrics = this.metrics.get(key) || [];

    let filtered = metrics;
    if (query.startTime) {
      filtered = filtered.filter((m) => m.timestamp && m.timestamp >= query.startTime!);
    }
    if (query.endTime) {
      filtered = filtered.filter((m) => m.timestamp && m.timestamp <= query.endTime!);
    }

    return filtered.map((m) => ({
      name: m.name,
      value: m.value,
      labels: m.labels,
      timestamp: m.timestamp || new Date(),
    }));
  }

  async getStatus() {
    return {
      healthy: true,
      message: `Tracking ${this.metrics.size} metric keys`,
    };
  }

  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}

/**
 * Prometheus Metrics Adapter (template for implementation)
 */
export class PrometheusMetricsAdapter implements IMetricsAdapter {
  readonly name = 'prometheus';

  constructor(
    private config: {
      pushgatewayUrl?: string;
      job: string;
    }
  ) {}

  async record(metric: MetricPoint): Promise<void> {
    // TODO: Push to Prometheus Pushgateway
    console.log('[Prometheus] Record metric:', metric);
  }

  async recordBatch(metrics: MetricPoint[]): Promise<void> {
    await Promise.all(metrics.map((m) => this.record(m)));
  }

  async increment(name: string, value = 1, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async gauge(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async histogram(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async query(query: MetricQuery): Promise<MetricQueryResult[]> {
    // TODO: Query Prometheus
    console.log('[Prometheus] Query metrics:', query);
    return [];
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Prometheus adapter ready',
    };
  }
}

/**
 * Datadog Metrics Adapter (template for implementation)
 */
export class DatadogMetricsAdapter implements IMetricsAdapter {
  readonly name = 'datadog';

  constructor(
    private config: {
      apiKey: string;
      site?: string; // e.g., 'datadoghq.com'
    }
  ) {}

  async record(metric: MetricPoint): Promise<void> {
    // TODO: Send to Datadog API
    console.log('[Datadog] Record metric:', metric);
  }

  async recordBatch(metrics: MetricPoint[]): Promise<void> {
    // TODO: Use Datadog batch API
    await Promise.all(metrics.map((m) => this.record(m)));
  }

  async increment(name: string, value = 1, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async gauge(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async histogram(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    await this.record({ name, value, labels });
  }

  async query(query: MetricQuery): Promise<MetricQueryResult[]> {
    // TODO: Query Datadog
    console.log('[Datadog] Query metrics:', query);
    return [];
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Datadog adapter ready',
    };
  }
}
