import nodemailer from 'nodemailer';
import type { EmailAttachment } from '../common/types';
import type { EmailMessage, EmailOptions } from '../types';
import { validateEmailMessage } from '../validation';
import { emailQueue } from '../queue';
import { EMAIL_CONSTANTS } from '../constants';
import fs from 'fs';
import path from 'path';

// Create reusable transporter
const createTransporter = () => {
  console.log('Creating email transporter (Node)...');

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
  console.log('Sending email (Node):', {
    to: message.to,
    from: message.from || EMAIL_CONSTANTS.EMAIL.FROM,
    subject: message.subject,
    hasHtml: !!message.html,
    attachmentsCount: message.attachments?.length || 0
  });

  try {
    // Validate transporter
    if (!await verifyTransporter()) {
      resetTransporter();
      if (!await verifyTransporter()) {
        throw new Error('Failed to establish email transport');
      }
    }

    // Process attachments if any
    const processedAttachments = message.attachments 
      ? await Promise.all(message.attachments.map(processAttachment))
      : undefined;

    // Send email
    const info = await transporter.sendMail({
      from: message.from || EMAIL_CONSTANTS.EMAIL.FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: processedAttachments
    });

    console.log('Email sent successfully:', info);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
};

// Queue an email for sending
export const queueEmail = async (
  message: Partial<EmailMessage>,
  options?: EmailOptions
): Promise<{ queueId: string }> => {
  const enrichedMessage: EmailMessage = {
    to: message.to!,
    from: message.from || EMAIL_CONSTANTS.EMAIL.FROM,
    subject: message.subject!,
    text: message.text,
    html: message.html,
    attachments: message.attachments,
    replyTo: message.replyTo,
    options: message.options
  };
  const queueId = await emailQueue.addToQueue(enrichedMessage, options);
  return { queueId };
};

// Send bulk emails
export const sendBulkEmails = async (
  messages: EmailMessage[]
): Promise<Array<{ success: boolean; error?: string; messageId?: string }>> => {
  return Promise.all(messages.map(message => sendEmail(message)));
};

// Get email queue status
export const getEmailQueueStatus = async () => {
  return emailQueue.getQueueStatus();
};

// Get specific email status
export const getEmailStatus = async (queueId: string) => {
  return emailQueue.getQueueItem(queueId);
};
