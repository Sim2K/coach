import { NextRequest } from 'next/server';
import { EMAIL_CONSTANTS } from '@/lib/email/constants';
import { processScheduledEmails } from '@/lib/email/scheduler/scheduler-service';
import { EmailSchedulerResponse, EmailSchedulerError } from '@/lib/email/types';

// Configure route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Configure request body parsing and middleware handling
export const revalidate = 0;
export const preferredRegion = 'auto';
export const maxDuration = 300;

/**
 * Creates a standardized API response
 */
const createResponse = (
  data: Partial<EmailSchedulerResponse>,
  status: number = 200
) => {
  const response: EmailSchedulerResponse = {
    success: status < 400,
    message: data.message || (status < 400 ? 'Success' : 'Error'),
    timestamp: new Date().toISOString(),
    ...(data.data && { data: data.data }),
    ...(data.error && { error: data.error })
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    }
  });
};

/**
 * Validates the API key from the request headers
 */
const validateApiKey = (request: NextRequest): boolean => {
  try {
    const apiKey = request.headers.get('x-api-key');
    console.log('API Key validation:', {
      received: apiKey,
      expected: EMAIL_CONSTANTS.SCHEDULER.API_KEY,
      isValid: apiKey === EMAIL_CONSTANTS.SCHEDULER.API_KEY
    });
    return apiKey === EMAIL_CONSTANTS.SCHEDULER.API_KEY;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return createResponse({ message: 'OK' }, 200);
}

/**
 * POST handler for the email scheduler webhook
 */
export async function POST(request: NextRequest) {
  console.log('=== Email Scheduler Webhook Triggered ===');
  console.log('Request details:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  try {
    // Get raw body for verification if needed
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Validate API key
    if (!validateApiKey(request)) {
      console.error('Invalid API key provided');
      return createResponse(
        {
          message: 'Invalid API key',
          error: {
            code: 'UNAUTHORIZED',
            message: EMAIL_CONSTANTS.SCHEDULER_ERRORS.UNAUTHORIZED
          }
        },
        401
      );
    }

    // Process scheduled emails
    console.log('Starting email processing...');
    const result = await processScheduledEmails();
    console.log('Processing completed:', result);

    return createResponse({
      message: 'Scheduled emails processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in email scheduler webhook:', error);
    const schedulerError: EmailSchedulerError = 
      'code' in (error as any)
        ? (error as EmailSchedulerError)
        : {
            code: 'PROCESSING_ERROR',
            message: 'Failed to process scheduled emails',
            details: error instanceof Error ? error.message : 'Unknown error',
            ...(process.env.NODE_ENV === 'development' && {
              stack: error instanceof Error ? error.stack : undefined
            })
          };

    return createResponse(
      {
        message: 'Failed to process scheduled emails',
        error: schedulerError
      },
      500
    );
  }
}
