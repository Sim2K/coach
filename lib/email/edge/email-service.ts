import nodemailer from 'nodemailer';
import type { EmailTransportConfig } from '../common/types';
import type { EmailMessage, EmailOptions, EmailAttachment } from '../types';
import { EMAIL_CONSTANTS } from '../constants';

/**
 * Edge-compatible email service
 * Streamlined version without Node.js native modules
 */

// Create reusable transporter
const createTransporter = () => {
  console.log('Creating email transporter (Edge)...');

  const config: EmailTransportConfig = {
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
  };

  return nodemailer.createTransport(config);
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

// Helper function to process attachments (Edge-compatible)
const processAttachment = async (attachment: EmailAttachment) => {
  if (Buffer.isBuffer(attachment.content)) {
    return {
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType
    };
  }

  if (typeof attachment.content === 'string') {
    // Handle URLs and data URIs only
    if (attachment.content.startsWith('http') || attachment.content.startsWith('data:')) {
      return {
        filename: attachment.filename,
        path: attachment.content,
        contentType: attachment.contentType
      };
    }

    // Handle raw content
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
  console.log('Sending email (Edge):', {
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
