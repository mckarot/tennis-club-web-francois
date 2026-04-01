-- =====================================================
-- DIAGNOSTIC RAPIDE - AUTH SCHEMA
-- Tennis Club du François
-- =====================================================
-- Exécuter dans Supabase SQL Editor pour vérifier l'état
-- =====================================================

\echo '=== DIAGNOSTIC AUTH ==='

-- 1. Schéma auth existe-t-il ?
SELECT CASE
  WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth')
  THEN '✓ Schéma auth existe'
  ELSE '❌ Schéma auth INEXISTANT'
END AS diagnostic;

-- 2. Table auth.users existe-t-elle ?
SELECT CASE
  WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
  THEN '✓ Table auth.users existe'
  ELSE '❌ Table auth.users INEXISTANTE'
END AS diagnostic;

-- 3. Trigger on_auth_user_created existe-t-il ?
SELECT CASE
  WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
  THEN '✓ Trigger on_auth_user_created existe'
  ELSE '❌ Trigger on_auth_user_created INEXISTANT'
END AS diagnostic;

-- 4. Fonction handle_new_user existe-t-elle ?
SELECT CASE
  WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')
  THEN '✓ Fonction handle_new_user existe'
  ELSE '❌ Fonction handle_new_user INEXISTANTE'
END AS diagnostic;

-- 5. RLS sur public.users (doit être désactivé)
SELECT CASE
  WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true)
  THEN '✓ RLS désactivé sur public.users (CORRECT)'
  ELSE '❌ RLS activé sur public.users (PROBLÈME)'
END AS diagnostic;

-- 6. Table public.profiles existe-t-elle ?
SELECT CASE
  WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
  THEN '✓ Table public.profiles existe'
  ELSE '❌ Table public.profiles INEXISTANTE'
END AS diagnostic;

-- 7. Colonne role dans public.profiles ?
SELECT CASE
  WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  )
  THEN '✓ Colonne role existe dans profiles'
  ELSE '❌ Colonne role INEXISTANTE dans profiles'
END AS diagnostic;

-- 8. Utilisateurs de test existent-ils ?
SELECT 'Utilisateurs dans auth.users: ' || COUNT(*) AS count
FROM auth.users
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');

-- 9. Utilisateurs synchronisés entre auth.users et public.users ?
SELECT 'Utilisateurs synchronisés: ' || COUNT(*) AS count
FROM auth.users u
JOIN public.users pu ON u.id = pu.id
WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');

-- 10. Profils créés ?
SELECT 'Profils créés: ' || COUNT(*) AS count
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');

\echo ''
\echo '=== STRUCTURE TABLE profiles ==='
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

\echo ''
\echo '=== DIAGNOSTIC FINAL ==='
SELECT CASE
  WHEN NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth')
  THEN '❌ CRITIQUE: Schéma auth inexistant → npx supabase start'
  WHEN NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
  THEN '❌ CRITIQUE: Trigger manquant → Exécute repair-auth-complete.sql'
  WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true)
  THEN '❌ CRITIQUE: RLS activé sur users → Exécute repair-auth-complete.sql'
  WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role')
  THEN '❌ CRITIQUE: Colonne role manquante dans profiles → Exécute repair-auth-complete.sql'
  WHEN (SELECT COUNT(*) FROM auth.users WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')) = 0
  THEN '⚠️ ATTENTION: Utilisateurs de test inexistants → Exécute repair-auth-complete.sql'
  ELSE '✓ TOUT EST CORRECT - Tester la connexion'
END AS diagnostic_global;

\echo ''
\echo '=== FIN DU DIAGNOSTIC ==='
