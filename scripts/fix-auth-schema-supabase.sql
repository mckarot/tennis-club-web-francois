-- =====================================================
-- FIX AUTH SCHEMA - RÉPARATION COMPLÈTE (VERSION SUPABASE)
-- Tennis Club du François
-- =====================================================
-- Problème: "Database error querying schema"
-- Ce script répare DÉFINITIVEMENT le schéma auth de Supabase
-- =====================================================
-- IMPORTANT: Exécuter dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- ÉTAPE 0: VÉRIFICATION DES PREREQUIS
-- =====================================================

-- Vérifier que nous avons accès au schéma auth
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
    RAISE EXCEPTION '❌ SCHÉMA auth INEXISTANT - Supabase Auth n''est pas installé correctement!';
  END IF;
END $$;

-- Vérifier que auth.users existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    RAISE EXCEPTION '❌ TABLE auth.users INEXISTANTE - Supabase Auth n''est pas installé correctement!';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 1: CRÉER LES EXTENSIONS REQUISES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ÉTAPE 2: VÉRIFIER ET CORRIGER LES PERMISSIONS
-- =====================================================

-- S'assurer que le schéma auth est accessible
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

-- S'assurer que public peut accéder à certaines fonctions auth
GRANT EXECUTE ON FUNCTION auth.uid TO postgres;
GRANT EXECUTE ON FUNCTION auth.uid TO anon;
GRANT EXECUTE ON FUNCTION auth.uid TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid TO service_role;

GRANT EXECUTE ON FUNCTION auth.role TO postgres;
GRANT EXECUTE ON FUNCTION auth.role TO anon;
GRANT EXECUTE ON FUNCTION auth.role TO authenticated;
GRANT EXECUTE ON FUNCTION auth.role TO service_role;

GRANT EXECUTE ON FUNCTION auth.jwt TO postgres;
GRANT EXECUTE ON FUNCTION auth.jwt TO anon;
GRANT EXECUTE ON FUNCTION auth.jwt TO authenticated;
GRANT EXECUTE ON FUNCTION auth.jwt TO service_role;

-- =====================================================
-- ÉTAPE 3: NETTOYER LES SESSIONS CORROMPUES
-- =====================================================

-- Supprimer les sessions expirées (si la table existe avec la bonne structure)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
      AND table_name = 'sessions' 
      AND column_name = 'expires_at'
  ) THEN
    DELETE FROM auth.sessions WHERE expires_at < NOW();
  END IF;
END $$;

-- Supprimer les tokens de refresh expirés (si la table existe avec la bonne structure)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
      AND table_name = 'refresh_tokens' 
      AND column_name = 'expires_at'
  ) THEN
    DELETE FROM auth.refresh_tokens WHERE expires_at < NOW();
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 4: CRÉER LA FONCTION handle_new_user (CORRECTE)
-- =====================================================

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Créer la nouvelle fonction avec SECURITY DEFINER correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans public.users
  -- Note: password_hash est laissé vide car l'authentification se fait via auth.users
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (
    NEW.id,
    NEW.email,
    '',  -- Vide - authentification via auth.users uniquement
    COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role)
  )
  ON CONFLICT (email) DO UPDATE SET
    id = NEW.id,
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth;

-- Révoquer l'accès public à la fonction (sécurité)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- =====================================================
-- ÉTAPE 5: CRÉER LE TRIGGER on_auth_user_created
-- =====================================================

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ÉTAPE 6: DÉSACTIVER RLS SUR public.users (CRITIQUE!)
-- =====================================================

-- RLS doit être DÉSACTIVÉ sur public.users pour que le trigger fonctionne
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 7: CRÉER LES UTILISATEURS DE TEST
-- =====================================================

-- Supprimer les anciens utilisateurs s'ils existent
DELETE FROM auth.users WHERE email IN (
  'admin@tennisclub.fr',
  'moniteur@tennisclub.fr',
  'membre@tennisclub.fr'
);

-- Attendre un court instant pour que le DELETE soit effectif
SELECT pg_sleep(0.1);

-- Créer l'admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Admin', 'prenom', 'Principal', 'role', 'admin'),
  NOW(),
  NOW(),
  '',
  ''
);

-- Créer le moniteur
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'moniteur@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Moniteur', 'prenom', 'Tennis', 'role', 'moniteur'),
  NOW(),
  NOW(),
  '',
  ''
);

-- Créer le membre
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'membre@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Membre', 'prenom', 'Club', 'role', 'eleve'),
  NOW(),
  NOW(),
  '',
  ''
);

-- Attendre que le trigger s'exécute
SELECT pg_sleep(0.5);

-- =====================================================
-- ÉTAPE 8: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier les utilisateurs dans auth.users
SELECT 
  'auth.users' as table_name,
  email,
  role,
  created_at
FROM auth.users
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

-- Vérifier les utilisateurs dans public.users
SELECT 
  'public.users' as table_name,
  email,
  role,
  created_at
FROM public.users
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

-- Vérifier les profils dans public.profiles
SELECT 
  'public.profiles' as table_name,
  p.user_id,
  p.nom,
  p.prenom,
  u.email
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY u.email;

-- Vérifier l'état RLS sur public.users
SELECT 
  tablename,
  rowsecurity AS rls_active,
  CASE 
    WHEN rowsecurity = true THEN '❌ PROBLÈME: RLS activé - le trigger sera bloqué!'
    ELSE '✓ OK: RLS désactivé - le trigger fonctionne'
  END AS status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- Vérifier le trigger
SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- UTILISATEURS CRÉÉS:
--   - admin@tennisclub.fr / Password123! (role: admin)
--   - moniteur@tennisclub.fr / Password123! (role: moniteur)
--   - membre@tennisclub.fr / Password123! (role: eleve)
--
-- PROCHAINES ÉTAPES:
--   1. Redémarrer Next.js: npm run dev
--   2. Tester la connexion sur http://localhost:3000/login
-- =====================================================
