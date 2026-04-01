-- =====================================================
-- VÉRIFICATION COMPLÈTE DE LA BASE DE DONNÉES
-- Tennis Club du François
-- =====================================================
-- Version compatible Supabase SQL Editor (sans \echo)
-- =====================================================

-- =====================================================
-- 1. VÉRIFICATION DES TABLES
-- =====================================================

SELECT '=== 1. VÉRIFICATION DES TABLES ===' as section;

SELECT 
  CASE 
    WHEN COUNT(*) = 11 THEN '✅ OK - 11 tables trouvées'
    ELSE '❌ PROBLÈME - ' || COUNT(*) || ' tables trouvées (11 attendues)'
  END as resultat
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'migrations%';

SELECT 'Liste des tables :' as info;
SELECT table_name as nom_table
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'migrations%'
ORDER BY table_name;

-- =====================================================
-- 2. VÉRIFICATION DES ENUMS
-- =====================================================

SELECT '=== 2. VÉRIFICATION DES ENUMS ===' as section;

SELECT 
  CASE 
    WHEN COUNT(*) = 13 THEN '✅ OK - 13 ENUMs trouvés'
    ELSE '❌ PROBLÈME - ' || COUNT(*) || ' ENUMs trouvés (13 attendus)'
  END as resultat
FROM pg_type 
WHERE typtype = 'e' 
  AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

SELECT 'Liste des ENUMs :' as info;
SELECT 
  t.typname as nom_enum,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as valeurs
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
  AND t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname
ORDER BY t.typname;

-- =====================================================
-- 3. VÉRIFICATION DES TRIGGERS
-- =====================================================

SELECT '=== 3. VÉRIFICATION DES TRIGGERS ===' as section;

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Trigger on_auth_user_created trouvé'
    ELSE '❌ PROBLÈME - Trigger on_auth_user_created MANQUANT'
  END as resultat
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

SELECT 'Fonction handle_new_user :' as info;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Fonction handle_new_user trouvée'
    ELSE '❌ PROBLÈME - Fonction handle_new_user MANQUANTE'
  END as resultat
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- =====================================================
-- 4. VÉRIFICATION DES DONNÉES DE TEST
-- =====================================================

SELECT '=== 4. VÉRIFICATION DES DONNÉES DE TEST ===' as section;

SELECT 'Utilisateurs dans auth.users :' as info;
SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ ' || COUNT(*) || ' utilisateurs trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' utilisateurs trouvés (3 attendus)'
  END as resultat
FROM auth.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

SELECT email, role, created_at
FROM auth.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

SELECT 'Utilisateurs dans public.users :' as info;
SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ ' || COUNT(*) || ' utilisateurs trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' utilisateurs trouvés (3 attendus)'
  END as resultat
FROM public.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

SELECT email, role, created_at
FROM public.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

SELECT 'Profils dans public.profiles :' as info;
SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ ' || COUNT(*) || ' profils trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' profils trouvés (3 attendus)'
  END as resultat
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

SELECT u.email, p.nom, p.prenom
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY u.email;

SELECT 'Courts dans public.courts :' as info;
SELECT 
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ ' || COUNT(*) || ' courts trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' courts trouvés (6 attendus)'
  END as resultat
FROM public.courts;

SELECT nom, type_surface, statut_court, eclaire
FROM public.courts
ORDER BY nom;

-- =====================================================
-- 5. VÉRIFICATION RLS
-- =====================================================

SELECT '=== 5. VÉRIFICATION ROW LEVEL SECURITY ===' as section;

SELECT 'Tables avec RLS activé :' as info;
SELECT 
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'migrations%'
ORDER BY tablename;

SELECT 'Politiques RLS créées :' as info;
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ AUCUNE politique RLS trouvée'
    ELSE '✅ ' || COUNT(*) || ' politiques RLS trouvées'
  END as resultat
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- 6. RÉSUMÉ GÉNÉRAL
-- =====================================================

SELECT '=== 6. RÉSUMÉ GÉNÉRAL ===' as section;

SELECT 'TABLES' as element, 
  CASE WHEN COUNT(*) = 11 THEN '✅ OK' ELSE '❌ PROBLÈME' END as statut
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name NOT LIKE 'migrations%'
UNION ALL
SELECT 'ENUMS' as element, 
  CASE WHEN COUNT(*) = 13 THEN '✅ OK' ELSE '❌ PROBLÈME' END as statut
FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
UNION ALL
SELECT 'TRIGGER' as element, 
  CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ MANQUANT' END as statut
FROM pg_trigger WHERE tgname = 'on_auth_user_created'
UNION ALL
SELECT 'AUTH USERS' as element, 
  CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '⚠️ INSUFFISANT' END as statut
FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
UNION ALL
SELECT 'PUBLIC USERS' as element, 
  CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '⚠️ INSUFFISANT' END as statut
FROM public.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
UNION ALL
SELECT 'PROFILES' as element, 
  CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '⚠️ INSUFFISANT' END as statut
FROM public.profiles p JOIN public.users u ON p.user_id = u.id WHERE u.email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
UNION ALL
SELECT 'COURTS' as element, 
  CASE WHEN COUNT(*) >= 6 THEN '✅ OK' ELSE '⚠️ INSUFFISANT' END as statut
FROM public.courts;

-- =====================================================
-- FIN DE LA VÉRIFICATION
-- =====================================================
