import nodemailer from 'nodemailer';
import { EmailMessage, EmailOptions, EmailAttachment } from './types';
import { validateEmailMessage } from './validation';
import { emailQueue } from './queue';
import { EMAIL_CONSTANTS } from './constants';
import fs from 'fs';
import path from 'path';

// Create reusable transporter
const createTransporter = () => {
  console.log('Creating email transporter...');

  return nodemailer.createTransport({
    host: EMAIL_CONSTANTS.SMTP.HOST,
    port: EMAIL_CONSTANTS.SMTP.PORT,
    secure: EMAIL_CONSTANTS.SMTP.SECURE,
    auth: {
      user: EMAIL_CONSTANTS.SMTP.USERNAME,
      pass: EMAIL_CONSTANTS.SMTP.PASSWORD
    },
    requireTLS: true,
    debug: true,
    logger: true
  });
};

// Initialize transporter
let transporter = createTransporter();

// Verify transporter connection
const verifyTransporter = async (): Promise<boolean> => {
  try {
    console.log('Verifying email transporter connection...');
    await transporter.verify();
    console.log('Email transporter verified successfully');
    return true;
  } catch (error) {
    console.error('Failed to verify email transporter:', error);
    return false;
  }
};

// Reset transporter if needed
const resetTransporter = () => {
  console.log('Resetting email transporter...');
  transporter = createTransporter();
};

// Helper function to process attachments
const processAttachment = async (attachment: EmailAttachment) => {
  if (Buffer.isBuffer(attachment.content)) {
    return {
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType
    };
  }

  if (typeof attachment.content === 'string') {
    // Check if it's a file path
    if (fs.existsSync(attachment.content)) {
      return {
        filename: attachment.filename || path.basename(attachment.content),
        path: attachment.content,
        contentType: attachment.contentType
      };
    }

    // Check if it's a URL
    if (attachment.content.startsWith('http')) {
      return {
        filename: attachment.filename,
        path: attachment.content,
        contentType: attachment.contentType
      };
    }

    // Check if it's a data URI
    if (attachment.content.startsWith('data:')) {
      return {
        filename: attachment.filename,
        path: attachment.content,
        contentType: attachment.contentType
      };
    }

    // Treat as raw content
    return {
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType || 'text/plain'
    };
  }

  throw new Error('Invalid attachment format');
};

// Send a single email
export const sendEmail = async (
  message: EmailMessage
): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    console.log('Starting email send process...', {
      to: message.to,
      subject: message.subject,
      hasHtml: !!message.html,
      attachmentsCount: message?.attachments?.length || 0
    });

    // Process attachments if they exist
    let processedAttachments = [];
    if (message.attachments && message.attachments.length > 0) {
      try {
        processedAttachments = await Promise.all(
          message.attachments.map(processAttachment)
        );
      } catch (error) {
        console.error('Failed to process attachments:', error);
        throw new Error('Failed to process attachments');
      }
    }

    // Validate email message
    const validation = validateEmailMessage(message);
    if (!validation.isValid) {
      console.error('Email validation failed:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }

    // Verify transporter
    const isValid = await verifyTransporter();
    if (!isValid) {
      console.log('Transporter invalid, attempting reset...');
      resetTransporter();
      const retryValid = await verifyTransporter();
      if (!retryValid) {
        throw new Error('Failed to establish email transport');
      }
    }

    // Send mail
    console.log('Sending email...');
    const info = await transporter.sendMail({
      from: {
        name: 'Coach Ajay',
        address: EMAIL_CONSTANTS.EMAIL.FROM
      },
      replyTo: EMAIL_CONSTANTS.EMAIL.REPLY_TO,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });

    console.log('Email sent successfully:', info);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
};

// Queue an email for sending
export const queueEmail = async (
  message: EmailMessage,
  options?: EmailOptions
): Promise<{ queueId: string }> => {
  console.log('Queueing email for sending...', {
    to: message.to,
    subject: message.subject,
    hasHtml: !!message.html,
    attachmentsCount: message?.attachments?.length || 0
  });

  const enrichedMessage: EmailMessage = {
    ...message,
    options: {
      ...message.options,
      ...options,
    },
  };

  const queueId = await emailQueue.addToQueue(
    enrichedMessage,
    options?.priority || 'normal'
  );

  console.log('Email queued successfully:', queueId);
  return { queueId };
};

// Send bulk emails
export const sendBulkEmails = async (
  messages: EmailMessage[]
): Promise<Array<{ success: boolean; error?: string; messageId?: string }>> => {
  console.log('Starting bulk email send process...', {
    emailsCount: messages.length
  });

  return Promise.all(
    messages.map(message => sendEmail(message))
  );
};

// Get email queue status
export const getEmailQueueStatus = () => {
  console.log('Getting email queue status...');
  return emailQueue.getQueueStatus();
};

// Get specific email status from queue
export const getEmailStatus = (queueId: string) => {
  console.log('Getting email status from queue...', { queueId });
  return emailQueue.getQueueItem(queueId);
};
