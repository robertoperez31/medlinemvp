// Stripe integration omitted — payments handled in cash at clinic
// Add @stripe/stripe-react-native and configure when ready

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function confirmCashPayment(): Promise<PaymentResult> {
  return { success: true };
}
