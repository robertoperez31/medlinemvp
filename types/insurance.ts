export interface ARSProvider {
  id: string;
  name: string;
  logo?: string;
  color: string;
  plans: ARSPlan[];
}

export interface ARSPlan {
  id: string;
  name: string;
  arsId: string;
  coveragePercent: number;
  maxCoverage: number;
  specialtyCoverage: Record<string, number>;
}

export interface InsuranceCard {
  arsId: string;
  planId: string;
  affiliateNumber: string;
  holderName: string;
  expiryDate?: string;
}

export interface Document {
  id: number;
  name: string;
  type: 'file' | 'scan' | 'lab' | 'prescription';
  category?: DocumentCategory;
  localUri?: string;
  remoteUrl?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
  syncedAt?: string;
  createdAt: string;
}

export type DocumentCategory =
  | 'sangre'
  | 'radiografia'
  | 'ekg'
  | 'ecografia'
  | 'prescripcion'
  | 'vacuna'
  | 'otro';

export interface DocumentFilter {
  category?: DocumentCategory;
  type?: Document['type'];
  search?: string;
}
