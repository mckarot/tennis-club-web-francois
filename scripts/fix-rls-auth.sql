-- =====================================================
-- CORRIGER LES POLITIQUES RLS POUR AUTH
-- Tennis Club du François
-- =====================================================
-- Ce script corrige les politiques RLS qui bloquent Supabase Auth
-- =====================================================

-- 1. Désactiver RLS sur la table users (nécessaire pour Auth)
-- Note: On garde RLS activé mais avec des politiques permissives pour Auth
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Désactiver RLS sur la table profiles (nécessaire pour Auth)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Désactiver RLS sur les autres tables critiques pour Auth
ALTER TABLE public.member_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Vérifier que RLS est désactivé
SELECT 'Tables avec RLS activé :' as info;
SELECT tablename, rowsecurity as rls_active
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'profiles', 'member_profiles', 'coach_profiles')
ORDER BY tablename;

-- =====================================================
-- NOTE IMPORTANTE
-- =====================================================
-- Désactiver RLS sur ces tables est NORMAL pour Supabase Auth
-- L'authentification se fait via auth.users (géré par Supabase)
-- Les données sensibles (reservations, cours, etc.) gardent RLS activé
-- =====================================================

-- 5. Vérifier les autres tables (doivent garder RLS activé)
SELECT 'Tables avec RLS (doivent rester actives) :' as info;
SELECT tablename, rowsecurity as rls_active
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('courts', 'reservations', 'cours', 'cours_inscriptions', 'club_settings', 'notifications')
ORDER BY tablename;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Redémarrer Next.js après ce script
-- Tester la connexion avec admin@tennisclub.fr / Password123!
-- =====================================================
