-- =====================================================
-- VÉRIFICATION COMPLÈTE DE LA BASE DE DONNÉES
-- Tennis Club du François
-- =====================================================
-- Ce script vérifie :
-- 1. Toutes les tables existent
-- 2. Tous les ENUMs sont créés
-- 3. Les triggers sont en place
-- 4. Les données de test sont présentes
-- 5. Les incohérences potentielles
-- =====================================================

\echo ''
\echo '======================================================'
\echo '  VÉRIFICATION DE LA BASE DE DONNÉES'
\echo '  Tennis Club du François'
\echo '======================================================'
\echo ''

-- =====================================================
-- 1. VÉRIFICATION DES TABLES
-- =====================================================
\echo '--- 1. VÉRIFICATION DES TABLES ---'
\echo ''

SELECT 
  CASE 
    WHEN COUNT(*) = 11 THEN '✅ OK - 11 tables trouvées'
    ELSE '❌ PROBLÈME - ' || COUNT(*) || ' tables trouvées (11 attendues)'
  END as verification_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'migrations%';

\echo ''
\echo 'Liste des tables :'
SELECT table_name as nom_table
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'migrations%'
ORDER BY table_name;

-- Vérification table par table
\echo ''
\echo 'Détail par table :'

DO $$
DECLARE
  table_name text;
  expected_tables text[] := ARRAY[
    'users', 'profiles', 'member_profiles', 'coach_profiles',
    'courts', 'reservations', 'reservation_participants',
    'cours', 'cours_inscriptions', 'club_settings', 'notifications'
  ];
  missing_tables text[] := ARRAY[]::text[];
BEGIN
  FOREACH table_name IN ARRAY expected_tables
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = table_name
    ) THEN
      missing_tables := array_append(missing_tables, table_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE '❌ Tables manquantes : %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ Toutes les tables sont présentes';
  END IF;
END $$;

-- =====================================================
-- 2. VÉRIFICATION DES ENUMS
-- =====================================================
\echo ''
\echo '--- 2. VÉRIFICATION DES ENUMS ---'
\echo ''

SELECT 
  CASE 
    WHEN COUNT(*) = 13 THEN '✅ OK - 13 ENUMs trouvés'
    ELSE '❌ PROBLÈME - ' || COUNT(*) || ' ENUMs trouvés (13 attendus)'
  END as verification_enums
FROM pg_type 
WHERE typtype = 'e' 
  AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

\echo ''
\echo 'Liste des ENUMs :'
SELECT 
  t.typname as nom_enum,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as valeurs
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
  AND t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname
ORDER BY t.typname;

-- Vérification ENUM par ENUM
\echo ''
\echo 'Détail des valeurs ENUM :'

-- role
SELECT 'role' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role');

-- niveau_tennis
SELECT 'niveau_tennis' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'niveau_tennis');

-- statut_adhesion
SELECT 'statut_adhesion' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'statut_adhesion');

-- type_abonnement
SELECT 'type_abonnement' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'type_abonnement');

-- type_surface
SELECT 'type_surface' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'type_surface');

-- statut_court
SELECT 'statut_court' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'statut_court');

-- type_reservation
SELECT 'type_reservation' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'type_reservation');

-- statut_reservation
SELECT 'statut_reservation' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'statut_reservation');

-- type_cours
SELECT 'type_cours' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'type_cours');

-- niveau_requis
SELECT 'niveau_requis' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'niveau_requis');

-- statut_inscription
SELECT 'statut_inscription' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'statut_inscription');

-- type_notification
SELECT 'type_notification' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'type_notification');

-- canal_notification
SELECT 'canal_notification' as enum_name, array_agg(enumlabel ORDER BY enumsortorder) as valeurs
FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'canal_notification');

-- =====================================================
-- 3. VÉRIFICATION DES TRIGGERS
-- =====================================================
\echo ''
\echo '--- 3. VÉRIFICATION DES TRIGGERS ---'
\echo ''

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Trigger on_auth_user_created trouvé'
    ELSE '❌ PROBLÈME - Trigger on_auth_user_created MANQUANT'
  END as verification_triggers
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

\echo ''
\echo 'Détail des triggers sur auth.users :'
SELECT 
  t.tgname as nom_trigger,
  t.tgtype = 'A'::"char" as after_trigger,
  p.proname as fonction,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

\echo ''
\echo 'Fonction handle_new_user :'
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Fonction handle_new_user trouvée'
    ELSE '❌ PROBLÈME - Fonction handle_new_user MANQUANTE'
  END as verification_fonction
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- =====================================================
-- 4. VÉRIFICATION DES DONNÉES DE TEST
-- =====================================================
\echo ''
\echo '--- 4. VÉRIFICATION DES DONNÉES DE TEST ---'
\echo ''

-- Utilisateurs dans auth.users
\echo 'Utilisateurs dans auth.users :'
SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ ' || COUNT(*) || ' utilisateurs trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' utilisateurs trouvés (3 attendus)'
  END as auth_users_count
FROM auth.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

\echo ''
SELECT email, role, created_at
FROM auth.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

-- Utilisateurs dans public.users
\echo ''
\echo 'Utilisateurs dans public.users :'
SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ ' || COUNT(*) || ' utilisateurs trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' utilisateurs trouvés (3 attendus)'
  END as public_users_count
FROM public.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

\echo ''
SELECT email, role, created_at
FROM public.users 
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

-- Profils dans public.profiles
\echo ''
\echo 'Profils dans public.profiles :'
SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ ' || COUNT(*) || ' profils trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' profils trouvés (3 attendus)'
  END as profiles_count
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

\echo ''
SELECT u.email, p.nom, p.prenom
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY u.email;

-- Courts dans public.courts
\echo ''
\echo 'Courts dans public.courts :'
SELECT 
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ ' || COUNT(*) || ' courts trouvés'
    ELSE '⚠️ ' || COUNT(*) || ' courts trouvés (6 attendus)'
  END as courts_count
FROM public.courts;

\echo ''
SELECT nom, type_surface, statut_court, eclaire
FROM public.courts
ORDER BY nom;

-- =====================================================
-- 5. VÉRIFICATION DES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- =====================================================
\echo ''
\echo '--- 5. VÉRIFICATION DES CONTRAINTES FK ---'
\echo ''

SELECT 
  CASE 
    WHEN COUNT(*) >= 12 THEN '✅ ' || COUNT(*) || ' contraintes FK trouvées'
    ELSE '⚠️ ' || COUNT(*) || ' contraintes FK trouvées'
  END as verification_fk
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public';

\echo ''
\echo 'Liste des contraintes FK :'
SELECT 
  tc.table_name as table_source,
  kcu.column_name as colonne_source,
  ccu.table_name as table_cible,
  ccu.column_name as colonne_cible
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- =====================================================
-- 6. VÉRIFICATION DES INDEX
-- =====================================================
\echo ''
\echo '--- 6. VÉRIFICATION DES INDEX ---'
\echo ''

SELECT 
  '✅ ' || COUNT(*) || ' index trouvés' as verification_index
FROM pg_indexes 
WHERE schemaname = 'public';

\echo ''
\echo 'Index par table :'
SELECT 
  tablename,
  COUNT(*) as nombre_index
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 7. VÉRIFICATION ROW LEVEL SECURITY (RLS)
-- =====================================================
\echo ''
\echo '--- 7. VÉRIFICATION ROW LEVEL SECURITY ---'
\echo ''

SELECT 
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'migrations%'
ORDER BY tablename;

\echo ''
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ AUCUNE politique RLS trouvée (RECOMMANDÉ: en créer)'
    ELSE '✅ ' || COUNT(*) || ' politiques RLS trouvées'
  END as verification_rls
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- 8. RÉSUMÉ GÉNÉRAL
-- =====================================================
\echo ''
\echo '======================================================'
\echo '  RÉSUMÉ DE LA VÉRIFICATION'
\echo '======================================================'
\echo ''

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

\echo ''
\echo '======================================================'
\echo '  FIN DE LA VÉRIFICATION'
\echo '======================================================'
\echo ''
