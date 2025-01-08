// Debug log for scheduler configuration
console.log('Loading email scheduler configuration...');
console.log('API Key from env:', process.env.EMAIL_SCHEDULER_API_KEY);

export const EMAIL_CONSTANTS = {
  // SMTP Configuration
  SMTP: {
    HOST: process.env.SMTP_SERVER_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.SMTP_SERVER_PORT || '587', 10),
    USERNAME: process.env.SMTP_SERVER_USERNAME || '',
    PASSWORD: process.env.SMTP_SERVER_PASSWORD || '',
    SECURE: process.env.SMTP_SECURE === 'true',
  },

  // Email Addresses
  EMAIL: {
    FROM: process.env.EMAIL_FROM || 'coachAjay@Veedence.co.uk',
    REPLY_TO: process.env.EMAIL_REPLY_TO || 'NoReply@Veedence.co.uk',
    BCC: process.env.EMAIL_BCC,
  },

  // Rate Limiting
  LIMITS: {
    RATE_LIMIT: parseInt(process.env.EMAIL_RATE_LIMIT || '100', 10),
    BATCH_SIZE: parseInt(process.env.EMAIL_BATCH_SIZE || '50', 10),
    RETRY_ATTEMPTS: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3', 10),
    QUEUE_TIMEOUT: parseInt(process.env.EMAIL_QUEUE_TIMEOUT || '300', 10),
  },

  // Attachments
  ATTACHMENTS: {
    MAX_SIZE: parseInt(process.env.MAX_ATTACHMENT_SIZE || '10485760', 10), // 10MB
    ALLOWED_TYPES: (process.env.ALLOWED_ATTACHMENT_TYPES || 'pdf,doc,docx,txt,jpg,jpeg,png').split(','),
  },

  // Monitoring
  MONITORING: {
    ENABLED: process.env.EMAIL_LOGGING_ENABLED === 'true',
    WEBHOOK_URL: process.env.EMAIL_MONITORING_WEBHOOK,
  },

  // Error Messages
  ERRORS: {
    INVALID_EMAIL: 'Invalid email address',
    INVALID_TEMPLATE: 'Invalid email template',
    ATTACHMENT_TOO_LARGE: 'Attachment size exceeds limit',
    INVALID_ATTACHMENT_TYPE: 'Invalid attachment type',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    SMTP_ERROR: 'SMTP server error',
    QUEUE_TIMEOUT: 'Queue processing timeout',
  },

  // Scheduler Configuration
  SCHEDULER: {
    MAX_RETRIES: parseInt(process.env.EMAIL_SCHEDULER_MAX_RETRIES || '3', 10),
    RETRY_DELAY: parseInt(process.env.EMAIL_SCHEDULER_RETRY_DELAY || '300000', 10), // 5 minutes
    BATCH_SIZE: parseInt(process.env.EMAIL_SCHEDULER_BATCH_SIZE || '50', 10),
    TIMEZONE_DEFAULT: process.env.EMAIL_SCHEDULER_TIMEZONE_DEFAULT || 'UTC',
    API_KEY: process.env.EMAIL_SCHEDULER_API_KEY || '2DYEjLR7RL2p84ZJfyY6', // Fallback to the key from .env.local
  },

  // Scheduler Error Messages
  SCHEDULER_ERRORS: {
    UNAUTHORIZED: 'Unauthorized access to scheduler endpoint',
    INVALID_TIMEZONE: 'Invalid timezone specified',
    SCHEDULING_ERROR: 'Error scheduling email',
    DATABASE_ERROR: 'Error accessing email database',
  },
} as const;
