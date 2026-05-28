export type AllergySeverity = 'baja' | 'moderada' | 'alta';
export type ConditionStatus = 'activa' | 'inactiva';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface MedicalCondition {
  id: number;
  name: string;
  status: ConditionStatus;
  diagnosisYear?: string;
  notes?: string;
  syncedAt?: string;
  createdAt: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  frequency: string;
  startDate?: string;
  instructions?: string;
  active?: boolean;
  syncedAt?: string;
  createdAt: string;
}

export interface Allergy {
  id: number;
  name: string;
  severity: AllergySeverity;
  reaction?: string;
  syncedAt?: string;
  createdAt: string;
}

export interface MedicalProfile {
  bloodType?: BloodType;
  weightKg?: number;
  heightCm?: number;
  primaryDoctor?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  usualBloodPressure?: string;
}

export interface AddConditionForm {
  name: string;
  status: ConditionStatus;
  diagnosisYear?: string;
  notes?: string;
}

export interface AddMedicationForm {
  name: string;
  dosage?: string;
  frequency: string;
  startDate?: string;
  instructions?: string;
}

export interface AddAllergyForm {
  name: string;
  severity: AllergySeverity;
  reaction?: string;
}
