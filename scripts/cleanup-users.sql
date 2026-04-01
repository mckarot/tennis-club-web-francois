-- =====================================================
-- SCRIPT DE NETTOYAGE - Tennis Club du François
-- =====================================================
-- Supprime les 3 utilisateurs de test pour repartir de zéro
-- =====================================================

-- 1. D'abord, supprimer les utilisateurs de public.users (pour éviter les erreurs FK)
DELETE FROM public.users WHERE email IN (
  'admin@tennisclub.fr',
  'moniteur@tennisclub.fr',
  'membre@tennisclub.fr'
);

-- 2. Ensuite, supprimer les profils
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'admin@tennisclub.fr',
    'moniteur@tennisclub.fr',
    'membre@tennisclub.fr'
  )
);

-- 3. Maintenant, supprimer les utilisateurs auth
DELETE FROM auth.users WHERE email IN (
  'admin@tennisclub.fr',
  'moniteur@tennisclub.fr',
  'membre@tennisclub.fr'
);

-- 4. Vérifier que c'est vide
SELECT email FROM auth.users WHERE email IN (
  'admin@tennisclub.fr',
  'moniteur@tennisclub.fr',
  'membre@tennisclub.fr'
);

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Exécute ce script dans Supabase SQL Editor
-- 2. Vérifie que le SELECT ne retourne aucune ligne
-- 3. Ensuite, exécute scripts/setup-test-users-v2.sql
-- =====================================================
