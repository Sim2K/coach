import { createReadStream, ReadStream, readFileSync } from 'fs';
import { stat } from 'fs/promises';
import { EMAIL_CONSTANTS } from '../constants';
import { EmailAttachment } from '../types';

export const processFileAttachment = async (
  filePath: string,
  filename?: string
): Promise<EmailAttachment | null> => {
  try {
    const stats = await stat(filePath);
    const actualFilename = filename || filePath.split('/').pop() || 'attachment';
    
    if (stats.size > EMAIL_CONSTANTS.ATTACHMENTS.MAX_SIZE) {
      throw new Error(EMAIL_CONSTANTS.ERRORS.ATTACHMENT_TOO_LARGE);
    }

    const fileExtension = actualFilename.split('.').pop()?.toLowerCase() || '';
    if (!EMAIL_CONSTANTS.ATTACHMENTS.ALLOWED_TYPES.includes(fileExtension)) {
      throw new Error(EMAIL_CONSTANTS.ERRORS.INVALID_ATTACHMENT_TYPE);
    }

    return {
      filename: actualFilename,
      content: readFileSync(filePath),
      size: stats.size,
      contentType: getContentType(fileExtension),
    };
  } catch (error) {
    console.error('Error processing file attachment:', error);
    return null;
  }
};

export const processBufferAttachment = (
  buffer: Buffer,
  filename: string
): EmailAttachment | null => {
  try {
    if (buffer.length > EMAIL_CONSTANTS.ATTACHMENTS.MAX_SIZE) {
      throw new Error(EMAIL_CONSTANTS.ERRORS.ATTACHMENT_TOO_LARGE);
    }

    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    if (!EMAIL_CONSTANTS.ATTACHMENTS.ALLOWED_TYPES.includes(fileExtension)) {
      throw new Error(EMAIL_CONSTANTS.ERRORS.INVALID_ATTACHMENT_TYPE);
    }

    return {
      filename,
      content: buffer,
      size: buffer.length,
      contentType: getContentType(fileExtension),
    };
  } catch (error) {
    console.error('Error processing buffer attachment:', error);
    return null;
  }
};

const getContentType = (extension: string): string => {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };

  return contentTypes[extension] || 'application/octet-stream';
};
