import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnvironmentConfig } from '@/lib/config/environment';

const initStripe = () => {
  const config = getEnvironmentConfig();
  const secretKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY!
    : process.env.STRIPE_TEST_SECRET_KEY!;
  
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { message: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    const stripe = initStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription']
    });

    // Check various session states
    const isSuccess = 
      session.payment_status === 'paid' || 
      (session.payment_intent as Stripe.PaymentIntent)?.status === 'succeeded';

    const response = {
      isSuccess,
      status: session.status,
      paymentStatus: session.payment_status,
      paymentIntentStatus: (session.payment_intent as Stripe.PaymentIntent)?.status,
      customerEmail: session.customer_details?.email,
      amount: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    };

    console.log('Session status response:', response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve session status' },
      { status: 500 }
    );
  }
}
