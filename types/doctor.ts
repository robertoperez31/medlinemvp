export interface Doctor {
  id: string;
  name: string;
  photo?: string;
  specialty: string;
  specialtyId: string;
  hospital: string;
  hospitalId: string;
  rating: number;
  reviewCount: number;
  pricePerConsult: number;
  languages: string[];
  availableToday: boolean;
  avgWaitTimeMinutes: number;
  education?: string;
  experience?: number;
  bio?: string;
  nextAvailable?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  type: 'private' | 'public' | 'specialized';
  specialties: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}
