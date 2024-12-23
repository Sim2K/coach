import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnvironmentConfig } from '@/lib/config/environment';

// Initialize Stripe with the appropriate secret key
const initStripe = () => {
  const config = getEnvironmentConfig();
  const secretKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY!
    : process.env.STRIPE_TEST_SECRET_KEY!;
  
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  const config = getEnvironmentConfig();

  if (!signature) {
    return NextResponse.json(
      { message: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const stripe = initStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Here you would typically:
        // 1. Update user's subscription status
        // 2. Send confirmation email
        // 3. Update database records
        // 4. Handle any other business logic

        console.log('Payment successful:', session.id);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Session expired:', session.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { message: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}
