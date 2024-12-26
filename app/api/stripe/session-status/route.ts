import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnvironmentConfig } from '@/lib/config/environment';
import { StripeSessionResponse } from '@/types/stripe';

// Configure route segment config
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Initialize Stripe with the appropriate secret key
const initStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });
};

export async function GET(request: Request) {
  try {
    // Use URLSearchParams directly to avoid request.url
    const sessionId = new URLSearchParams(new URL(request.url).search).get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, isSuccess: false, message: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const stripe = initStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription']
    });

    // Check various session states
    const isSuccess = 
      session.payment_status === 'paid' || 
      (session.payment_intent as Stripe.PaymentIntent)?.status === 'succeeded';

    const response: StripeSessionResponse = {
      success: true,
      isSuccess,
      status: session.status as 'complete' | 'expired' | 'open',
      paymentStatus: session.payment_status as 'paid' | 'unpaid' | 'no_payment_required',
      paymentIntentStatus: ((session.payment_intent as Stripe.PaymentIntent)?.status || 'requires_payment_method') as 
        'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled',
      customerEmail: session.customer_details?.email || '',
      amount: session.amount_total || 0,
      currency: session.currency || 'USD',
      metadata: {
        currency: session.metadata?.currency || session.currency || 'USD',
        originalAmount: session.metadata?.originalAmount || session.amount_total?.toString() || '0',
        paymentType: (session.metadata?.paymentType || 'afford') as 'afford' | 'worth'
      }
    };

    console.log('Session status response:', response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error retrieving session:', error);

    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false,
          isSuccess: false,
          message: error.message,
          error: error.type
        },
        { status: error.statusCode || 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        success: false,
        isSuccess: false,
        message: error.message || 'Failed to retrieve session status',
        error: 'internal_server_error'
      },
      { status: 500 }
    );
  }
}
