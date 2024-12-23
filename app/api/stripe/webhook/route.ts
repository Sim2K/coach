import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnvironmentConfig } from '@/lib/config/environment';
import { supabase } from '@/lib/supabase';

// Initialize Stripe with the appropriate secret key
const initStripe = () => {
  const config = getEnvironmentConfig();
  const secretKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY!
    : process.env.STRIPE_TEST_SECRET_KEY!;
  
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Get the raw body directly
  const signature = req.headers.get('stripe-signature');
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
      rawBody,
      signature,
      config.webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment successful:', session.id);

        // Insert payment record
        const { error } = await supabase
          .from("payments")
          .insert([{
            user_id: session.metadata?.user_id,
            issuccess: true,
            status: session.status,
            paymentstatus: session.payment_status,
            paymentintentstatus: 'succeeded',
            customeremail: session.customer_details?.email || '',
            amount: session.amount_total || 0,
            currency: session.currency,
            paymenttype: session.metadata?.paymentType?.toLowerCase() || '',
            stripepaymentid: session.payment_intent
          }]);

        if (error) {
          console.error('Error inserting payment record:', error);
        }
        
        break;
      }
      case 'checkout.session.expired': {
        console.log('Session expired:', event.data.object.id);
        break;
      }
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      signature: signature?.substring(0, 20) + '...',
      webhookSecretLength: config.webhookSecret?.length || 0
    });
    
    return NextResponse.json(
      { message: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}
