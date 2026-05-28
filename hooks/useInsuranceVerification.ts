import { useState } from 'react';
import { verifyInsurance } from '@/lib/api/insurance';
import type { InsuranceVerificationResult } from '@/types/appointment';

interface VerificationState {
  result: InsuranceVerificationResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useInsuranceVerification() {
  const [state, setState] = useState<VerificationState>({
    result: null,
    isLoading: false,
    error: null,
  });

  async function verify(
    arsId: string,
    planId: string,
    affiliateNumber: string,
    specialtyId: string,
    doctorPrice: number
  ) {
    setState({ result: null, isLoading: true, error: null });
    try {
      const result = await verifyInsurance(arsId, planId, affiliateNumber, specialtyId, doctorPrice);
      setState({ result, isLoading: false, error: null });
      return result;
    } catch (err: any) {
      const message = err?.message ?? 'Error al verificar el seguro';
      setState({ result: null, isLoading: false, error: message });
      throw err;
    }
  }

  function reset() {
    setState({ result: null, isLoading: false, error: null });
  }

  return { ...state, verify, reset };
}
