import { useState } from 'react';
import type { Doctor } from '@/types/doctor';
import type { BookingFormData, InsuranceVerificationResult } from '@/types/appointment';

interface BookingState {
  step: 0 | 1 | 2 | 3;
  doctor: Doctor | null;
  date: string;
  time: string;
  insuranceResult: InsuranceVerificationResult | null;
  arsId: string;
  planId: string;
  affiliateNumber: string;
  paymentMethod: 'card' | 'cash';
}

export function useBookingFlow() {
  const [state, setState] = useState<BookingState>({
    step: 0,
    doctor: null,
    date: '',
    time: '',
    insuranceResult: null,
    arsId: '',
    planId: '',
    affiliateNumber: '',
    paymentMethod: 'card',
  });

  function goToStep(step: BookingState['step']) {
    setState((s) => ({ ...s, step }));
  }

  function setDoctorInfo(doctor: Doctor, date: string, time: string) {
    setState((s) => ({ ...s, doctor, date, time, step: 1 }));
  }

  function setInsuranceInfo(
    result: InsuranceVerificationResult,
    arsId: string,
    planId: string,
    affiliateNumber: string
  ) {
    setState((s) => ({ ...s, insuranceResult: result, arsId, planId, affiliateNumber, step: 2 }));
  }

  function setPaymentMethod(method: 'card' | 'cash') {
    setState((s) => ({ ...s, paymentMethod: method }));
  }

  function reset() {
    setState({
      step: 0,
      doctor: null,
      date: '',
      time: '',
      insuranceResult: null,
      arsId: '',
      planId: '',
      affiliateNumber: '',
      paymentMethod: 'card',
    });
  }

  const copay = state.insuranceResult?.copay ?? state.doctor?.pricePerConsult ?? 0;

  return {
    ...state,
    copay,
    goToStep,
    setDoctorInfo,
    setInsuranceInfo,
    setPaymentMethod,
    reset,
  };
}
