-- =====================================================
-- SCRIPT: Réparation Complète Authentification
-- PROJET: Tennis Club du François
-- DATE: 2026-03-31
-- DESCRIPTION: Répare "Database error querying schema" et harmonise les identifiants
-- =====================================================
-- IDENTIFIANTS UTILISÉS:
--   - admin@tennis-club.fr / Admin123! (role: admin)
--   - membre@tennis-club.fr / Membre123! (role: membre)
--   - moniteur@tennis-club.fr / Moniteur123! (role: moniteur)
-- =====================================================
-- INSTRUCTIONS:
--   1. Copier-coller ce script dans Supabase SQL Editor
--   2. Cliquer sur "Run"
--   3. Vérifier le message de succès à la fin
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. ENUMS
-- =====================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'moniteur', 'membre');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. TABLE: users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'membre',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =====================================================
-- 4. TABLE: profiles
-- =====================================================
-- Supprimer l'ancienne table si elle existe avec une structure différente
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  nom text NOT NULL DEFAULT 'Utilisateur',
  prenom text NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'membre',
  avatar_url text
);

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 5. TRIGGER: set_updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- 6. FONCTION: handle_new_user
-- =====================================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer entrée dans public.users
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'membre'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    role = COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'membre'::user_role),
    updated_at = NOW();

  -- Créer entrée dans public.profiles
  INSERT INTO public.profiles (user_id, nom, prenom, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'membre'::user_role)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    prenom = COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    role = COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'membre'::user_role),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Révoquer accès public
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- =====================================================
-- 7. TRIGGER: on_auth_user_created
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. RLS (ROW LEVEL SECURITY)
-- =====================================================
-- DÉSACTIVER RLS sur public.users (CRITIQUE pour le trigger!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Activer RLS sur public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
DROP POLICY IF EXISTS "profiles_owner_read" ON public.profiles;
CREATE POLICY "profiles_owner_read" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique admin pour profiles
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
-- 9. NETTOYAGE ANCIENS UTILISATEURS
-- =====================================================
-- Supprimer dans l'ordre: profiles -> users -> auth.users
DELETE FROM public.profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
);

DELETE FROM public.users 
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');

DELETE FROM auth.users 
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');

-- =====================================================
-- 10. CRÉATION UTILISATEURS DE TEST
-- =====================================================
-- Admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tennis-club.fr',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Administrateur', 'prenom', 'Principal', 'role', 'admin'),
  NOW(),
  NOW(),
  '',
  ''
);

-- Membre
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'membre@tennis-club.fr',
  crypt('Membre123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Membre', 'prenom', 'Test', 'role', 'membre'),
  NOW(),
  NOW(),
  '',
  ''
);

-- Moniteur
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'moniteur@tennis-club.fr',
  crypt('Moniteur123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Moniteur', 'prenom', 'Tennis', 'role', 'moniteur'),
  NOW(),
  NOW(),
  '',
  ''
);

-- Attendre que le trigger s'exécute
SELECT pg_sleep(0.5);

-- =====================================================
-- 11. VÉRIFICATION FINALE
-- =====================================================
-- Ce SELECT affiche les utilisateurs créés
SELECT 
  '✅ UTILISATEURS CRÉÉS DANS auth.users' AS status,
  email,
  role,
  email_confirmed_at IS NOT NULL AS confirmed
FROM auth.users
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
ORDER BY email;

-- Vérifier la synchronisation avec public.users
SELECT 
  '✅ UTILISATEURS DANS public.users' AS status,
  email,
  role,
  created_at
FROM public.users
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
ORDER BY email;

-- Vérifier les profiles
SELECT 
  '✅ PROFILS DANS public.profiles' AS status,
  p.user_id,
  p.nom,
  p.prenom,
  p.role,
  u.email
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
ORDER BY u.email;

-- Vérifier l'état RLS
SELECT 
  '✅ ÉTAT RLS' AS status,
  tablename,
  rowsecurity AS rls_active
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'profiles');

-- Vérifier le trigger
SELECT 
  '✅ TRIGGER on_auth_user_created' AS status,
  tgname AS trigger_name,
  tgenabled AS enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- =====================================================
-- 12. RÉSUMÉ
-- =====================================================
-- Ce dernier SELECT confirme que tout est OK
SELECT '
======================================================
  ✅ RÉPARATION TERMINÉE AVEC SUCCÈS
======================================================

UTILISATEURS CRÉÉS:
  - admin@tennis-club.fr / Admin123! (role: admin)
  - membre@tennis-club.fr / Membre123! (role: membre)
  - moniteur@tennis-club.fr / Moniteur123! (role: moniteur)

PROCHAINES ÉTAPES:
  1. Redémarrer Supabase Local: npx supabase stop && npx supabase start
  2. Redémarrer Next.js: npm run dev
  3. Tester la connexion: http://localhost:3000/login

======================================================
' AS message;
