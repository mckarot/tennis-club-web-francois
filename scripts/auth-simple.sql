-- =====================================================
-- AUTH SIMPLE - Script de test minimal
-- Tennis Club du François
-- =====================================================
-- Ce script :
-- 1. Nettoie TOUT (auth.users + public.users + public.profiles)
-- 2. Crée UN SEUL utilisateur de test dans auth.users
-- 3. Vérifie que le trigger fonctionne
-- 4. Donne les instructions pour tester manuellement
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : NETTOYAGE COMPLET
-- =====================================================

-- Supprimer les utilisateurs de test existants
DELETE FROM public.notifications WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.reservation_participants WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.reservations WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.cours_inscriptions WHERE eleve_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.cours WHERE moniteur_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.coach_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.member_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'));
DELETE FROM public.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');
DELETE FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

-- =====================================================
-- ÉTAPE 2 : CRÉER LE TRIGGER CORRECT
-- =====================================================
-- IMPORTANT : Dans auth.users de Supabase, le password est dans 'encrypted_password'
-- Mais on ne peut PAS le lire directement (il est crypté par Supabase)
-- Solution : On met un password_hash vide dans public.users (il sera ignoré)
-- Car l'authentification se fait TOUJOURS via auth.users, pas public.users

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans public.users
  -- password_hash est mis à une chaîne vide car l'authentification passe par auth.users
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (
    NEW.id,
    NEW.email,
    '',  -- Password hash vide - l'authentification se fait via auth.users
    COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    role = COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role);

  -- Créer une entrée dans profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    prenom = COALESCE(NEW.raw_user_meta_data->>'prenom', '');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ÉTAPE 3 : CRÉER L'UTILISATEUR DE TEST
-- =====================================================
-- IMPORTANT : Utiliser gen_random_uuid() et NOW() pour les timestamps

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
  email_change,
  email_change_token_new,
  email_change_token_current,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')),  -- Hashage du password
  NOW(),  -- Email déjà confirmé
  jsonb_build_object(
    'nom', 'Administrateur',
    'prenom', 'Principal',
    'role', 'admin'
  ),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  ''
);

-- =====================================================
-- ÉTAPE 4 : VÉRIFICATIONS
-- =====================================================

-- Vérifier auth.users
SELECT 
  'auth.users' as table_name,
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users 
WHERE email = 'admin@tennisclub.fr';

-- Vérifier public.users (devrait être peuplé par le trigger)
SELECT 
  'public.users' as table_name,
  id,
  email,
  role,
  created_at
FROM public.users 
WHERE email = 'admin@tennisclub.fr';

-- Vérifier public.profiles (devrait être peuplé par le trigger)
SELECT 
  'public.profiles' as table_name,
  id,
  user_id,
  nom,
  prenom
FROM public.profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@tennisclub.fr');

-- Résumé
SELECT 
  'RÉSUMÉ' as status,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@tennisclub.fr') as auth_users_count,
  (SELECT COUNT(*) FROM public.users WHERE email = 'admin@tennisclub.fr') as public_users_count,
  (SELECT COUNT(*) FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@tennisclub.fr')) as profiles_count;

-- =====================================================
-- INSTRUCTIONS DE TEST MANUEL
-- =====================================================
-- 
-- 1. EXÉCUTE ce script dans Supabase SQL Editor (http://localhost:54321)
-- 
-- 2. VÉRIFIE que les 3 SELECT retournent des résultats :
--    - auth.users : 1 ligne avec email=admin@tennisclub.fr
--    - public.users : 1 ligne avec role='admin'
--    - public.profiles : 1 ligne avec nom='Administrateur'
-- 
-- 3. TESTE la connexion dans ton app Next.js :
--    - URL : http://localhost:3000/login
--    - Email : admin@tennisclub.fr
--    - Password : Password123!
-- 
-- 4. SI ÇA NE MARCHE PAS :
--    - Ouvre la console du navigateur (F12)
--    - Regarde l'erreur exacte
--    - Vérifie que le trigger existe :
--      SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- 
-- =====================================================
