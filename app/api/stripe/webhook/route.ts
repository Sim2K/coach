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
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ message: 'No signature' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const stripe = initStripe();
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Add payment record to database
        const { error: insertError } = await supabase
          .from('payments')
          .insert({
            user_id: session.metadata?.user_id,
            status: 'completed',
            issuccess: true,
            amount: session.amount_total,
            currency: session.currency,
            payment_type: session.metadata?.paymentType,
            original_amount: session.metadata?.originalAmount,
            session_id: session.id,
            payment_intent: (session.payment_intent as string) || null,
            customer_email: session.customer_details?.email || null,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting payment record:', insertError);
          throw new Error('Failed to insert payment record');
        }

        return NextResponse.json({ message: 'Payment completed' });

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ message: `Unhandled event type: ${event.type}` });
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
