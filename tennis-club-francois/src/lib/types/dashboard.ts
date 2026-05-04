/**
 * Types pour le Dashboard Admin
 * Types de réponse uniformes pour les Server Actions
 */

import type { ActionResult } from '@/lib/types/actions';

// ============================================================================
// TYPES DE DONNÉES
// ============================================================================

/**
 * Statistiques du dashboard
 */
export type DashboardStats = {
  totalMembres: number;
  totalReservations: number;
  courtsOccupes: number;
  courtsDisponibles: number;
  reservationsAujourdhui: number;
};

/**
 * Court de tennis avec état d'occupation
 */
export type CourtWithOccupation = {
  id: string;
  nom: string;
  type: string;
  disponible: boolean;
  eclairage: boolean;
  status: string;
  occupation?: {
    date_heure_debut: string;
    date_heure_fin: string;
    user?: {
      id: string;
      nom?: string | null;
      prenom?: string | null;
      email?: string | null;
    };
  };
};

/**
 * Réservation avec détails complets
 */
export type ReservationWithDetails = {
  id: string;
  court: {
    nom: string;
    type: string;
  };
  user: {
    nom: string | null;
    prenom: string | null;
    email: string | null;
  };
  date_heure_debut: string;
  date_heure_fin: string;
  status: string;
  notes?: string | null;
};

/**
 * Membre avec profil complet
 */
export type MemberWithProfile = {
  user: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone?: string | null;
  niveau_tennis?: string | null;
  statut_adhesion?: string | null;
  created: string;
};

/**
 * Données complètes du dashboard
 */
export type DashboardData = {
  stats: DashboardStats;
  courts: CourtWithOccupation[];
  dernieresReservations: ReservationWithDetails[];
  membresRecents: MemberWithProfile[];
};

// ============================================================================
// TYPES DE RÉPONSE DES SERVER ACTIONS
// ============================================================================

/**
 * Réponse pour getAdminDashboardData
 */
export type DashboardResponse = ActionResult<DashboardData>;

/**
 * Réponse pour getAllCourtsAction
 */
export type CourtsResponse = ActionResult<CourtWithOccupation[]>;

/**
 * Réponse pour getAllReservationsAction
 */
export type ReservationsResponse = ActionResult<ReservationWithDetails[]>;

/**
 * Réponse pour createReservationForUserAction
 */
export type CreateReservationResponse = ActionResult<{
  reservation: ReservationWithDetails;
}>;

/**
 * Réponse pour blockCourtAction
 */
export type BlockCourtResponse = ActionResult<void>;

/**
 * Réponse pour getMembersAction
 */
export type MembersResponse = ActionResult<{
  members: MemberWithProfile[];
  total: number;
}>;

/**
 * Réponse pour addMemberAction
 */
export type AddMemberResponse = ActionResult<{
  user: {
    id: string;
    email: string;
  };
}>;
