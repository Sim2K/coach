import { CreateSessionRequest, CheckoutSession } from '@/types/stripe';
import { getEnvironmentConfig } from '../config/environment';
import { supabase } from '@/lib/supabase';

export const createCheckoutSession = async (
  currency: string,
  amount: number,
  paymentType: 'afford' | 'worth',
  metadata?: Record<string, string>
): Promise<CheckoutSession> => {
  try {
    const { data: { session: userSession } } = await supabase.auth.getSession();
    if (!userSession) {
      throw new Error('No active session');
    }

    console.log('Creating checkout session:', { currency, amount, paymentType, metadata });
    
    const response = await fetch('/api/stripe/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userSession.user.id
      },
      body: JSON.stringify({
        currency,
        amount,
        paymentType,
        metadata
      } as CreateSessionRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const session: CheckoutSession = await response.json();
    console.log('Created session:', session);
    return session;
  } catch (error: any) {
    console.error('Error in createCheckoutSession:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

export const redirectToCheckout = async (session: CheckoutSession): Promise<void> => {
  console.log('Redirecting to checkout:', session);
  if (session.url) {
    window.location.href = session.url;
  } else {
    throw new Error('No checkout URL provided');
  }
};

export const getSessionStatus = async (sessionId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/stripe/session-status?session_id=${sessionId}`);
    const data = await response.json();
    return data.isSuccess;
  } catch (error) {
    return false;
  }
};
