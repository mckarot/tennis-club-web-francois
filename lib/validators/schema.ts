import { z } from 'zod';

// ============================================================================
// ENUMS ZOD
// ============================================================================

export const roleSchema = z.enum(['admin', 'moniteur', 'eleve', 'guest']);

export const niveauTennisSchema = z.enum(['debutant', 'intermediaire', 'avance', 'pro']);

export const statutAdhesionSchema = z.enum(['actif', 'inactif', 'en_attente']);

export const typeAbonnementSchema = z.enum(['standard', 'premium', 'vip']);

export const typeSurfaceSchema = z.enum(['quick', 'terre_battue', 'dur']);

export const statutCourtSchema = z.enum(['disponible', 'occupe', 'maintenance']);

export const typeReservationSchema = z.enum(['membre', 'entrainement', 'tournoi', 'libre']);

export const statutReservationSchema = z.enum(['confirmee', 'en_attente', 'annulee']);

export const typeCoursSchema = z.enum(['particulier', 'groupe', 'stage', 'perfectionnement']);

export const niveauRequisSchema = z.enum(['tous', 'debutant', 'intermediaire', 'avance']);

export const statutInscriptionSchema = z.enum(['inscrit', 'en_attente', 'annule']);

export const typeNotificationSchema = z.enum(['reservation', 'annulation', 'cours', 'promo']);

export const canalNotificationSchema = z.enum(['email', 'push', 'sms']);

// ============================================================================
// SCHÉMAS DE VALIDATION
// ============================================================================

// -----------------------------------------------------------------------------
// users
// -----------------------------------------------------------------------------
export const userSchema = z.object({
  id: z.string().uuid('ID utilisateur invalide'),
  email: z.string().email('Adresse email invalide').max(255, 'Email trop long'),
  password_hash: z.string().min(1, 'Mot de passe requis'),
  role: roleSchema,
  created_at: z.date(),
  updated_at: z.date(),
});

export const newUserSchema = z.object({
  email: z.string().email('Adresse email invalide').max(255, 'Email trop long'),
  password_hash: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: roleSchema.optional().default('eleve'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Adresse email invalide').max(255, 'Email trop long').optional(),
  password_hash: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  role: roleSchema.optional(),
});

export type User = z.infer<typeof userSchema>;
export type NewUser = z.infer<typeof newUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// -----------------------------------------------------------------------------
// profiles
// -----------------------------------------------------------------------------
export const profileSchema = z.object({
  id: z.string().uuid('ID profil invalide'),
  user_id: z.string().uuid('ID utilisateur invalide'),
  nom: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
  telephone: z.string().max(20, 'Numéro de téléphone trop long').optional().nullable(),
  adresse: z.string().max(500, 'Adresse trop longue').optional().nullable(),
  code_postal: z.string().max(10, 'Code postal trop long').optional().nullable(),
  ville: z.string().max(100, 'Ville trop longue').optional().nullable(),
  date_naissance: z.date().optional().nullable(),
  photo_url: z.string().url('URL de photo invalide').optional().nullable(),
  bio: z.string().max(500, 'Bio trop longue').optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newProfileSchema = z.object({
  user_id: z.string().uuid('ID utilisateur invalide'),
  nom: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
  telephone: z.string().max(20, 'Numéro de téléphone trop long').optional(),
  adresse: z.string().max(500, 'Adresse trop longue').optional(),
  code_postal: z.string().max(10, 'Code postal trop long').optional(),
  ville: z.string().max(100, 'Ville trop longue').optional(),
  date_naissance: z.date().optional(),
  photo_url: z.string().url('URL de photo invalide').optional(),
  bio: z.string().max(500, 'Bio trop longue').optional(),
});

export const updateProfileSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100, 'Nom trop long').optional(),
  prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long').optional(),
  telephone: z.string().max(20).optional().nullable(),
  adresse: z.string().max(500).optional().nullable(),
  code_postal: z.string().max(10).optional().nullable(),
  ville: z.string().max(100).optional().nullable(),
  date_naissance: z.date().optional().nullable(),
  photo_url: z.string().url('URL de photo invalide').optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

export type Profile = z.infer<typeof profileSchema>;
export type NewProfile = z.infer<typeof newProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// -----------------------------------------------------------------------------
// member_profiles
// -----------------------------------------------------------------------------
export const memberProfileSchema = z.object({
  id: z.string().uuid('ID profil membre invalide'),
  user_id: z.string().uuid('ID utilisateur invalide'),
  niveau_tennis: niveauTennisSchema.default('debutant'),
  statut_adhesion: statutAdhesionSchema.default('en_attente'),
  type_abonnement: typeAbonnementSchema.default('standard'),
  date_inscription: z.date().optional().nullable(),
  heures_jouees_mois: z.number().int().nonnegative().default(0),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newMemberProfileSchema = z.object({
  user_id: z.string().uuid('ID utilisateur invalide'),
  niveau_tennis: niveauTennisSchema.optional().default('debutant'),
  statut_adhesion: statutAdhesionSchema.optional().default('en_attente'),
  type_abonnement: typeAbonnementSchema.optional().default('standard'),
  date_inscription: z.date().optional(),
  heures_jouees_mois: z.number().int().nonnegative().optional().default(0),
});

export const updateMemberProfileSchema = z.object({
  niveau_tennis: niveauTennisSchema.optional(),
  statut_adhesion: statutAdhesionSchema.optional(),
  type_abonnement: typeAbonnementSchema.optional(),
  heures_jouees_mois: z.number().int().nonnegative().optional(),
});

export type MemberProfile = z.infer<typeof memberProfileSchema>;
export type NewMemberProfile = z.infer<typeof newMemberProfileSchema>;
export type UpdateMemberProfile = z.infer<typeof updateMemberProfileSchema>;

// -----------------------------------------------------------------------------
// coach_profiles
// -----------------------------------------------------------------------------
export const coachProfileSchema = z.object({
  id: z.string().uuid('ID profil coach invalide'),
  user_id: z.string().uuid('ID utilisateur invalide'),
  certification: z.string().optional().nullable(),
  specialite: z.string().max(100, 'Spécialité trop longue').optional().nullable(),
  annees_experience: z.number().int().nonnegative().optional().nullable(),
  disponibilites: z.record(z.any()).optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newCoachProfileSchema = z.object({
  user_id: z.string().uuid('ID utilisateur invalide'),
  certification: z.string().optional(),
  specialite: z.string().max(100, 'Spécialité trop longue').optional(),
  annees_experience: z.number().int().nonnegative().optional(),
  disponibilites: z.record(z.any()).optional(),
});

export const updateCoachProfileSchema = z.object({
  certification: z.string().optional().nullable(),
  specialite: z.string().max(100).optional().nullable(),
  annees_experience: z.number().int().nonnegative().optional().nullable(),
  disponibilites: z.record(z.any()).optional().nullable(),
});

export type CoachProfile = z.infer<typeof coachProfileSchema>;
export type NewCoachProfile = z.infer<typeof newCoachProfileSchema>;
export type UpdateCoachProfile = z.infer<typeof updateCoachProfileSchema>;

// -----------------------------------------------------------------------------
// courts
// -----------------------------------------------------------------------------
export const courtSchema = z.object({
  id: z.string().uuid('ID court invalide'),
  nom: z.string().min(1, 'Nom du court requis').max(50, 'Nom du court trop long'),
  type_surface: typeSurfaceSchema.default('quick'),
  statut: statutCourtSchema.default('disponible'),
  eclaire: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newCourtSchema = z.object({
  nom: z.string().min(1, 'Nom du court requis').max(50, 'Nom du court trop long'),
  type_surface: typeSurfaceSchema.optional().default('quick'),
  statut: statutCourtSchema.optional().default('disponible'),
  eclaire: z.boolean().optional().default(false),
});

export const updateCourtSchema = z.object({
  nom: z.string().min(1).max(50).optional(),
  type_surface: typeSurfaceSchema.optional(),
  statut: statutCourtSchema.optional(),
  eclaire: z.boolean().optional(),
});

export type Court = z.infer<typeof courtSchema>;
export type NewCourt = z.infer<typeof newCourtSchema>;
export type UpdateCourt = z.infer<typeof updateCourtSchema>;

// -----------------------------------------------------------------------------
// reservations
// -----------------------------------------------------------------------------
export const reservationSchema = z.object({
  id: z.string().uuid('ID réservation invalide'),
  court_id: z.string().uuid('ID court invalide'),
  user_id: z.string().uuid('ID utilisateur invalide'),
  date_heure_debut: z.date(),
  date_heure_fin: z.date(),
  type_reservation: typeReservationSchema.default('membre'),
  statut: statutReservationSchema.default('en_attente'),
  notes: z.string().max(500, 'Notes trop longues').optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newReservationSchema = z
  .object({
    court_id: z.string().uuid('ID court invalide'),
    user_id: z.string().uuid('ID utilisateur invalide'),
    date_heure_debut: z.date().refine((date) => date > new Date(), {
      message: 'La date de début doit être dans le futur',
    }),
    date_heure_fin: z.date(),
    type_reservation: typeReservationSchema.optional().default('membre'),
    statut: statutReservationSchema.optional().default('en_attente'),
    notes: z.string().max(500, 'Notes trop longues').optional(),
  })
  .refine((data) => data.date_heure_fin > data.date_heure_debut, {
    message: 'La date de fin doit être après la date de début',
    path: ['date_heure_fin'],
  });

export const updateReservationSchema = z.object({
  court_id: z.string().uuid('ID court invalide').optional(),
  user_id: z.string().uuid('ID utilisateur invalide').optional(),
  date_heure_debut: z.date().optional(),
  date_heure_fin: z.date().optional(),
  type_reservation: typeReservationSchema.optional(),
  statut: statutReservationSchema.optional(),
  notes: z.string().max(500).optional().nullable(),
});

export type Reservation = z.infer<typeof reservationSchema>;
export type NewReservation = z.infer<typeof newReservationSchema>;
export type UpdateReservation = z.infer<typeof updateReservationSchema>;

// -----------------------------------------------------------------------------
// reservation_participants
// -----------------------------------------------------------------------------
export const reservationParticipantSchema = z.object({
  id: z.string().uuid('ID participant invalide'),
  reservation_id: z.string().uuid('ID réservation invalide'),
  user_id: z.string().uuid('ID utilisateur invalide'),
  created_at: z.date(),
});

export const newReservationParticipantSchema = z.object({
  reservation_id: z.string().uuid('ID réservation invalide'),
  user_id: z.string().uuid('ID utilisateur invalide'),
});

export type ReservationParticipant = z.infer<typeof reservationParticipantSchema>;
export type NewReservationParticipant = z.infer<typeof newReservationParticipantSchema>;

// -----------------------------------------------------------------------------
// cours
// -----------------------------------------------------------------------------
export const coursSchema = z.object({
  id: z.string().uuid('ID cours invalide'),
  moniteur_id: z.string().uuid('ID moniteur invalide'),
  court_id: z.string().uuid('ID court invalide'),
  titre: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  description: z.string().max(1000, 'Description trop longue').optional().nullable(),
  date_heure_debut: z.date(),
  date_heure_fin: z.date(),
  type_cours: typeCoursSchema,
  niveau_requis: niveauRequisSchema.default('tous'),
  capacite_max: z.number().int().min(1).max(20).default(1),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newCoursSchema = z
  .object({
    moniteur_id: z.string().uuid('ID moniteur invalide'),
    court_id: z.string().uuid('ID court invalide'),
    titre: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
    description: z.string().max(1000, 'Description trop longue').optional(),
    date_heure_debut: z.date().refine((date) => date > new Date(), {
      message: 'La date de début doit être dans le futur',
    }),
    date_heure_fin: z.date(),
    type_cours: typeCoursSchema,
    niveau_requis: niveauRequisSchema.optional().default('tous'),
    capacite_max: z.number().int().min(1).max(20).optional().default(1),
  })
  .refine((data) => data.date_heure_fin > data.date_heure_debut, {
    message: 'La date de fin doit être après la date de début',
    path: ['date_heure_fin'],
  });

export const updateCoursSchema = z.object({
  moniteur_id: z.string().uuid('ID moniteur invalide').optional(),
  court_id: z.string().uuid('ID court invalide').optional(),
  titre: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  date_heure_debut: z.date().optional(),
  date_heure_fin: z.date().optional(),
  type_cours: typeCoursSchema.optional(),
  niveau_requis: niveauRequisSchema.optional(),
  capacite_max: z.number().int().min(1).max(20).optional(),
});

export type Cours = z.infer<typeof coursSchema>;
export type NewCours = z.infer<typeof newCoursSchema>;
export type UpdateCours = z.infer<typeof updateCoursSchema>;

// -----------------------------------------------------------------------------
// cours_inscriptions
// -----------------------------------------------------------------------------
export const coursInscriptionSchema = z.object({
  id: z.string().uuid('ID inscription invalide'),
  cours_id: z.string().uuid('ID cours invalide'),
  eleve_id: z.string().uuid('ID élève invalide'),
  statut: statutInscriptionSchema.default('inscrit'),
  created_at: z.date(),
});

export const newCoursInscriptionSchema = z.object({
  cours_id: z.string().uuid('ID cours invalide'),
  eleve_id: z.string().uuid('ID élève invalide'),
  statut: statutInscriptionSchema.optional().default('inscrit'),
});

export const updateCoursInscriptionSchema = z.object({
  statut: statutInscriptionSchema.optional(),
});

export type CoursInscription = z.infer<typeof coursInscriptionSchema>;
export type NewCoursInscription = z.infer<typeof newCoursInscriptionSchema>;
export type UpdateCoursInscription = z.infer<typeof updateCoursInscriptionSchema>;

// -----------------------------------------------------------------------------
// club_settings
// -----------------------------------------------------------------------------
export const clubSettingSchema = z.object({
  id: z.string().uuid('ID paramètre invalide'),
  nom_club: z.string().min(1, 'Nom du club requis').max(200, 'Nom du club trop long'),
  description: z.string().optional().nullable(),
  tarif_standard: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Tarif invalide').default('45.00'),
  tarif_premium: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Tarif invalide').default('35.00'),
  horaire_ouverture_lundi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horaire invalide').default('07:00'),
  horaire_fermeture_lundi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horaire invalide').default('22:00'),
  horaire_ouverture_samedi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horaire invalide').default('08:00'),
  horaire_fermeture_samedi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horaire invalide').default('20:00'),
  horaire_ouverture_dimanche: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horaire invalide').default('09:00'),
  horaire_fermeture_dimanche: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horaire invalide').default('18:00'),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newClubSettingSchema = z.object({
  nom_club: z.string().min(1, 'Nom du club requis').max(200, 'Nom du club trop long'),
  description: z.string().optional(),
  tarif_standard: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Tarif invalide').optional().default('45.00'),
  tarif_premium: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Tarif invalide').optional().default('35.00'),
  horaire_ouverture_lundi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('07:00'),
  horaire_fermeture_lundi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('22:00'),
  horaire_ouverture_samedi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('08:00'),
  horaire_fermeture_samedi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('20:00'),
  horaire_ouverture_dimanche: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('09:00'),
  horaire_fermeture_dimanche: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('18:00'),
});

export const updateClubSettingSchema = z.object({
  nom_club: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  tarif_standard: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  tarif_premium: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  horaire_ouverture_lundi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  horaire_fermeture_lundi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  horaire_ouverture_samedi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  horaire_fermeture_samedi: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  horaire_ouverture_dimanche: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  horaire_fermeture_dimanche: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

export type ClubSetting = z.infer<typeof clubSettingSchema>;
export type NewClubSetting = z.infer<typeof newClubSettingSchema>;
export type UpdateClubSetting = z.infer<typeof updateClubSettingSchema>;

// -----------------------------------------------------------------------------
// notifications
// -----------------------------------------------------------------------------
export const notificationSchema = z.object({
  id: z.string().uuid('ID notification invalide'),
  user_id: z.string().uuid('ID utilisateur invalide'),
  type_notification: typeNotificationSchema,
  canal: canalNotificationSchema,
  active: z.boolean().default(true),
  created_at: z.date(),
});

export const newNotificationSchema = z.object({
  user_id: z.string().uuid('ID utilisateur invalide'),
  type_notification: typeNotificationSchema,
  canal: canalNotificationSchema,
  active: z.boolean().optional().default(true),
});

export const updateNotificationSchema = z.object({
  type_notification: typeNotificationSchema.optional(),
  canal: canalNotificationSchema.optional(),
  active: z.boolean().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type NewNotification = z.infer<typeof newNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;

// ============================================================================
// SCHÉMAS DE FORMULAIRES (COMPOSÉS)
// ============================================================================

// Formulaire de connexion
export const loginFormSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Mot de passe trop court'),
});

export type LoginForm = z.infer<typeof loginFormSchema>;

// Formulaire d'inscription membre
export const inscriptionMembreSchema = z
  .object({
    nom: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
    prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
    email: z.string().email('Adresse email invalide'),
    telephone: z.string().max(20).optional(),
    date_naissance: z.date().optional(),
    niveau_tennis: niveauTennisSchema.optional().default('debutant'),
    password: z.string().min(8, 'Mot de passe trop court (min 8 caractères)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type InscriptionMembre = z.infer<typeof inscriptionMembreSchema>;

// Formulaire de réservation de court
export const reservationFormSchema = z
  .object({
    court_id: z.string().uuid('Court invalide'),
    date_heure_debut: z.date().refine((date) => date > new Date(), {
      message: 'La date doit être dans le futur',
    }),
    date_heure_fin: z.date(),
    type_reservation: typeReservationSchema,
    notes: z.string().max(500).optional(),
    participant_ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => data.date_heure_fin > data.date_heure_debut, {
    message: 'L\'heure de fin doit être après l\'heure de début',
    path: ['date_heure_fin'],
  });

export type ReservationForm = z.infer<typeof reservationFormSchema>;

// Formulaire de création de cours
export const coursFormSchema = z
  .object({
    court_id: z.string().uuid('Court invalide'),
    titre: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
    description: z.string().max(1000).optional(),
    date_heure_debut: z.date().refine((date) => date > new Date(), {
      message: 'La date doit être dans le futur',
    }),
    date_heure_fin: z.date(),
    type_cours: typeCoursSchema,
    niveau_requis: niveauRequisSchema.optional().default('tous'),
    capacite_max: z.number().int().min(1).max(20).optional().default(1),
    eleve_ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => data.date_heure_fin > data.date_heure_debut, {
    message: 'L\'heure de fin doit être après l\'heure de début',
    path: ['date_heure_fin'],
  });

export type CoursForm = z.infer<typeof coursFormSchema>;

// Formulaire de modification de profil
export const profilFormSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
  email: z.string().email('Adresse email invalide'),
  telephone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  photo_url: z.string().url('URL de photo invalide').optional(),
});

export type ProfilForm = z.infer<typeof profilFormSchema>;

// Formulaire de préférences de notifications
export const notificationsPreferencesSchema = z.object({
  notifications_email: z.boolean().default(true),
  notifications_push: z.boolean().default(true),
  notifications_sms: z.boolean().default(false),
});

export type NotificationsPreferences = z.infer<typeof notificationsPreferencesSchema>;

// ============================================================================
// EXPORTS UTILES
// ============================================================================

// Schéma pour la sélection de toutes les tables
export const tableSchemas = {
  users: userSchema,
  profiles: profileSchema,
  member_profiles: memberProfileSchema,
  coach_profiles: coachProfileSchema,
  courts: courtSchema,
  reservations: reservationSchema,
  reservation_participants: reservationParticipantSchema,
  cours: coursSchema,
  cours_inscriptions: coursInscriptionSchema,
  club_settings: clubSettingSchema,
  notifications: notificationSchema,
};
