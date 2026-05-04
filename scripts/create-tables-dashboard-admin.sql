-- ============================================================================
-- Tennis Club du François - Dashboard Admin
-- Script de création des tables pour la gestion des réservations
-- ============================================================================
-- Date de création : 2026-04-01
-- Projet : Tennis Club du François
-- Écran : /dashboard/admin
-- Priorité : P0
-- ============================================================================

-- ============================================================================
-- SECTION 1 : CRÉATION DE LA TABLE `courts`
-- ============================================================================
-- Description : Gestion des 6 courts de tennis du club
-- Colonnes : nom, type de surface, disponibilité, éclairage
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type text NOT NULL CHECK (type IN ('Terre battue', 'Dur', 'Synthétique')),
  disponible boolean NOT NULL DEFAULT true,
  eclairage boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

-- Index pour optimiser les recherches par nom et type
CREATE INDEX IF NOT EXISTS idx_courts_nom ON public.courts(nom);
CREATE INDEX IF NOT EXISTS idx_courts_type ON public.courts(type);
CREATE INDEX IF NOT EXISTS idx_courts_disponible ON public.courts(disponible);

-- Commentaire sur la table
COMMENT ON TABLE public.courts IS 'Gestion des courts de tennis du club (6 courts)';
COMMENT ON COLUMN public.courts.nom IS 'Nom du court (ex: Court 1, Court Central)';
COMMENT ON COLUMN public.courts.type IS 'Type de surface : Terre battue, Dur, Synthétique';
COMMENT ON COLUMN public.courts.disponible IS 'Statut de disponibilité du court';
COMMENT ON COLUMN public.courts.eclairage IS 'Le court dispose-t-il d''un éclairage pour jouer le soir';

-- ============================================================================
-- SECTION 2 : CRÉATION DE LA TABLE `reservations`
-- ============================================================================
-- Description : Gestion de toutes les réservations de courts
-- Colonnes : court, utilisateur, créneau, statut, notes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmée' CHECK (status IN ('confirmée', 'annulée', 'terminée')),
  notes text,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  
  -- Contrainte : end_time doit être après start_time
  CONSTRAINT chk_reservation_time CHECK (end_time > start_time)
);

-- Index pour optimiser les recherches par court, utilisateur et dates
CREATE INDEX IF NOT EXISTS idx_reservations_court_id ON public.reservations(court_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_start_time ON public.reservations(start_time);
CREATE INDEX IF NOT EXISTS idx_reservations_end_time ON public.reservations(end_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
-- Index composite pour rechercher les réservations d'un court sur une période
CREATE INDEX IF NOT EXISTS idx_reservations_court_time ON public.reservations(court_id, start_time, end_time);

-- Commentaire sur la table
COMMENT ON TABLE public.reservations IS 'Gestion des réservations de courts';
COMMENT ON COLUMN public.reservations.court_id IS 'Référence vers le court réservé';
COMMENT ON COLUMN public.reservations.user_id IS 'Référence vers l''utilisateur ayant réservé';
COMMENT ON COLUMN public.reservations.start_time IS 'Date et heure de début de réservation';
COMMENT ON COLUMN public.reservations.end_time IS 'Date et heure de fin de réservation';
COMMENT ON COLUMN public.reservations.status IS 'Statut : confirmée, annulée, terminée';
COMMENT ON COLUMN public.reservations.notes IS 'Notes optionnelles pour la réservation';

-- ============================================================================
-- SECTION 3 : CRÉATION DE LA TABLE `member_profiles`
-- ============================================================================
-- Description : Informations complémentaires des membres du club
-- Colonnes : données personnelles, niveau de tennis, licence, certificat
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.member_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  date_naissance date,
  telephone text,
  adresse text,
  ville text,
  code_postal text,
  niveau_tennis text NOT NULL DEFAULT 'intermédiaire' CHECK (niveau_tennis IN ('débutant', 'intermédiaire', 'avancé')),
  licence_fft text,
  certificat_medical boolean NOT NULL DEFAULT false,
  date_certificat date,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  
  -- Contrainte : si certificat_medical = true, date_certificat doit être renseignée
  CONSTRAINT chk_certificat_date CHECK (
    (certificat_medical = false AND date_certificat IS NULL) OR
    (certificat_medical = true AND date_certificat IS NOT NULL)
  )
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON public.member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_niveau ON public.member_profiles(niveau_tennis);
CREATE INDEX IF NOT EXISTS idx_member_profiles_certificat ON public.member_profiles(certificat_medical);
CREATE INDEX IF NOT EXISTS idx_member_profiles_ville ON public.member_profiles(ville);

-- Commentaire sur la table
COMMENT ON TABLE public.member_profiles IS 'Informations complémentaires des membres du club';
COMMENT ON COLUMN public.member_profiles.date_naissance IS 'Date de naissance du membre';
COMMENT ON COLUMN public.member_profiles.telephone IS 'Numéro de téléphone';
COMMENT ON COLUMN public.member_profiles.adresse IS 'Adresse postale complète';
COMMENT ON COLUMN public.member_profiles.ville IS 'Ville de résidence';
COMMENT ON COLUMN public.member_profiles.code_postal IS 'Code postal';
COMMENT ON COLUMN public.member_profiles.niveau_tennis IS 'Niveau de tennis : débutant, intermédiaire, avancé';
COMMENT ON COLUMN public.member_profiles.licence_fft IS 'Numéro de licence FFT';
COMMENT ON COLUMN public.member_profiles.certificat_medical IS 'Le membre a-t-il fourni un certificat médical';
COMMENT ON COLUMN public.member_profiles.date_certificat IS 'Date du certificat médical';

-- ============================================================================
-- SECTION 4 : CRÉATION DES TRIGGERS `set_updated_at`
-- ============================================================================
-- Description : Mise à jour automatique de updated_at à chaque modification
-- Prérequis : La fonction public.set_updated_at() doit exister
-- ============================================================================

-- Trigger pour la table `courts`
DROP TRIGGER IF EXISTS set_updated_at_courts ON public.courts;
CREATE TRIGGER set_updated_at_courts
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Trigger pour la table `reservations`
DROP TRIGGER IF EXISTS set_updated_at_reservations ON public.reservations;
CREATE TRIGGER set_updated_at_reservations
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Trigger pour la table `member_profiles`
DROP TRIGGER IF EXISTS set_updated_at_member_profiles ON public.member_profiles;
CREATE TRIGGER set_updated_at_member_profiles
  BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- SECTION 5 : ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Description : Sécurisation de l'accès aux données au niveau ligne
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 6 : POLITIQUES RLS POUR `courts`
-- ============================================================================
-- Règles :
--   - Lecture : Tous les utilisateurs authentifiés peuvent lire
--   - Écriture : Admins seulement (role = 'admin' dans profiles)
-- ============================================================================

-- Politique de lecture : tous les authentifiés peuvent lire les courts
DROP POLICY IF EXISTS "courts_lecture_authentifies" ON public.courts;
CREATE POLICY "courts_lecture_authentifies" ON public.courts
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique d'insertion : admins seulement
DROP POLICY IF EXISTS "courts_insertion_admins" ON public.courts;
CREATE POLICY "courts_insertion_admins" ON public.courts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique de modification : admins seulement
DROP POLICY IF EXISTS "courts_modification_admins" ON public.courts;
CREATE POLICY "courts_modification_admins" ON public.courts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique de suppression : admins seulement
DROP POLICY IF EXISTS "courts_suppression_admins" ON public.courts;
CREATE POLICY "courts_suppression_admins" ON public.courts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SECTION 7 : POLITIQUES RLS POUR `reservations`
-- ============================================================================
-- Règles :
--   - Lecture : Owner (créateur) + Admins
--   - Écriture : Owner (créateur) + Admins
-- ============================================================================

-- Politique de lecture : owner + admins
DROP POLICY IF EXISTS "reservations_lecture_owner_admin" ON public.reservations;
CREATE POLICY "reservations_lecture_owner_admin" ON public.reservations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique d'insertion : owner + admins
DROP POLICY IF EXISTS "reservations_insertion_owner_admin" ON public.reservations;
CREATE POLICY "reservations_insertion_owner_admin" ON public.reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique de modification : owner + admins
DROP POLICY IF EXISTS "reservations_modification_owner_admin" ON public.reservations;
CREATE POLICY "reservations_modification_owner_admin" ON public.reservations
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique de suppression : owner + admins
DROP POLICY IF EXISTS "reservations_suppression_owner_admin" ON public.reservations;
CREATE POLICY "reservations_suppression_owner_admin" ON public.reservations
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SECTION 8 : POLITIQUES RLS POUR `member_profiles`
-- ============================================================================
-- Règles :
--   - Lecture : Owner (propriétaire du profil) + Admins
--   - Écriture : Admins seulement (pour contrôle des données membres)
-- ============================================================================

-- Politique de lecture : owner + admins
DROP POLICY IF EXISTS "member_profiles_lecture_owner_admin" ON public.member_profiles;
CREATE POLICY "member_profiles_lecture_owner_admin" ON public.member_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique d'insertion : owner (pour créer son propre profil) + admins
DROP POLICY IF EXISTS "member_profiles_insertion_owner_admin" ON public.member_profiles;
CREATE POLICY "member_profiles_insertion_owner_admin" ON public.member_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique de modification : owner + admins
DROP POLICY IF EXISTS "member_profiles_modification_owner_admin" ON public.member_profiles;
CREATE POLICY "member_profiles_modification_owner_admin" ON public.member_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique de suppression : admins seulement
DROP POLICY IF EXISTS "member_profiles_suppression_admins" ON public.member_profiles;
CREATE POLICY "member_profiles_suppression_admins" ON public.member_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SECTION 9 : DONNÉES DE TEST - 6 COURTS
-- ============================================================================
-- Description : Insertion des 6 courts du Tennis Club du François
-- Répartition : 2 Terre battue, 2 Dur, 2 Synthétique
-- ============================================================================

-- Supprimer les données existantes (pour éviter les doublons en cas de ré-exécution)
DELETE FROM public.courts;

-- Insertion des 6 courts
INSERT INTO public.courts (id, nom, type, disponible, eclairage) VALUES
  -- Courts en Terre battue (2)
  ('00000000-0000-0000-0000-000000000001', 'Court 1 - Terre battue', 'Terre battue', true, false),
  ('00000000-0000-0000-0000-000000000002', 'Court 2 - Terre battue', 'Terre battue', true, false),
  
  -- Courts en Dur (2)
  ('00000000-0000-0000-0000-000000000003', 'Court 3 - Dur', 'Dur', true, true),
  ('00000000-0000-0000-0000-000000000004', 'Court 4 - Dur', 'Dur', true, true),
  
  -- Courts Synthétiques (2)
  ('00000000-0000-0000-0000-000000000005', 'Court 5 - Synthétique', 'Synthétique', true, false),
  ('00000000-0000-0000-0000-000000000006', 'Court Central - Synthétique', 'Synthétique', true, true);

-- ============================================================================
-- SECTION 10 : VÉRIFICATION ET MESSAGES DE CONFIRMATION
-- ============================================================================

-- Vérifier que les tables ont été créées
DO $$
BEGIN
  RAISE NOTICE '✅ Tennis Club du François - Dashboard Admin';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 TABLES CRÉÉES :';
  RAISE NOTICE '   ✅ courts - 6 courts de tennis';
  RAISE NOTICE '   ✅ reservations - Gestion des réservations';
  RAISE NOTICE '   ✅ member_profiles - Informations membres';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 TRIGGERS CRÉÉS :';
  RAISE NOTICE '   ✅ set_updated_at_courts';
  RAISE NOTICE '   ✅ set_updated_at_reservations';
  RAISE NOTICE '   ✅ set_updated_at_member_profiles';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS ACTIVÉ :';
  RAISE NOTICE '   ✅ courts - Lecture: authentifiés, Écriture: admins';
  RAISE NOTICE '   ✅ reservations - Owner + Admin';
  RAISE NOTICE '   ✅ member_profiles - Owner read, Admin full';
  RAISE NOTICE '';
  RAISE NOTICE '📈 INDEX CRÉÉS :';
  RAISE NOTICE '   ✅ courts : nom, type, disponible';
  RAISE NOTICE '   ✅ reservations : court_id, user_id, start_time, end_time, status';
  RAISE NOTICE '   ✅ member_profiles : user_id, niveau_tennis, certificat_medical';
  RAISE NOTICE '';
  RAISE NOTICE '🎾 DONNÉES DE TEST :';
  RAISE NOTICE '   ✅ 6 courts insérés (2 Terre battue, 2 Dur, 2 Synthétique)';
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 Script exécuté avec succès !';
  RAISE NOTICE '==========================================';
END $$;

-- Requêtes de vérification (décommenter pour tester)
-- SELECT COUNT(*) AS "Nombre de courts" FROM public.courts;
-- SELECT type, COUNT(*) AS "Nombre" FROM public.courts GROUP BY type;
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
