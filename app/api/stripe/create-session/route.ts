import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnvironmentConfig } from '@/lib/config/environment';
import { CreateSessionRequest } from '@/types/stripe';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
    const { currency, amount, paymentType, metadata }: CreateSessionRequest = await request.json();
    console.log('Received request:', { currency, amount, paymentType, metadata });

    // Get the authenticated user
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json(
        { message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const config = getEnvironmentConfig();
    const stripe = initStripe();

    // Get the origin from the request headers or use the config default
    const origin = request.headers.get('origin') || config.returnUrl;

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
              name: 'Accountability Life Coach',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        currency,
        originalAmount: amount.toString(),
        paymentType,
        user_id: user.id,
        subscriptionEndDate: metadata?.subscriptionEndDate || new Date().toISOString().split('T')[0],
        MonthsCount: metadata?.MonthsCount || '1'
      },
      success_url: `${origin}/settings?tab=billing&status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/settings?tab=billing&status=cancelled`,
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
