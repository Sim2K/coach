import { EnvironmentConfig } from '@/types/stripe';

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    priceIds: {
      USD: process.env.STRIPE_PRICE_COACH_USD!,
      GBP: process.env.STRIPE_PRICE_COACH_GBP!,
      EUR: process.env.STRIPE_PRICE_COACH_EUR!,
      CAD: process.env.STRIPE_PRICE_COACH_CAD!,
      AUD: process.env.STRIPE_PRICE_COACH_AUD!
    },
    returnUrl: 'https://coach.veedence.com/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}',
    buttonText: 'Make Payment',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!
  };
};
