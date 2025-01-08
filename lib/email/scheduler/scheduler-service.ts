import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import { EMAIL_CONSTANTS } from '../constants';
import { 
  ScheduledEmail, 
  ScheduledEmailStatus,
  EmailSchedulerResult,
  EmailProcessingDetail,
  EmailSchedulerError,
  EmailSchedulerErrorCode,
  EmailMessage
} from '../types';
import { isScheduledTimeDue, isValidTimezone, convertToUTC } from '../utils/timezone-utils';
import { sendEmail } from '../email-service';

// Initialize Supabase client
const initSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

const supabase = initSupabase();

/**
 * Creates a standardized error object
 */
const createError = (
  code: EmailSchedulerErrorCode,
  message: string,
  error?: Error
): EmailSchedulerError => ({
  code,
  message,
  details: error?.message,
  ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
});

/**
 * Fetches emails that are scheduled to be sent
 */
export const fetchScheduledEmails = async (): Promise<ScheduledEmail[]> => {
  try {
    console.log('Fetching scheduled emails...');
    
    const now = DateTime.utc();
    const currentDate = now.toFormat('yyyy-MM-dd');
    const currentTime = now.toFormat('HH:mm:ss');

    console.log('Current UTC DateTime:', { currentDate, currentTime });

    const { data, error } = await supabase
      .from('emailtosend')
      .select('*')
      .eq('sent', false)
      .lt('retry_count', EMAIL_CONSTANTS.SCHEDULER.MAX_RETRIES)
      .or(`date_to_send.lt.${currentDate},and(date_to_send.eq.${currentDate},time_to_send.lte.${currentTime})`)
      .order('created_at', { ascending: true })
      .limit(EMAIL_CONSTANTS.SCHEDULER.BATCH_SIZE);

    if (error) {
      console.error('Database error while fetching emails:', error);
      throw createError('DATABASE_ERROR', 'Failed to fetch scheduled emails', error);
    }

    console.log(`Found ${data?.length || 0} emails to process`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchScheduledEmails:', error);
    throw error instanceof Error 
      ? error 
      : createError('DATABASE_ERROR', 'Unknown error while fetching emails');
  }
};

/**
 * Updates email status in the database
 */
export const updateEmailStatus = async (
  emailId: string,
  status: ScheduledEmailStatus,
  error?: string
): Promise<void> => {
  const startTime = Date.now();
  console.log(`Updating email ${emailId} status to ${status}${error ? ` with error: ${error}` : ''}`);

  try {
    const updates: Partial<ScheduledEmail> = {
      status,
      updated_at: new Date(),
    };

    if (status === 'failed') {
      const { data } = await supabase
        .from('emailtosend')
        .select('retry_count')
        .eq('email_id', emailId)
        .single();

      updates.retry_count = (data?.retry_count || 0) + 1;
    }

    if (status === 'sent') {
      updates.sent = true;
    }

    const { error: updateError } = await supabase
      .from('emailtosend')
      .update(updates)
      .eq('email_id', emailId);

    if (updateError) {
      throw createError('DATABASE_ERROR', `Failed to update email status: ${updateError.message}`, updateError);
    }

    console.log(`Status update completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`Error updating email status for ${emailId}:`, error);
    throw error instanceof Error 
      ? error 
      : createError('DATABASE_ERROR', 'Unknown error while updating email status');
  }
};

/**
 * Processes a single scheduled email
 */
export const processScheduledEmail = async (
  email: ScheduledEmail
): Promise<EmailProcessingDetail> => {
  const startTime = Date.now();
  console.log('==== Processing Email ====');
  console.log('Email details:', {
    id: email.email_id,
    scheduled: {
      date: email.date_to_send,
      time: email.time_to_send,
      timezone: email.timezone
    },
    currentUTC: DateTime.utc().toISO()
  });

  try {
    // Validate timezone
    console.log('Validating timezone:', email.timezone);
    if (!isValidTimezone(email.timezone)) {
      console.error('Invalid timezone:', email.timezone);
      const error = EMAIL_CONSTANTS.SCHEDULER_ERRORS.INVALID_TIMEZONE;
      await updateEmailStatus(email.email_id, 'failed', error);
      return {
        email_id: email.email_id,
        status: 'failed',
        error,
        processingTime: Date.now() - startTime
      };
    }
    console.log('Timezone validation passed');

    // Check if email is due
    console.log('Checking if email is due...');
    const scheduledUTC = convertToUTC(email.date_to_send, email.time_to_send, email.timezone);
    const nowUTC = DateTime.utc();

    console.log('Time comparison:', {
      scheduled: scheduledUTC?.toISO(),
      now: nowUTC.toISO(),
      isDue: scheduledUTC && scheduledUTC <= nowUTC
    });

    if (!scheduledUTC || scheduledUTC > nowUTC) {
      console.log('Email not due yet');
      return {
        email_id: email.email_id,
        status: 'pending',
        processingTime: Date.now() - startTime
      };
    }

    console.log('Email is due, preparing to send...');
    await updateEmailStatus(email.email_id, 'in_progress');

    // Convert simple attachment to EmailAttachment format
    const attachments = email.attachment_url ? [{
      filename: email.attachment_url.split('/').pop() || 'attachment',
      content: email.attachment_url,
      contentType: 'application/octet-stream',
      size: 0 // Size will be determined when content is fetched
    }] : undefined;

    const message: EmailMessage = {
      to: email.to_email,
      from: EMAIL_CONSTANTS.EMAIL.FROM,
      subject: email.subject,
      html: email.body,
      cc: email.cc_email,
      bcc: email.bcc_email,
      attachments
    };

    console.log('Sending email with message:', {
      to: message.to,
      subject: message.subject,
      hasHtml: !!message.html,
      hasAttachments: !!message.attachments
    });

    const result = await sendEmail(message);
    console.log('Send result:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log('Email sent successfully, updating status...');
    await supabase
      .from('emailtosend')
      .update({
        sent: true,
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('email_id', email.email_id);

    return {
      email_id: email.email_id,
      status: 'sent',
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error processing email:', {
      emailId: email.email_id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateEmailStatus(email.email_id, 'failed', errorMessage);
    return {
      email_id: email.email_id,
      status: 'failed',
      error: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};

/**
 * Processes all due scheduled emails
 */
export const processScheduledEmails = async (): Promise<EmailSchedulerResult> => {
  const startTime = Date.now();
  console.log('Starting scheduled email processing');

  const result: EmailSchedulerResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  try {
    const emails = await fetchScheduledEmails();
    result.processed = emails.length;

    const processResults = await Promise.all(
      emails.map(async (email) => {
        const processResult = await processScheduledEmail(email);
        result.details.push(processResult);

        switch (processResult.status) {
          case 'sent':
            result.sent++;
            break;
          case 'pending':
            result.skipped++;
            break;
          case 'failed':
            result.failed++;
            break;
        }

        return processResult;
      })
    );

    const totalTime = Date.now() - startTime;
    console.log('Email processing completed:', {
      ...result,
      totalProcessingTime: totalTime,
      averageTimePerEmail: emails.length ? totalTime / emails.length : 0
    });

    return result;
  } catch (error) {
    console.error('Error in processScheduledEmails:', error);
    throw error instanceof Error 
      ? error 
      : createError('PROCESSING_ERROR', 'Unknown error during email processing');
  }
};
