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
  cc?: string;
  bcc?: string;
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

// Scheduler Types
export type ScheduledEmailStatus = 'pending' | 'in_progress' | 'sent' | 'failed';

export interface ScheduledEmail {
  email_id: string;
  user_id: string;
  to_email: string;
  cc_email?: string;
  bcc_email?: string;
  subject: string;
  body: string;
  date_to_send: string;
  time_to_send: string;
  timezone: string;
  sent: boolean;
  retry_count: number;
  status: ScheduledEmailStatus;
  attachment_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SchedulerConfig {
  maxRetries: number;
  retryDelay: number;  // in milliseconds
  batchSize: number;
  timezoneDefault: string;
}

// Scheduler Response Types
export type EmailSchedulerErrorCode = 
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST'
  | 'DATABASE_ERROR'
  | 'PROCESSING_ERROR'
  | 'EMAIL_SEND_ERROR'
  | 'VALIDATION_ERROR';

export interface EmailSchedulerError {
  code: EmailSchedulerErrorCode;
  message: string;
  details?: string;
  stack?: string;
}

export interface EmailProcessingDetail {
  email_id: string;
  status: ScheduledEmailStatus;
  error?: string;
  processingTime?: number;
}

export interface EmailSchedulerResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  details: EmailProcessingDetail[];
}

export interface EmailSchedulerResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data?: EmailSchedulerResult;
  error?: EmailSchedulerError;
}
