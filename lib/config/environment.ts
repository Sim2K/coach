import { EnvironmentConfig } from '@/types/stripe';

const isTestEnvironment = (hostname: string): boolean => {
  return hostname === 'sim2k.sytes.net' || 
         hostname.includes('localhost') || 
         hostname.includes('127.0.0.1');
};

const isLiveEnvironment = (hostname: string): boolean => {
  return hostname === 'coach.veedence.com';
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: default to test unless explicitly set to production
    return process.env.NODE_ENV === 'production' ? config.live : config.test;
  }

  const hostname = window.location.hostname;
  
  if (isTestEnvironment(hostname)) {
    return config.test;
  }
  
  if (isLiveEnvironment(hostname)) {
    return config.live;
  }
  
  // Default to test environment if unknown
  return config.test;
};

const config = {
  test: {
    publicKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY!,
    priceIds: {
      USD: process.env.STRIPE_TEST_PRICE_COACH_USD!,
      GBP: process.env.STRIPE_TEST_PRICE_COACH_GBP!,
      EUR: process.env.STRIPE_TEST_PRICE_COACH_EUR!,
      CAD: process.env.STRIPE_TEST_PRICE_COACH_CAD!,
      AUD: process.env.STRIPE_TEST_PRICE_COACH_AUD!
    },
    returnUrl: 'http://sim2k.sytes.net/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}',
    buttonText: 'TEST Payment',
    webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET!
  },
  live: {
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    priceIds: {
      USD: process.env.STRIPE_PRICE_COACH_USD!,
      GBP: process.env.STRIPE_PRICE_COACH_GBP!,
      EUR: process.env.STRIPE_PRICE_COACH_EUR!,
      CAD: process.env.STRIPE_PRICE_COACH_CAD!,
      AUD: process.env.STRIPE_PRICE_COACH_AUD!
    },
    returnUrl: 'https://coach.veedence.com/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}',
    buttonText: 'Process Payment',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!
  }
} as const;
