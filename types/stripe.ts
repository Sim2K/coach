export type StripeCurrency = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

export type PriceIds = {
  [K in StripeCurrency]: string;
};

export interface EnvironmentConfig {
  publicKey: string;
  priceIds: PriceIds;
  returnUrl: string;
  buttonText: string;
  webhookSecret: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface PaymentStatus {
  isSuccess: boolean;
  message: string;
  sessionId?: string;
}

export type StripeSessionMetadata = {
  currency: string;
  originalAmount: string;
  paymentType: 'afford' | 'worth';
};

export type StripeSessionResponse = {
  success: boolean;
  isSuccess: boolean;
  status: 'complete' | 'expired' | 'open';
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required';
  paymentIntentStatus: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled';
  customerEmail: string;
  amount: number;
  currency: string;
  metadata: StripeSessionMetadata;
};

export interface CreateSessionRequest {
  currency: StripeCurrency;
  amount: number;
  paymentType: 'afford' | 'worth';
}
