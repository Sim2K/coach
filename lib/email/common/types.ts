import { Transporter } from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailMessage {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export interface EmailOptions {
  priority?: 'high' | 'normal' | 'low';
  retryCount?: number;
  scheduledTime?: Date;
}

export interface EmailSchedulerResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data?: {
    processed: number;
    sent: number;
    skipped: number;
    failed: number;
    details: Array<{
      email_id: string;
      status: string;
      error?: string;
      processingTime?: number;
    }>;
  };
  error?: EmailSchedulerError;
}

export interface EmailSchedulerError {
  code: string;
  message: string;
  details?: string;
}

export type EmailSchedulerErrorCode = 
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST'
  | 'PROCESSING_ERROR'
  | 'DATABASE_ERROR'
  | 'SMTP_ERROR';

export interface EmailTransportConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  requireTLS: boolean;
  debug?: boolean;
  logger?: boolean;
}
