import { StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native';
import React from 'react';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/api/payments';

export function StripeProvider({ children }: { children: React.ReactElement | React.ReactElement[] }) {
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
