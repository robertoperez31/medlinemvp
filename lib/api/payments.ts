export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function createPaymentIntent(
  amount: number,
  currency = 'dop'
): Promise<PaymentIntent> {
  // In production: call your backend to create a Stripe PaymentIntent
  // The backend uses the Stripe secret key and returns the client_secret
  await new Promise((r) => setTimeout(r, 300));

  return {
    id: `pi_mock_${Date.now()}`,
    clientSecret: `pi_mock_${Date.now()}_secret_mock`,
    amount,
    currency,
  };
}

export async function confirmPayment(
  clientSecret: string,
  paymentMethodToken?: string
): Promise<PaymentResult> {
  // In production: use @stripe/stripe-react-native's confirmPayment()
  await new Promise((r) => setTimeout(r, 1000));

  return {
    success: true,
    transactionId: `ch_mock_${Date.now()}`,
  };
}
