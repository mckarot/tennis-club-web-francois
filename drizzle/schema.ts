import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  time,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const roleEnum = pgEnum('role', ['admin', 'moniteur', 'eleve', 'guest']);

export const niveauTennisEnum = pgEnum('niveau_tennis', [
  'debutant',
  'intermediaire',
  'avance',
  'pro',
]);

export const statutAdhesionEnum = pgEnum('statut_adhesion', [
  'actif',
  'inactif',
  'en_attente',
]);

export const typeAbonnementEnum = pgEnum('type_abonnement', [
  'standard',
  'premium',
  'vip',
]);

export const typeSurfaceEnum = pgEnum('type_surface', [
  'quick',
  'terre_battue',
  'dur',
]);

export const statutCourtEnum = pgEnum('statut_court', [
  'disponible',
  'occupe',
  'maintenance',
]);

export const typeReservationEnum = pgEnum('type_reservation', [
  'membre',
  'entrainement',
  'tournoi',
  'libre',
]);

export const statutReservationEnum = pgEnum('statut_reservation', [
  'confirmee',
  'en_attente',
  'annulee',
]);

export const typeCoursEnum = pgEnum('type_cours', [
  'particulier',
  'groupe',
  'stage',
  'perfectionnement',
]);

export const niveauRequisEnum = pgEnum('niveau_requis', [
  'tous',
  'debutant',
  'intermediaire',
  'avance',
]);

export const statutInscriptionEnum = pgEnum('statut_inscription', [
  'inscrit',
  'en_attente',
  'annule',
]);

export const typeNotificationEnum = pgEnum('type_notification', [
  'reservation',
  'annulation',
  'cours',
  'promo',
]);

export const canalNotificationEnum = pgEnum('canal_notification', [
  'email',
  'push',
  'sms',
]);

// ============================================================================
// TABLES
// ============================================================================

// -----------------------------------------------------------------------------
// users - Table centrale d'authentification
// -----------------------------------------------------------------------------
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password_hash: varchar('password_hash', { length: 255 }).notNull(),
    role: roleEnum('role').notNull().default('eleve'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_users_email: index('idx_users_email').on(table.email),
    idx_users_role: index('idx_users_role').on(table.role),
  })
);

// -----------------------------------------------------------------------------
// profiles - Informations complémentaires des utilisateurs
// -----------------------------------------------------------------------------
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    nom: varchar('nom', { length: 100 }).notNull(),
    prenom: varchar('prenom', { length: 100 }).notNull(),
    telephone: varchar('telephone', { length: 20 }),
    adresse: text('adresse'),
    code_postal: varchar('code_postal', { length: 10 }),
    ville: varchar('ville', { length: 100 }),
    date_naissance: date('date_naissance'),
    photo_url: text('photo_url'),
    bio: text('bio'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_profiles_user_id: index('idx_profiles_user_id').on(table.user_id),
    idx_profiles_nom: index('idx_profiles_nom').on(table.nom),
  })
);

// -----------------------------------------------------------------------------
// member_profiles - Spécifique aux membres/élèves du club
// -----------------------------------------------------------------------------
export const memberProfiles = pgTable(
  'member_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    niveau_tennis: niveauTennisEnum('niveau_tennis').default('debutant'),
    statut_adhesion: statutAdhesionEnum('statut_adhesion').default('en_attente').notNull(),
    type_abonnement: typeAbonnementEnum('type_abonnement').default('standard'),
    date_inscription: date('date_inscription').defaultNow(),
    heures_jouees_mois: integer('heures_jouees_mois').default(0),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_member_profiles_user_id: index('idx_member_profiles_user_id').on(table.user_id),
    idx_member_profiles_statut: index('idx_member_profiles_statut').on(table.statut_adhesion),
    idx_member_profiles_niveau: index('idx_member_profiles_niveau').on(table.niveau_tennis),
  })
);

// -----------------------------------------------------------------------------
// coach_profiles - Spécifique aux moniteurs/coachs
// -----------------------------------------------------------------------------
export const coachProfiles = pgTable(
  'coach_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    certification: text('certification'),
    specialite: varchar('specialite', { length: 100 }),
    annees_experience: integer('annees_experience'),
    disponibilites: jsonb('disponibilites'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_coach_profiles_user_id: index('idx_coach_profiles_user_id').on(table.user_id),
    idx_coach_profiles_specialite: index('idx_coach_profiles_specialite').on(table.specialite),
  })
);

// -----------------------------------------------------------------------------
// courts - Les courts de tennis disponibles
// -----------------------------------------------------------------------------
export const courts = pgTable(
  'courts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nom: varchar('nom', { length: 50 }).notNull(),
    type_surface: typeSurfaceEnum('type_surface').notNull().default('quick'),
    statut: statutCourtEnum('statut_court').notNull().default('disponible'),
    eclaire: boolean('eclaire').default(false),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_courts_statut: index('idx_courts_statut').on(table.statut),
    idx_courts_surface: index('idx_courts_surface').on(table.type_surface),
  })
);

// -----------------------------------------------------------------------------
// reservations - Les réservations de courts
// -----------------------------------------------------------------------------
export const reservations = pgTable(
  'reservations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    court_id: uuid('court_id')
      .notNull()
      .references(() => courts.id, { onDelete: 'restrict' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date_heure_debut: timestamp('date_heure_debut', { withTimezone: true }).notNull(),
    date_heure_fin: timestamp('date_heure_fin', { withTimezone: true }).notNull(),
    type_reservation: typeReservationEnum('type_reservation').notNull().default('membre'),
    statut: statutReservationEnum('statut_reservation').notNull().default('en_attente'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_reservations_court_id: index('idx_reservations_court_id').on(table.court_id),
    idx_reservations_user_id: index('idx_reservations_user_id').on(table.user_id),
    idx_reservations_date_debut: index('idx_reservations_date_debut').on(table.date_heure_debut),
    idx_reservations_statut: index('idx_reservations_statut').on(table.statut),
    idx_reservations_court_date: index('idx_reservations_court_date').on(
      table.court_id,
      table.date_heure_debut
    ),
  })
);

// -----------------------------------------------------------------------------
// reservation_participants - Participants aux réservations multi-joueurs
// -----------------------------------------------------------------------------
export const reservationParticipants = pgTable(
  'reservation_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservation_id: uuid('reservation_id')
      .notNull()
      .references(() => reservations.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_reservation_participants_reservation_id: index('idx_reservation_participants_reservation_id').on(
      table.reservation_id
    ),
    idx_reservation_participants_user_id: index('idx_reservation_participants_user_id').on(
      table.user_id
    ),
    idx_reservation_participants_unique: index('idx_reservation_participants_unique').on(
      table.reservation_id,
      table.user_id
    ),
  })
);

// -----------------------------------------------------------------------------
// cours - Les cours/leçons dispensés par les moniteurs
// -----------------------------------------------------------------------------
export const cours = pgTable(
  'cours',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moniteur_id: uuid('moniteur_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    court_id: uuid('court_id')
      .notNull()
      .references(() => courts.id, { onDelete: 'restrict' }),
    titre: varchar('titre', { length: 200 }).notNull(),
    description: text('description'),
    date_heure_debut: timestamp('date_heure_debut', { withTimezone: true }).notNull(),
    date_heure_fin: timestamp('date_heure_fin', { withTimezone: true }).notNull(),
    type_cours: typeCoursEnum('type_cours').notNull(),
    niveau_requis: niveauRequisEnum('niveau_requis').default('tous'),
    capacite_max: integer('capacite_max').default(1),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_cours_moniteur_id: index('idx_cours_moniteur_id').on(table.moniteur_id),
    idx_cours_court_id: index('idx_cours_court_id').on(table.court_id),
    idx_cours_date_debut: index('idx_cours_date_debut').on(table.date_heure_debut),
    idx_cours_type: index('idx_cours_type').on(table.type_cours),
    idx_cours_niveau: index('idx_cours_niveau').on(table.niveau_requis),
  })
);

// -----------------------------------------------------------------------------
// cours_inscriptions - Inscriptions des élèves aux cours
// -----------------------------------------------------------------------------
export const coursInscriptions = pgTable(
  'cours_inscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cours_id: uuid('cours_id')
      .notNull()
      .references(() => cours.id, { onDelete: 'cascade' }),
    eleve_id: uuid('eleve_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    statut: statutInscriptionEnum('statut_inscription').notNull().default('inscrit'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_cours_inscriptions_cours_id: index('idx_cours_inscriptions_cours_id').on(table.cours_id),
    idx_cours_inscriptions_eleve_id: index('idx_cours_inscriptions_eleve_id').on(table.eleve_id),
    idx_cours_inscriptions_unique: index('idx_cours_inscriptions_unique').on(
      table.cours_id,
      table.eleve_id
    ),
  })
);

// -----------------------------------------------------------------------------
// club_settings - Configuration globale du club
// -----------------------------------------------------------------------------
export const clubSettings = pgTable('club_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  nom_club: varchar('nom_club', { length: 200 }).notNull(),
  description: text('description'),
  tarif_standard: decimal('tarif_standard', { precision: 10, scale: 2 }).default('45.00'),
  tarif_premium: decimal('tarif_premium', { precision: 10, scale: 2 }).default('35.00'),
  horaire_ouverture_lundi: time('horaire_ouverture_lundi').default('07:00'),
  horaire_fermeture_lundi: time('horaire_fermeture_lundi').default('22:00'),
  horaire_ouverture_samedi: time('horaire_ouverture_samedi').default('08:00'),
  horaire_fermeture_samedi: time('horaire_fermeture_samedi').default('20:00'),
  horaire_ouverture_dimanche: time('horaire_ouverture_dimanche').default('09:00'),
  horaire_fermeture_dimanche: time('horaire_fermeture_dimanche').default('18:00'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// notifications - Préférences et historique des notifications
// -----------------------------------------------------------------------------
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type_notification: typeNotificationEnum('type_notification').notNull(),
    canal: canalNotificationEnum('canal').notNull(),
    active: boolean('active').default(true),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idx_notifications_user_id: index('idx_notifications_user_id').on(table.user_id),
    idx_notifications_type: index('idx_notifications_type').on(table.type_notification),
    idx_notifications_unique: index('idx_notifications_unique').on(
      table.user_id,
      table.type_notification,
      table.canal
    ),
  })
);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.user_id],
  }),
  memberProfile: one(memberProfiles, {
    fields: [users.id],
    references: [memberProfiles.user_id],
  }),
  coachProfile: one(coachProfiles, {
    fields: [users.id],
    references: [coachProfiles.user_id],
  }),
  reservations: many(reservations),
  reservationParticipants: many(reservationParticipants),
  coursDonnes: many(cours, { relationName: 'moniteur_cours' }),
  coursInscriptions: many(coursInscriptions, { relationName: 'eleve_inscriptions' }),
  notifications: many(notifications),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.user_id],
    references: [users.id],
  }),
}));

export const memberProfilesRelations = relations(memberProfiles, ({ one }) => ({
  user: one(users, {
    fields: [memberProfiles.user_id],
    references: [users.id],
  }),
}));

export const coachProfilesRelations = relations(coachProfiles, ({ one }) => ({
  user: one(users, {
    fields: [coachProfiles.user_id],
    references: [users.id],
  }),
}));

export const courtsRelations = relations(courts, ({ many }) => ({
  reservations: many(reservations),
  cours: many(cours),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  court: one(courts, {
    fields: [reservations.court_id],
    references: [courts.id],
  }),
  user: one(users, {
    fields: [reservations.user_id],
    references: [users.id],
  }),
  participants: many(reservationParticipants),
}));

export const reservationParticipantsRelations = relations(
  reservationParticipants,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationParticipants.reservation_id],
      references: [reservations.id],
    }),
    user: one(users, {
      fields: [reservationParticipants.user_id],
      references: [users.id],
    }),
  })
);

export const coursRelations = relations(cours, ({ one, many }) => ({
  moniteur: one(users, {
    fields: [cours.moniteur_id],
    references: [users.id],
    relationName: 'moniteur_cours',
  }),
  court: one(courts, {
    fields: [cours.court_id],
    references: [courts.id],
  }),
  inscriptions: many(coursInscriptions),
}));

export const coursInscriptionsRelations = relations(coursInscriptions, ({ one }) => ({
  cours: one(cours, {
    fields: [coursInscriptions.cours_id],
    references: [cours.id],
  }),
  eleve: one(users, {
    fields: [coursInscriptions.eleve_id],
    references: [users.id],
    relationName: 'eleve_inscriptions',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
}));

// ============================================================================
// TYPES TYPESCRIPT
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type NewMemberProfile = typeof memberProfiles.$inferInsert;

export type CoachProfile = typeof coachProfiles.$inferSelect;
export type NewCoachProfile = typeof coachProfiles.$inferInsert;

export type Court = typeof courts.$inferSelect;
export type NewCourt = typeof courts.$inferInsert;

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;

export type ReservationParticipant = typeof reservationParticipants.$inferSelect;
export type NewReservationParticipant = typeof reservationParticipants.$inferInsert;

export type Cours = typeof cours.$inferSelect;
export type NewCours = typeof cours.$inferInsert;

export type CoursInscription = typeof coursInscriptions.$inferSelect;
export type NewCoursInscription = typeof coursInscriptions.$inferInsert;

export type ClubSetting = typeof clubSettings.$inferSelect;
export type NewClubSetting = typeof clubSettings.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
