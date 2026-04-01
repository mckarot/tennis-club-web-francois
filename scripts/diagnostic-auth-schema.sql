-- =====================================================
-- DIAGNOSTIC COMPLET - AUTH SCHEMA
-- Tennis Club du François
-- =====================================================
-- Ce script identifie la cause racine de l'erreur
-- "Database error querying schema"
-- =====================================================

\echo '=== DIAGNOSTIC COMPLET AUTH SCHEMA ==='
\echo ''

-- =====================================================
-- 1. VÉRIFIER LE SCHÉMA AUTH
-- =====================================================
\echo '--- 1. SCHÉMA AUTH ---'

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') 
    THEN '✓ Schéma auth existe'
    ELSE '❌ Schéma auth INEXISTANT - Installe Supabase Auth!'
  END AS diagnostic;

-- =====================================================
-- 2. VÉRIFIER LA TABLE auth.users
-- =====================================================
\echo ''
\echo '--- 2. TABLE auth.users ---'

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
    THEN '✓ Table auth.users existe'
    ELSE '❌ Table auth.users INEXISTANTE - Problème d''installation Supabase!'
  END AS diagnostic;

-- Compter les utilisateurs
SELECT 'Utilisateurs dans auth.users: ' || COUNT(*) AS count
FROM auth.users;

-- =====================================================
-- 3. VÉRIFIER LES EXTENSIONS
-- =====================================================
\echo ''
\echo '--- 3. EXTENSIONS REQUISES ---'

SELECT 
  extname AS extension,
  '✓ Installée' AS status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto')
UNION ALL
SELECT 
  extname,
  '❌ MANQUANTE' AS status
FROM unnest(ARRAY['uuid-ossp', 'pgcrypto']) AS extname
WHERE extname NOT IN (SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto'));

-- =====================================================
-- 4. VÉRIFIER LE TRIGGER
-- =====================================================
\echo ''
\echo '--- 4. TRIGGER on_auth_user_created ---'

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
    THEN '✓ Trigger existe'
    ELSE '❌ Trigger INEXISTANT - Exécute fix-auth-schema.sql!'
  END AS diagnostic;

SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled,
  CASE tgenabled
    WHEN 'O' THEN '✓ Origine (activé)'
    WHEN 'A' THEN '✓ Replica (activé)'
    WHEN 'D' THEN '❌ Désactivé'
    ELSE 'Inconnu'
  END AS status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- =====================================================
-- 5. VÉRIFIER LA FONCTION
-- =====================================================
\echo ''
\echo '--- 5. FONCTION handle_new_user ---'

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') 
    THEN '✓ Fonction existe'
    ELSE '❌ Fonction INEXISTANTE - Exécute fix-auth-schema.sql!'
  END AS diagnostic;

SELECT 
  routine_name,
  routine_schema,
  security_type,
  CASE security_type
    WHEN 'SECURITY DEFINER' THEN '✓ Correct (peut accéder à auth.users)'
    ELSE '⚠️ Problème: Doit être SECURITY DEFINER'
  END AS status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- =====================================================
-- 6. VÉRIFIER RLS SUR public.users (CRITIQUE!)
-- =====================================================
\echo ''
\echo '--- 6. RLS SUR public.users (CRITIQUE!) ---'

SELECT 
  tablename,
  rowsecurity AS rls_active,
  CASE 
    WHEN rowsecurity = true THEN '❌ PROBLÈME: RLS activé - Bloque le trigger!'
    ELSE '✓ OK: RLS désactivé - Le trigger fonctionne'
  END AS diagnostic
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- =====================================================
-- 7. VÉRIFIER LES POLITIQUES RLS
-- =====================================================
\echo ''
\echo '--- 7. POLITIQUES RLS SUR public.users ---'

SELECT 
  policyname,
  cmd AS operation,
  permissive,
  roles,
  CASE 
    WHEN qual = 'true' THEN '⚠️ DANGEREUX: USING (true) - Tout le monde peut tout faire!'
    ELSE '✓ Restrictif'
  END AS security_level
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- =====================================================
-- 8. VÉRIFIER LA SYNCHRONISATION DES DONNÉES
-- =====================================================
\echo ''
\echo '--- 8. SYNCHRONISATION auth.users ↔ public.users ---'

-- Utilisateurs dans auth.users mais pas dans public.users (orphelins)
SELECT 
  '⚠️ Utilisateurs orphelins (auth sans public.users)' AS status,
  COUNT(*) AS count
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE pu.id IS NULL;

-- Utilisateurs dans public.users mais pas dans auth.users (impossible normalement)
SELECT 
  '⚠️ Utilistes orphelins (public.users sans auth.users)' AS status,
  COUNT(*) AS count
FROM public.users pu
LEFT JOIN auth.users u ON pu.id = u.id
WHERE u.id IS NULL;

-- Utilisateurs synchronisés
SELECT 
  '✓ Utilisateurs synchronisés' AS status,
  COUNT(*) AS count
FROM auth.users u
JOIN public.users pu ON u.id = pu.id;

-- =====================================================
-- 9. VÉRIFIER LES PROFILES
-- =====================================================
\echo ''
\echo '--- 9. PROFILS ---'

SELECT 
  'Profils dans public.profiles: ' || COUNT(*) AS count
FROM public.profiles;

-- Profils orphelins (sans user dans public.users)
SELECT 
  '⚠️ Profils orphelins: ' || COUNT(*) AS count
FROM public.profiles p
LEFT JOIN public.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- =====================================================
-- 10. VÉRIFIER LES PERMISSIONS
-- =====================================================
\echo ''
\echo '--- 10. PERMISSIONS ---'

-- Vérifier les permissions sur le schéma auth
SELECT 
  'Permissions sur schéma auth' AS info,
  has_schema_privilege('postgres', 'auth', 'USAGE') AS postgres_usage,
  has_schema_privilege('anon', 'auth', 'USAGE') AS anon_usage,
  has_schema_privilege('authenticated', 'auth', 'USAGE') AS authenticated_usage,
  has_schema_privilege('service_role', 'auth', 'USAGE') AS service_role_usage;

-- Vérifier les permissions sur auth.users
SELECT 
  'Permissions sur auth.users' AS info,
  has_table_privilege('postgres', 'auth.users', 'SELECT') AS postgres_select,
  has_table_privilege('anon', 'auth.users', 'SELECT') AS anon_select,
  has_table_privilege('authenticated', 'auth.users', 'SELECT') AS authenticated_select;

-- =====================================================
-- 11. DIAGNOSTIC FINAL
-- =====================================================
\echo ''
\echo '=== DIAGNOSTIC FINAL ==='

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth')
    THEN '❌ CRITIQUE: Schéma auth inexistant'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '❌ CRITIQUE: Table auth.users inexistante'
    WHEN NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
    THEN '❌ CRITIQUE: Trigger on_auth_user_created manquant'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')
    THEN '❌ CRITIQUE: Fonction handle_new_user manquante'
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true)
    THEN '❌ CRITIQUE: RLS activé sur public.users (bloque le trigger)'
    WHEN (SELECT COUNT(*) FROM auth.users) = 0
    THEN '⚠️ ATTENTION: Aucun utilisateur dans auth.users'
    WHEN (SELECT COUNT(*) FROM public.users) = 0
    THEN '⚠️ ATTENTION: Aucun utilisateur dans public.users (trigger ne fonctionne pas)'
    WHEN EXISTS (SELECT 1 FROM auth.users u LEFT JOIN public.users pu ON u.id = pu.id WHERE pu.id IS NULL)
    THEN '⚠️ ATTENTION: Utilisateurs orphelins (trigger ne fonctionne pas)'
    ELSE '✓ TOUT EST CORRECT'
  END AS diagnostic_global;

-- =====================================================
-- 12. RECOMMANDATIONS
-- =====================================================
\echo ''
\echo '=== RECOMMANDATIONS ==='

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth')
    THEN '→ Exécute: npx supabase start (pour installer Auth)'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '→ Exécute: npx supabase start (pour installer Auth)'
    WHEN NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
    THEN '→ Exécute: scripts/fix-auth-schema.sql'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')
    THEN '→ Exécute: scripts/fix-auth-schema.sql'
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true)
    THEN '→ Exécute: scripts/fix-auth-schema.sql (désactive RLS sur public.users)'
    WHEN EXISTS (SELECT 1 FROM auth.users u LEFT JOIN public.users pu ON u.id = pu.id WHERE pu.id IS NULL)
    THEN '→ Exécute: scripts/fix-auth-schema.sql (recrée les utilisateurs)'
    ELSE '→ Aucun problème détecté, teste la connexion dans l''app'
  END AS recommandation;

\echo ''
\echo '=== FIN DU DIAGNOSTIC ==='
