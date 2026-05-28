// ⚠️ The Stripe SECRET key (sk_test_) must NEVER appear here.
// It lives only on your backend server.
// Flow: app calls your backend → backend creates PaymentIntent with sk_ →
// returns { clientSecret } → app confirms with pk_ via stripe-react-native.

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
  'pk_test_51Tc8wfCQDi1Q2XXPFG4EwOjJrPNvkUeW2NgiSBm38xwaT4Ch0M4axCgZLPWmerq61LEHoV8x2kojXiWzrt7E6fJf001xnEhgaf';

export interface CreatePaymentIntentRequest {
  amountRD: number;
  currency?: string;
  description?: string;
  appointmentId: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

/**
 * Call YOUR backend to create a PaymentIntent.
 * Backend uses sk_test_ / sk_live_ to call Stripe API securely.
 *
 * Replace BACKEND_URL with your actual server URL when ready.
 */
export async function createPaymentIntent(
  req: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  if (!BACKEND_URL) {
    // Development mock — remove when backend is live
    await new Promise((r) => setTimeout(r, 800));
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_mock_${req.appointmentId}`,
      paymentIntentId: `pi_mock_${Date.now()}`,
    };
  }

  const res = await fetch(`${BACKEND_URL}/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: req.amountRD * 100, // centavos
      currency: req.currency ?? 'dop',
      description: req.description ?? 'Consulta médica InstaSalud',
      metadata: { appointment_id: req.appointmentId },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Error creando el pago');
  }

  return res.json();
}

export function isMockPayment(clientSecret: string): boolean {
  return clientSecret.includes('mock');
}
