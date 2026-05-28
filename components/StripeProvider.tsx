import { StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/api/payments';

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NativeStripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.instasalud.app"
      urlScheme="instasalud"
    >
      {children}
    </NativeStripeProvider>
  );
}
