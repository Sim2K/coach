import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getEnvironmentConfig } from "@/lib/config/environment";
import { supabase } from '@/lib/supabase';

// Configure route segment config
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const initStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ message: 'No signature' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const stripe = initStripe();
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Debug log the entire session object
        console.log('Received session data:', {
          amount_total: session.amount_total,
          currency: session.currency,
          customer_details: session.customer_details,
          metadata: session.metadata,
          payment_status: session.payment_status,
          payment_intent: session.payment_intent
        });

        // Check each required field individually
        const missingFields = [];
        if (!session.amount_total) missingFields.push('amount_total');
        if (!session.currency) missingFields.push('currency');
        if (!session.customer_details?.email) missingFields.push('customer_details.email');
        if (!session.metadata?.user_id) missingFields.push('metadata.user_id');

        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          return NextResponse.json(
            { 
              message: `Missing required fields: ${missingFields.join(', ')}`,
              error: 'missing_required_fields'
            },
            { status: 400 }
          );
        }

        if (!session.metadata?.user_id) {
          console.error('Missing required user_id in session metadata');
          return NextResponse.json(
            { 
              message: 'Missing required user_id in session metadata',
              error: 'missing_user_id'
            },
            { status: 400 }
          );
        }

        // Add payment record to database with exact schema match
        const paymentData = {
          user_id: session.metadata.user_id,
          issuccess: true,
          status: 'completed',
          paymentstatus: session.payment_status || 'paid',
          paymentintentstatus: session.payment_status || 'succeeded',
          customeremail: session.customer_details?.email || '',
          amount: session.amount_total || 0,
          currency: (session.currency || 'usd').toUpperCase(),
          paymenttype: session.metadata?.paymentType || 'worth',
          timepaid: new Date().toISOString(),
          stripepaymentid: typeof session.payment_intent === 'string' ? session.payment_intent : null
        };

        console.log('Attempting to insert payment record:', paymentData);

        console.log('Inserting payment record:', paymentData);

        const { error: insertError } = await supabase
          .from('payments')
          .insert([paymentData]);

        if (insertError) {
          console.error('Error inserting payment record:', insertError);
          return NextResponse.json(
            { 
              message: 'Failed to insert payment record',
              error: insertError
            },
            { status: 500 }
          );
        }

        return NextResponse.json({ received: true });

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Webhook handler failed',
        error: error.type || 'internal_server_error'
      },
      { status: error.statusCode || 500 }
    );
  }
}
