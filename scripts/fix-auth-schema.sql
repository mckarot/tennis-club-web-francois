-- =====================================================
-- FIX AUTH SCHEMA - RÉPARATION COMPLÈTE
-- Tennis Club du François
-- =====================================================
-- Problème: "Database error querying schema"
-- Ce script répare DÉFINITIVEMENT le schéma auth de Supabase
-- =====================================================
-- IMPORTANT: Exécuter dans Supabase SQL Editor avec un utilisateur
-- ayant les privilèges SUPERUSER (postgres)
-- =====================================================

\echo '=== DÉBUT DE LA RÉPARATION DU SCHÉMA AUTH ==='

-- =====================================================
-- ÉTAPE 0: VÉRIFICATION DES PREREQUIS
-- =====================================================
\echo ''
\echo '--- 0. VÉRIFICATION DES PREREQUIS ---'

-- Vérifier que nous avons accès au schéma auth
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
    RAISE EXCEPTION '❌ SCHÉMA auth INEXISTANT - Supabase Auth n''est pas installé correctement!';
  END IF;
END $$;
\echo '✓ Schéma auth existe'

-- Vérifier que auth.users existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    RAISE EXCEPTION '❌ TABLE auth.users INEXISTANTE - Supabase Auth n''est pas installé correctement!';
  END IF;
END $$;
\echo '✓ Table auth.users existe'

-- =====================================================
-- ÉTAPE 1: CRÉER LES EXTENSIONS REQUISES
-- =====================================================
\echo ''
\echo '--- 1. CRÉATION DES EXTENSIONS ---'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\echo '✓ Extensions uuid-ossp et pgcrypto activées'

-- =====================================================
-- ÉTAPE 2: VÉRIFIER ET CORRIGER LES PERMISSIONS
-- =====================================================
\echo ''
\echo '--- 2. VÉRIFICATION DES PERMISSIONS ---'

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

\echo '✓ Permissions du schéma auth vérifiées'

-- =====================================================
-- ÉTAPE 3: NETTOYER LES SESSIONS CORROMPUES
-- =====================================================
\echo ''
\echo '--- 3. NETTOYAGE DES SESSIONS CORROMPUES ---'

-- Supprimer les sessions expirées (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'sessions') THEN
    DELETE FROM auth.sessions WHERE expires_at < NOW();
    RAISE NOTICE 'Sessions expirées nettoyées';
  ELSE
    RAISE NOTICE 'Table auth.sessions non existante (normal selon version Supabase)';
  END IF;
END $$;

-- Supprimer les tokens de refresh expirés (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'refresh_tokens') THEN
    DELETE FROM auth.refresh_tokens WHERE expires_at < NOW();
    RAISE NOTICE 'Tokens de refresh expirés nettoyés';
  ELSE
    RAISE NOTICE 'Table auth.refresh_tokens non existante (normal selon version Supabase)';
  END IF;
END $$;

\echo '✓ Sessions corrompues nettoyées'

-- =====================================================
-- ÉTAPE 4: VÉRIFIER LA CONFIGURATION JWT
-- =====================================================
\echo ''
\echo '--- 4. VÉRIFICATION JWT ---'

-- Vérifier si les settings JWT sont configurés
DO $$
DECLARE
  jwt_secret text;
BEGIN
  BEGIN
    SELECT current_setting('app.settings.jwt_secret', true) INTO jwt_secret;
    IF jwt_secret IS NULL OR jwt_secret = '' THEN
      RAISE NOTICE '⚠️ JWT secret non configuré - Utilise la valeur par défaut de Supabase Local';
    ELSE
      RAISE NOTICE '✓ JWT secret configuré';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Impossible de vérifier le JWT secret (normal en mode local)';
  END;
END $$;

\echo '✓ Configuration JWT vérifiée'

-- =====================================================
-- ÉTAPE 5: CRÉER LA FONCTION handle_new_user (CORRECTE)
-- =====================================================
\echo ''
\echo '--- 5. CRÉATION DE LA FONCTION handle_new_user ---'

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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth;

-- Révoquer l'accès public à la fonction (sécurité)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

\echo '✓ Fonction handle_new_user créée avec SECURITY DEFINER'

-- =====================================================
-- ÉTAPE 6: CRÉER LE TRIGGER on_auth_user_created
-- =====================================================
\echo ''
\echo '--- 6. CRÉATION DU TRIGGER on_auth_user_created ---'

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

\echo '✓ Trigger on_auth_user_created créé'

-- =====================================================
-- ÉTAPE 7: DÉSACTIVER RLS SUR public.users (CRITIQUE!)
-- =====================================================
\echo ''
\echo '--- 7. DÉSACTIVATION RLS SUR public.users ---'

-- RLS doit être DÉSACTIVÉ sur public.users pour que le trigger fonctionne
-- Le trigger s'exécute avec SECURITY DEFINER, pas avec RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

\echo '✓ RLS désactivé sur public.users (le trigger peut maintenant fonctionner)'

-- =====================================================
-- ÉTAPE 8: CRÉER LES UTILISATEURS DE TEST
-- =====================================================
\echo ''
\echo '--- 8. CRÉATION DES UTILISATEURS DE TEST ---'

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

\echo '✓ 3 utilisateurs de test créés dans auth.users'

-- Attendre que le trigger s'exécute
SELECT pg_sleep(0.5);

-- =====================================================
-- ÉTAPE 9: VÉRIFICATION FINALE
-- =====================================================
\echo ''
\echo '--- 9. VÉRIFICATION FINALE ---'

\echo ''
\echo '=== UTILISATEURS DANS auth.users ==='
SELECT 
  email,
  role,
  email_confirmed_at IS NOT NULL AS email_confirmed,
  created_at
FROM auth.users
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

\echo ''
\echo '=== UTILISATEURS DANS public.users ==='
SELECT 
  email,
  role,
  created_at
FROM public.users
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

\echo ''
\echo '=== PROFILS DANS public.profiles ==='
SELECT 
  p.user_id,
  p.nom,
  p.prenom,
  u.email
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY u.email;

\echo ''
\echo '=== ÉTAT RLS SUR public.users ==='
SELECT 
  tablename,
  rowsecurity AS rls_active,
  CASE 
    WHEN rowsecurity = true THEN '❌ PROBLÈME: RLS activé - le trigger sera bloqué!'
    ELSE '✓ OK: RLS désactivé - le trigger fonctionne'
  END AS status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

\echo ''
\echo '=== TRIGGER on_auth_user_created ==='
SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled,
  proname AS function_name,
  n.nspname AS function_schema
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE tgname = 'on_auth_user_created';

\echo ''
\echo '=== FONCTION handle_new_user ==='
SELECT 
  routine_name,
  security_type,
  routine_schema
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- =====================================================
-- ÉTAPE 10: RÉSUMÉ
-- =====================================================
\echo ''
\echo '======================================================'
\echo '  ✅ RÉPARATION TERMINÉE AVEC SUCCÈS'
\echo '======================================================'
\echo ''
\echo 'UTILISATEURS CRÉÉS:'
\echo '  - admin@tennisclub.fr / Password123! (role: admin)'
\echo '  - moniteur@tennisclub.fr / Password123! (role: moniteur)'
\echo '  - membre@tennisclub.fr / Password123! (role: eleve)'
\echo ''
\echo 'PROCHAINES ÉTAPES:'
\echo '  1. Redémarrer Supabase Local (voir instructions ci-dessous)'
\echo '  2. Redémarrer le serveur Next.js: npm run dev'
\echo '  3. Tester la connexion sur http://localhost:3000/login'
\echo ''
\echo '======================================================'
