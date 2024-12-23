import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnvironmentConfig } from '@/lib/config/environment';
import { CreateSessionRequest } from '@/types/stripe';

// Initialize Stripe with the appropriate secret key
const initStripe = () => {
  const config = getEnvironmentConfig();
  const secretKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY!
    : process.env.STRIPE_TEST_SECRET_KEY!;
  
  console.log('Using environment:', process.env.NODE_ENV);
  console.log('Using secret key:', secretKey.substring(0, 8) + '...');
  
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
};

export async function POST(request: Request) {
  try {
    const { currency, amount, paymentType }: CreateSessionRequest = await request.json();
    console.log('Received request:', { currency, amount, paymentType });

    const config = getEnvironmentConfig();
    const stripe = initStripe();

    // Get the appropriate price ID for the currency
    const priceId = config.priceIds[currency];
    console.log('Selected price ID:', priceId);

    if (!priceId) {
      return NextResponse.json(
        { message: `Currency ${currency} not supported` },
        { status: 400 }
      );
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      submit_type: 'pay',
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'AI Coaching Subscription',
              description: `${paymentType === 'worth' ? 'Value-based' : 'Accessibility-based'} payment`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentType,
        originalAmount: amount.toString(),
        currency,
        user_id: request.headers.get('x-user-id') || ''
      },
      success_url: `${request.headers.get('origin')}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${request.headers.get('origin')}/settings?tab=billing&status=cancelled`,
    });

    console.log('Created session:', { 
      id: session.id,
      url: session.url,
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
