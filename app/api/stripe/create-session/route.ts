import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnvironmentConfig } from '@/lib/config/environment';
import { CreateSessionRequest } from '@/types/stripe';

// Initialize Stripe with the appropriate secret key
const initStripe = () => {
  const config = getEnvironmentConfig();
  const secretKey = process.env.STRIPE_SECRET_KEY!;
  
  console.log('Using environment:', process.env.NODE_ENV);
  console.log('Using secret key:', secretKey.substring(0, 8) + '...');
  
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
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
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        currency,
        originalAmount: amount.toString(),
        paymentType,
      },
      success_url: `${config.returnUrl}/settings?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.returnUrl}/settings?status=cancelled`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { message: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
