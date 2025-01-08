import { EMAIL_CONSTANTS } from '../constants';
import { EmailMessage, EmailAttachment } from '../types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmailAddresses = (emails: string | string[]): boolean => {
  const emailList = Array.isArray(emails) ? emails : [emails];
  return emailList.every(validateEmail);
};

export const validateAttachment = (attachment: EmailAttachment): boolean => {
  const { size, filename } = attachment;
  const fileExtension = filename.split('.').pop()?.toLowerCase() || '';

  return (
    size <= EMAIL_CONSTANTS.ATTACHMENTS.MAX_SIZE &&
    EMAIL_CONSTANTS.ATTACHMENTS.ALLOWED_TYPES.includes(fileExtension)
  );
};

export const validateEmailMessage = (message: EmailMessage): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate email addresses
  if (!validateEmailAddresses(message.to)) {
    errors.push(EMAIL_CONSTANTS.ERRORS.INVALID_EMAIL);
  }

  // Validate content
  if (!message.text && !message.html) {
    errors.push('Email must have either text or HTML content');
  }

  // Validate attachments
  if (message.attachments?.length) {
    message.attachments.forEach((attachment, index) => {
      if (!validateAttachment(attachment)) {
        errors.push(`Invalid attachment at index ${index}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
