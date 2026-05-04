-- =====================================================
-- SCRIPT: Correction Dashboard Admin - P0 Critique
-- PROJET: Tennis Club François
-- DATE: 2026-04-01
-- DESCRIPTION: Correction des problèmes critiques identifiés dans l'audit
-- =====================================================

-- =====================================================
-- 1. ACTIVER RLS SUR LES TABLES CRITIQUES
-- =====================================================

-- Activer RLS sur courts
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CORRIGER FK member_profiles.user_id
-- =====================================================

-- Supprimer l'ancienne FK (auth.users.id → public.users.id)
ALTER TABLE public.member_profiles 
  DROP CONSTRAINT IF EXISTS member_profiles_user_id_fkey;

-- Créer la nouvelle FK vers public.users
ALTER TABLE public.member_profiles 
  ADD CONSTRAINT member_profiles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;

-- =====================================================
-- 3. PEUPLER member_profiles (table vide)
-- =====================================================

-- Insérer les member_profiles manquants pour tous les membres
INSERT INTO public.member_profiles (user_id, niveau_tennis, licence_fft, certificat_medical, statut_adhesion)
SELECT 
  u.id,
  'intermédiaire'::tennis_level,
  false,
  false,
  'actif'::membership_status
FROM public.users u
LEFT JOIN public.member_profiles mp ON u.id = mp.user_id
WHERE u.role = 'membre' AND mp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- 4. CORRIGER LES TYPES DE COURTS (diversification)
-- =====================================================

-- Court 01 & 02 : Terre battue
UPDATE public.courts 
SET nom = 'Court 01', type = 'Terre battue' 
WHERE id = (SELECT id FROM public.courts ORDER BY nom LIMIT 1 OFFSET 0);

UPDATE public.courts 
SET nom = 'Court 02', type = 'Terre battue' 
WHERE id = (SELECT id FROM public.courts ORDER BY nom LIMIT 1 OFFSET 1);

-- Court 03 & 04 : Dur
UPDATE public.courts 
SET nom = 'Court 03', type = 'Dur' 
WHERE id = (SELECT id FROM public.courts ORDER BY nom LIMIT 1 OFFSET 2);

UPDATE public.courts 
SET nom = 'Court 04', type = 'Dur' 
WHERE id = (SELECT id FROM public.courts ORDER BY nom LIMIT 1 OFFSET 3);

-- Court 05 & 06 : Synthétique
UPDATE public.courts 
SET nom = 'Court 05', type = 'Synthétique' 
WHERE id = (SELECT id FROM public.courts ORDER BY nom LIMIT 1 OFFSET 4);

UPDATE public.courts 
SET nom = 'Court 06', type = 'Synthétique' 
WHERE id = (SELECT id FROM public.courts ORDER BY nom LIMIT 1 OFFSET 5);

-- =====================================================
-- 5. POLITIQUES RLS POUR LES TABLES ACTIVÉES
-- =====================================================

-- =====================================================
-- RLS: courts
-- =====================================================

-- Lecture publique pour utilisateurs authentifiés
DROP POLICY IF EXISTS "courts_public_read" ON public.courts;
CREATE POLICY "courts_public_read" ON public.courts
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin : toutes opérations
DROP POLICY IF EXISTS "courts_admin_all" ON public.courts;
CREATE POLICY "courts_admin_all" ON public.courts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS: reservations
-- =====================================================

-- Propriétaire : lecture
DROP POLICY IF EXISTS "reservations_owner_read" ON public.reservations;
CREATE POLICY "reservations_owner_read" ON public.reservations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Propriétaire : insertion
DROP POLICY IF EXISTS "reservations_owner_insert" ON public.reservations;
CREATE POLICY "reservations_owner_insert" ON public.reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Propriétaire : modification
DROP POLICY IF EXISTS "reservations_owner_update" ON public.reservations;
CREATE POLICY "reservations_owner_update" ON public.reservations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Propriétaire : suppression
DROP POLICY IF EXISTS "reservations_owner_delete" ON public.reservations;
CREATE POLICY "reservations_owner_delete" ON public.reservations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin : toutes opérations
DROP POLICY IF EXISTS "reservations_admin_all" ON public.reservations;
CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS: profiles
-- =====================================================

-- Propriétaire : lecture
DROP POLICY IF EXISTS "profiles_owner_read" ON public.profiles;
CREATE POLICY "profiles_owner_read" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Propriétaire : modification
DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Lecture publique pour utilisateurs authentifiés (annuaire)
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin : toutes opérations
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 6. VÉRIFICATIONS
-- =====================================================

-- Vérifier member_profiles
SELECT 'MEMBER_PROFILES: ' || COUNT(*) || ' enregistrements' AS resultat 
FROM public.member_profiles;

-- Vérifier courts (noms et types)
SELECT 'COURTS: ' || nom || ' - ' || type AS resultat 
FROM public.courts 
ORDER BY nom;

-- Vérifier RLS activé
SELECT 'RLS: ' || tablename || ' = ' || CASE WHEN rowsecurity THEN 'ACTIF' ELSE 'INACTIF' END AS resultat 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('courts', 'reservations', 'profiles', 'member_profiles')
ORDER BY tablename;

-- Vérifier politiques RLS
SELECT 'POLITIQUE: ' || schemaname || '.' || tablename || ' - ' || policyname AS resultat
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('courts', 'reservations', 'profiles')
ORDER BY tablename, policyname;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
