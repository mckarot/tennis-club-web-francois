/**
 * Types pour le système de planning et réservations
 * Tennis Club du François
 */

export type CourtType = 
  | 'Gazon Synthétique' 
  | 'Terre Battue' 
  | 'Résine Hard' 
  | 'Padel Panoramique';

export type Court = {
  id: number;
  nom: string;
  type: CourtType;
};

export type ReservationStatus = 'confirmee' | 'en_attente' | 'annulee' | 'maintenance';

export type Reservation = {
  id: string;
  court: number;
  user: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  notes?: string | null;
  user_details?: {
    nom: string | null;
    prenom: string | null;
    email: string | null;
  };
};

export type TimeSlot = {
  hour: number; // 7 to 21
  label: string; // "07:00"
};

export type PlanningDayData = {
  date: string; // ISO Date
  courts: Court[];
  reservations: Reservation[];
};
