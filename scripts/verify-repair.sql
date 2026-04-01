-- =====================================================
-- VÉRIFICATION POST-RÉPARATION
-- Tennis Club du François
-- =====================================================
-- À exécuter APRÈS repair-auth-complete.sql
-- =====================================================

\echo ''
\echo '=== VÉRIFICATION POST-RÉPARATION ==='
\echo ''

-- 1. Utilisateurs dans auth.users
\echo '--- 1. UTILISATEURS DANS auth.users ---'
SELECT 
  email,
  role,
  email_confirmed_at IS NOT NULL AS email_confirmed,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
FROM auth.users
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
ORDER BY email;

-- 2. Utilisateurs dans public.users
\echo ''
\echo '--- 2. UTILISATEURS DANS public.users ---'
SELECT 
  email,
  role,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
FROM public.users
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
ORDER BY email;

-- 3. Profils dans public.profiles
\echo ''
\echo '--- 3. PROFILS DANS public.profiles ---'
SELECT 
  p.user_id,
  p.nom,
  p.prenom,
  p.role,
  u.email
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
ORDER BY u.email;

-- 4. Structure de la table profiles
\echo ''
\echo '--- 4. STRUCTURE TABLE profiles ---'
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Trigger on_auth_user_created
\echo ''
\echo '--- 5. TRIGGER on_auth_user_created ---'
SELECT 
  tgname AS trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '✓ Activé (Origin)'
    WHEN 'A' THEN '✓ Activé (Replica)'
    WHEN 'D' THEN '❌ Désactivé'
    ELSE 'Inconnu'
  END AS status,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- 6. État RLS
\echo ''
\echo '--- 6. ÉTAT RLS ---'
SELECT 
  tablename,
  CASE rowsecurity
    WHEN true THEN '⚠️ Activé'
    WHEN false THEN '✓ Désactivé'
  END AS rls_status,
  CASE 
    WHEN tablename = 'users' AND rowsecurity = true THEN '❌ PROBLÈME: Doit être désactivé!'
    WHEN tablename = 'profiles' AND rowsecurity = false THEN '⚠️ ATTENTION: Devrait être activé!'
    ELSE '✓ OK'
  END AS diagnostic
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'profiles');

-- 7. Politiques RLS sur profiles
\echo ''
\echo '--- 7. POLITIQUES RLS SUR profiles ---'
SELECT 
  policyname,
  cmd AS operation,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 8. Synchronisation des données
\echo ''
\echo '--- 8. SYNCHRONISATION DES DONNÉES ---'
SELECT 
  CASE 
    WHEN COUNT(*) = 3 THEN '✓ 3 utilisateurs synchronisés'
    WHEN COUNT(*) = 0 THEN '❌ AUCUN utilisateur synchronisé'
    ELSE '⚠️ ' || COUNT(*) || ' utilisateur(s) synchronisé(s) sur 3 attendus'
  END AS synchronisation
FROM auth.users u
JOIN public.users pu ON u.id = pu.id
JOIN public.profiles p ON pu.id = p.user_id
WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');

-- 9. Résumé par email
\echo ''
\echo '--- 9. RÉSUMÉ PAR UTILISATEUR ---'
SELECT 
  u.email,
  u.role AS user_role,
  p.role AS profile_role,
  p.nom,
  p.prenom,
  CASE 
    WHEN u.role = p.role THEN '✓ Cohérent'
    ELSE '❌ Incohérent'
  END AS coherence
FROM public.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')
ORDER BY u.email;

-- 10. Test de connexion (simulation)
\echo ''
\echo '--- 10. TEST DE CONNEXION (SIMULATION) ---'
\echo 'Pour tester la connexion, exécutez dans Next.js:'
\echo ''
\echo '  const { data } = await supabase.auth.signInWithPassword({'
\echo '    email: "admin@tennis-club.fr",'
\echo '    password: "Admin123!"'
\echo '  });'
\echo ''
\echo 'Puis vérifiez le rôle:'
\echo ''
\echo '  const { data: profile } = await supabase'
\echo '    .from("profiles")'
\echo '    .select("role")'
\echo '    .eq("user_id", data.user.id)'
\echo '    .single();'
\echo ''

-- 11. Diagnostic final
\echo ''
\echo '=== DIAGNOSTIC FINAL ==='
SELECT CASE
  WHEN NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
  THEN '❌ CRITIQUE: Trigger on_auth_user_created manquant'
  WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true)
  THEN '❌ CRITIQUE: RLS activé sur public.users'
  WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role')
  THEN '❌ CRITIQUE: Colonne role manquante dans profiles'
  WHEN (SELECT COUNT(*) FROM auth.users WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')) <> 3
  THEN '⚠️ ATTENTION: Utilisateurs de test manquants'
  WHEN (SELECT COUNT(*) FROM public.profiles p JOIN public.users u ON p.user_id = u.id WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr')) <> 3
  THEN '⚠️ ATTENTION: Profils manquants'
  ELSE '✅ TOUT EST CORRECT - Prêt pour tester la connexion!'
END AS diagnostic;

\echo ''
\echo '=== FIN DE LA VÉRIFICATION ==='
\echo ''
\echo 'PROCHAINES ÉTAPES:'
\echo '  1. Si des erreurs sont détectées, réexécuter repair-auth-complete.sql'
\echo '  2. Redémarrer Next.js: npm run dev'
\echo '  3. Tester la connexion sur http://localhost:3000/login'
\echo ''
