import { CreateSessionRequest, CheckoutSession } from '@/types/stripe';
import { getEnvironmentConfig } from '../config/environment';

export const createCheckoutSession = async (
  currency: string,
  amount: number,
  paymentType: 'afford' | 'worth'
): Promise<CheckoutSession> => {
  try {
    console.log('Creating checkout session:', { currency, amount, paymentType });
    
    const response = await fetch('/api/stripe/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency,
        amount,
        paymentType,
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
