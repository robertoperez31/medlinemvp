export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorPhoto?: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  copay?: number;
  confirmationNumber?: string;
  qrCode?: string;
  aiWaitTime?: number;
  notes?: string;
  syncedAt?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  period: 'morning' | 'afternoon' | 'evening';
}

export interface BookingStep {
  step: 1 | 2 | 3 | 4;
  label: string;
}

export interface BookingFormData {
  specialtyId: string;
  doctorId: string;
  date: string;
  time: string;
  arsId: string;
  plan: string;
  affiliateNumber: string;
  paymentMethod: 'saved_card' | 'new_card' | 'cash';
  cardToken?: string;
}

export interface InsuranceVerificationResult {
  verified: boolean;
  totalCost: number;
  coveragePercent: number;
  copay: number;
  arsName: string;
  planName: string;
  affiliateNumber: string;
  isBestCoverage?: boolean;
}

export interface WaitTimePrediction {
  minutes: number;
  confidence: number;
  label: 'Espera mínima' | 'Espera moderada' | 'Espera alta';
}
