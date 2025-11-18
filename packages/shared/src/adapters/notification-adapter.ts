/**
 * Notification Adapter Interface
 *
 * Allows plugging in different notification delivery mechanisms
 * (email, SMS, Slack, Discord, push notifications, etc.)
 */

export interface NotificationPayload {
  to: string | string[]; // Email, phone, user ID, etc.
  subject?: string;
  title: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  metadata?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredAt?: Date;
}

export interface INotificationAdapter {
  /**
   * Adapter name/identifier
   */
  readonly name: string;

  /**
   * Send a single notification
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;

  /**
   * Send multiple notifications in batch
   */
  sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]>;

  /**
   * Verify the adapter configuration is valid
   */
  verify(): Promise<boolean>;

  /**
   * Get adapter status and health
   */
  getStatus(): Promise<{
    healthy: boolean;
    message?: string;
    metadata?: Record<string, any>;
  }>;
}

/**
 * Console Notification Adapter (for development/testing)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  readonly name = 'console';

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    console.log('[Notification]', {
      to: payload.to,
      title: payload.title,
      message: payload.message,
      priority: payload.priority,
      actionUrl: payload.actionUrl,
    });

    return {
      success: true,
      messageId: `console-${Date.now()}`,
      deliveredAt: new Date(),
    };
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  async verify(): Promise<boolean> {
    return true;
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Console adapter is always available',
    };
  }
}

/**
 * Email Notification Adapter (template for implementation)
 */
export class EmailNotificationAdapter implements INotificationAdapter {
  readonly name = 'email';

  constructor(
    private config: {
      host: string;
      port: number;
      user: string;
      password: string;
      from: string;
    }
  ) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // TODO: Implement actual email sending logic (e.g., using nodemailer)
    console.log('[Email Adapter] Would send email:', payload);

    return {
      success: true,
      messageId: `email-${Date.now()}`,
      deliveredAt: new Date(),
    };
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  async verify(): Promise<boolean> {
    // TODO: Verify SMTP connection
    return true;
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Email adapter ready',
      metadata: {
        host: this.config.host,
        port: this.config.port,
      },
    };
  }
}

/**
 * Slack Notification Adapter (template for implementation)
 */
export class SlackNotificationAdapter implements INotificationAdapter {
  readonly name = 'slack';

  constructor(
    private config: {
      webhookUrl: string;
      defaultChannel?: string;
    }
  ) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // TODO: Implement Slack webhook posting
    console.log('[Slack Adapter] Would send Slack message:', payload);

    return {
      success: true,
      messageId: `slack-${Date.now()}`,
      deliveredAt: new Date(),
    };
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  async verify(): Promise<boolean> {
    // TODO: Verify webhook URL is accessible
    return true;
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Slack adapter ready',
    };
  }
}
