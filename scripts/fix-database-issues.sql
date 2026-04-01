-- =====================================================
-- SCRIPT DE CORRECTION DES PROBLÈMES
-- Tennis Club du François
-- =====================================================
-- Ce script corrige :
-- 1. Les politiques RLS manquantes
-- 2. Le trigger handle_new_user (password_hash)
-- 3. Les incohérences de données
-- =====================================================
-- IMPORTANT : Exécuter dans l'ordre
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CORRECTION DU TRIGGER handle_new_user
-- =====================================================
\echo '--- 1. CORRECTION DU TRIGGER handle_new_user ---'

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans public.users
  -- password_hash est mis à '' car l'authentification se fait via auth.users
  -- Le champ encrypted_password de auth.users est crypté et non lisible
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (
    NEW.id,
    NEW.email,
    '',  -- Password hash vide - authentification via auth.users uniquement
    COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    role = COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role),
    updated_at = NOW();

  -- Créer une entrée dans profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    prenom = COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

\echo '✅ Trigger handle_new_user corrigé'

-- =====================================================
-- 2. CRÉATION DES POLITIQUES RLS
-- =====================================================
\echo '--- 2. CRÉATION DES POLITIQUES RLS ---'

-- 2.1 Table users
\echo '  - Table users...'
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_owner_read" ON public.users;
DROP POLICY IF EXISTS "users_owner_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_all" ON public.users;

CREATE POLICY "users_owner_read" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_owner_update" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_admin_all" ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.2 Table profiles
\echo '  - Table profiles...'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_owner_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_owner_read" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.3 Table member_profiles
\echo '  - Table member_profiles...'
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_profiles_owner_read" ON public.member_profiles;
DROP POLICY IF EXISTS "member_profiles_owner_update" ON public.member_profiles;
DROP POLICY IF EXISTS "member_profiles_admin_all" ON public.member_profiles;

CREATE POLICY "member_profiles_owner_read" ON public.member_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "member_profiles_owner_update" ON public.member_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "member_profiles_admin_all" ON public.member_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.4 Table coach_profiles
\echo '  - Table coach_profiles...'
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_profiles_owner_read" ON public.coach_profiles;
DROP POLICY IF EXISTS "coach_profiles_owner_update" ON public.coach_profiles;
DROP POLICY IF EXISTS "coach_profiles_admin_all" ON public.coach_profiles;

CREATE POLICY "coach_profiles_owner_read" ON public.coach_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "coach_profiles_owner_update" ON public.coach_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "coach_profiles_admin_all" ON public.coach_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.5 Table courts (lecture publique, écriture admin seulement)
\echo '  - Table courts...'
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courts_public_read" ON public.courts;
DROP POLICY IF EXISTS "courts_admin_all" ON public.courts;

CREATE POLICY "courts_public_read" ON public.courts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courts_admin_all" ON public.courts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.6 Table reservations
\echo '  - Table reservations...'
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservations_owner_read" ON public.reservations;
DROP POLICY IF EXISTS "reservations_owner_insert" ON public.reservations;
DROP POLICY IF EXISTS "reservations_owner_update" ON public.reservations;
DROP POLICY IF EXISTS "reservations_admin_all" ON public.reservations;

CREATE POLICY "reservations_owner_read" ON public.reservations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reservations_owner_insert" ON public.reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_owner_update" ON public.reservations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.7 Table reservation_participants
\echo '  - Table reservation_participants...'
ALTER TABLE public.reservation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_participants_owner_read" ON public.reservation_participants;
DROP POLICY IF EXISTS "reservation_participants_owner_insert" ON public.reservation_participants;
DROP POLICY IF EXISTS "reservation_participants_admin_all" ON public.reservation_participants;

CREATE POLICY "reservation_participants_owner_read" ON public.reservation_participants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reservation_participants_owner_insert" ON public.reservation_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservation_participants_admin_all" ON public.reservation_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.8 Table cours
\echo '  - Table cours...'
ALTER TABLE public.cours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cours_public_read" ON public.cours;
DROP POLICY IF EXISTS "cours_moniteur_insert" ON public.cours;
DROP POLICY IF EXISTS "cours_moniteur_update" ON public.cours;
DROP POLICY IF EXISTS "cours_admin_all" ON public.cours;

CREATE POLICY "cours_public_read" ON public.cours
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cours_moniteur_insert" ON public.cours
  FOR INSERT
  WITH CHECK (
    auth.uid() = moniteur_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "cours_moniteur_update" ON public.cours
  FOR UPDATE
  USING (
    auth.uid() = moniteur_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "cours_admin_all" ON public.cours
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.9 Table cours_inscriptions
\echo '  - Table cours_inscriptions...'
ALTER TABLE public.cours_inscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cours_inscriptions_owner_read" ON public.cours_inscriptions;
DROP POLICY IF EXISTS "cours_inscriptions_owner_insert" ON public.cours_inscriptions;
DROP POLICY IF EXISTS "cours_inscriptions_owner_update" ON public.cours_inscriptions;
DROP POLICY IF EXISTS "cours_inscriptions_admin_all" ON public.cours_inscriptions;

CREATE POLICY "cours_inscriptions_owner_read" ON public.cours_inscriptions
  FOR SELECT
  USING (auth.uid() = eleve_id);

CREATE POLICY "cours_inscriptions_owner_insert" ON public.cours_inscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = eleve_id);

CREATE POLICY "cours_inscriptions_owner_update" ON public.cours_inscriptions
  FOR UPDATE
  USING (auth.uid() = eleve_id);

CREATE POLICY "cours_inscriptions_admin_all" ON public.cours_inscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.10 Table club_settings
\echo '  - Table club_settings...'
ALTER TABLE public.club_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "club_settings_public_read" ON public.club_settings;
DROP POLICY IF EXISTS "club_settings_admin_all" ON public.club_settings;

CREATE POLICY "club_settings_public_read" ON public.club_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "club_settings_admin_all" ON public.club_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.11 Table notifications
\echo '  - Table notifications...'
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_owner_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_owner_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_owner_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;

CREATE POLICY "notifications_owner_read" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_owner_insert" ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_owner_update" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_admin_all" ON public.notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

\echo '✅ Politiques RLS créées'

-- =====================================================
-- 3. MISE À JOUR DES RÔLES DES UTILISATEURS EXISTANTS
-- =====================================================
\echo '--- 3. MISE À JOUR DES RÔLES DES UTILISATEURS ---'

-- S'assurer que les utilisateurs ont les bons rôles
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@tennisclub.fr' AND role != 'admin';

UPDATE public.users 
SET role = 'moniteur' 
WHERE email = 'moniteur@tennisclub.fr' AND role != 'moniteur';

UPDATE public.users 
SET role = 'eleve' 
WHERE email = 'membre@tennisclub.fr' AND role != 'eleve';

\echo '✅ Rôles des utilisateurs vérifiés'

-- =====================================================
-- 4. CRÉATION DES DONNÉES MANQUANTES
-- =====================================================
\echo '--- 4. CRÉATION DES DONNÉES MANQUANTES ---'

-- Créer les courts s'ils n'existent pas
INSERT INTO public.courts (nom, type_surface, statut_court, eclaire)
SELECT 'Court 01', 'quick'::type_surface, 'disponible'::statut_court, true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE nom = 'Court 01');

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire)
SELECT 'Court 02', 'quick'::type_surface, 'disponible'::statut_court, true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE nom = 'Court 02');

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire)
SELECT 'Court 03', 'quick'::type_surface, 'disponible'::statut_court, true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE nom = 'Court 03');

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire)
SELECT 'Court 04', 'quick'::type_surface, 'disponible'::statut_court, true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE nom = 'Court 04');

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire)
SELECT 'Court 05', 'quick'::type_surface, 'disponible'::statut_court, true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE nom = 'Court 05');

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire)
SELECT 'Court 06', 'quick'::type_surface, 'disponible'::statut_court, true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE nom = 'Court 06');

\echo '✅ Courts vérifiés'

-- Créer les member_profiles manquants pour les utilisateurs de type 'eleve'
INSERT INTO public.member_profiles (user_id, niveau_tennis, statut_adhesion, type_abonnement)
SELECT u.id, 'debutant'::niveau_tennis, 'en_attente'::statut_adhesion, 'standard'::type_abonnement
FROM public.users u
WHERE u.role = 'eleve'
  AND NOT EXISTS (
    SELECT 1 FROM public.member_profiles mp WHERE mp.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

\echo '✅ Member profiles vérifiés'

-- =====================================================
-- 5. VÉRIFICATION FINALE
-- =====================================================
\echo '--- 5. VÉRIFICATION FINALE ---'

\echo ''
\echo 'Résumé des corrections :'

SELECT 'TABLES' as element, COUNT(*) as count, '✅' as statut
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name NOT LIKE 'migrations%'
UNION ALL
SELECT 'ENUMS' as element, COUNT(*) as count, '✅' as statut
FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
UNION ALL
SELECT 'TRIGGERS' as element, COUNT(*) as count, '✅' as statut
FROM pg_trigger WHERE tgname = 'on_auth_user_created'
UNION ALL
SELECT 'POLITIQUES RLS' as element, COUNT(*) as count, '✅' as statut
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'USERS (auth)' as element, COUNT(*) as count, '✅' as statut
FROM auth.users
UNION ALL
SELECT 'USERS (public)' as element, COUNT(*) as count, '✅' as statut
FROM public.users
UNION ALL
SELECT 'PROFILES' as element, COUNT(*) as count, '✅' as statut
FROM public.profiles
UNION ALL
SELECT 'COURTS' as element, COUNT(*) as count, '✅' as statut
FROM public.courts;

\echo ''
\echo '======================================================'
\echo '  CORRECTIONS TERMINÉES AVEC SUCCÈS'
\echo '======================================================'
\echo ''
\echo 'INSTRUCTIONS :'
\echo '1. Redémarrer le serveur Next.js (npm run dev)'
\echo '2. Tester la connexion avec les 3 comptes :'
\echo '   - admin@tennisclub.fr / Password123!'
\echo '   - moniteur@tennisclub.fr / Password123!'
\echo '   - membre@tennisclub.fr / Password123!'
\echo '3. Vérifier que les redirections fonctionnent'
\echo ''

COMMIT;
