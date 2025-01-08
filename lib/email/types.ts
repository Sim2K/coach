// Email Service Types
export type EmailPriority = 'high' | 'normal' | 'low';
export type EmailStatus = 'pending' | 'processing' | 'sent' | 'failed';

// Template Types
export type TemplateVariables = Record<string, string | number | boolean>;
export type TemplateVersion = 'v1' | 'v2';

// Transport Configuration
export interface TransportConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Template Configuration
export interface TemplateConfig {
  version: TemplateVersion;
  basePath: string;
}

// Queue Configuration
export interface QueueConfig {
  maxRetries: number;
  batchSize: number;
  timeout: number;
}

// Monitoring Configuration
export interface MonitoringConfig {
  enabled: boolean;
  webhookUrl?: string;
}

// Email Configuration
export interface EmailConfig {
  transport: TransportConfig;
  templates: TemplateConfig;
  queue: QueueConfig;
  monitoring: MonitoringConfig;
}

// Email Options
export interface EmailOptions {
  priority?: EmailPriority;
  scheduled?: Date;
  tracking?: boolean;
  retryAttempts?: number;
}

// Email Attachment
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  size: number;
}

// Email Message
export interface EmailMessage {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  options?: EmailOptions;
}

// Queue Item
export interface QueueItem {
  id: string;
  message: EmailMessage;
  status: EmailStatus;
  priority: EmailPriority;
  attempts: number;
  createdAt: Date;
  scheduledFor?: Date;
  error?: string;
}
