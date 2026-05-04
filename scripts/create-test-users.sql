-- =====================================================
-- SCRIPT: Création utilisateurs de test
-- PROJET: Tennis Club
-- DESCRIPTION: Crée 3 utilisateurs de test (admin, membre, moniteur)
-- =====================================================
--
-- 📋 COMMENT EXÉCUTER CE SCRIPT :
--
-- 1. Allez dans Supabase Dashboard → SQL Editor
-- 2. Copiez-collez ce script complet
-- 3. Cliquez sur "Run"
-- 4. Les utilisateurs seront créés dans auth.users
--
-- ⚠️ IMPORTANT :
-- - Les mots de passe sont hachés avec crypt()
-- - Nécessite l'extension pgcrypto (activée par défaut sur Supabase)
-- - Exécutez ce script en tant qu'utilisateur avec privilèges admin
--
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. CRÉATION DES UTILISATEURS DANS AUTH.USERS
-- =====================================================

-- Fonction helper pour créer un utilisateur
CREATE OR REPLACE FUNCTION public.create_test_user(
  p_email text,
  p_password text,
  p_role text
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_existing auth.users;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT * INTO v_existing FROM auth.users WHERE email = p_email;
  
  IF v_existing.id IS NOT NULL THEN
    -- Utilisateur existe déjà, retourner son ID
    RETURN v_existing.id;
  ELSE
    -- Créer le nouvel utilisateur
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      p_email,
      crypt(p_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('role', p_role),
      encode(gen_random_bytes(32), 'hex'),
      NOW(),
      NOW()
    )
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. EXÉCUTION - CRÉATION DES 3 UTILISATEURS
-- =====================================================

-- Admin
SELECT public.create_test_user('admin@tennis-club.fr', 'Admin123!', 'admin');

-- Membre
SELECT public.create_test_user('membre@tennis-club.fr', 'Membre123!', 'membre');

-- Moniteur
SELECT public.create_test_user('moniteur@tennis-club.fr', 'Moniteur123!', 'moniteur');

-- =====================================================
-- 4. CRÉATION DES PROFILS (si table profiles existe)
-- =====================================================

DO $$
DECLARE
  v_admin_id uuid;
  v_membre_id uuid;
  v_moniteur_id uuid;
BEGIN
  -- Vérifier si la table profiles existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Récupérer les IDs des utilisateurs créés
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@tennis-club.fr';
    SELECT id INTO v_membre_id FROM auth.users WHERE email = 'membre@tennis-club.fr';
    SELECT id INTO v_moniteur_id FROM auth.users WHERE email = 'moniteur@tennis-club.fr';
    
    -- Créer/Updater les profiles
    INSERT INTO public.profiles (user_id, nom, prenom, created_at, updated_at)
    VALUES 
      (v_admin_id, 'Administrateur', 'Principal', NOW(), NOW()),
      (v_membre_id, 'Membre', 'Test', NOW(), NOW()),
      (v_moniteur_id, 'Moniteur', 'Tennis', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      nom = EXCLUDED.nom,
      prenom = EXCLUDED.prenom,
      updated_at = NOW();
  END IF;
END $$;

-- =====================================================
-- 5. CRÉATION DES UTILISATEURS (si table users existe)
-- =====================================================

DO $$
DECLARE
  v_admin_id uuid;
  v_membre_id uuid;
  v_moniteur_id uuid;
BEGIN
  -- Vérifier si la table users existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Récupérer les IDs des utilisateurs créés
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@tennis-club.fr';
    SELECT id INTO v_membre_id FROM auth.users WHERE email = 'membre@tennis-club.fr';
    SELECT id INTO v_moniteur_id FROM auth.users WHERE email = 'moniteur@tennis-club.fr';
    
    -- Créer/Updater les users avec rôles
    INSERT INTO public.users (id, email, role, created_at, updated_at)
    VALUES 
      (v_admin_id, 'admin@tennis-club.fr', 'admin', NOW(), NOW()),
      (v_membre_id, 'membre@tennis-club.fr', 'membre', NOW(), NOW()),
      (v_moniteur_id, 'moniteur@tennis-club.fr', 'moniteur', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      updated_at = NOW();
  END IF;
END $$;

-- =====================================================
-- 6. NETTOYAGE - Suppression de la fonction helper
-- =====================================================

DROP FUNCTION IF EXISTS public.create_test_user(text, text, text);

-- =====================================================
-- 7. VÉRIFICATION - Affichage des utilisateurs créés
-- =====================================================

SELECT 
  email,
  role,
  raw_user_meta_data->>'role' as meta_role,
  created_at
FROM auth.users
WHERE email IN (
  'admin@tennis-club.fr',
  'membre@tennis-club.fr',
  'moniteur@tennis-club.fr'
)
ORDER BY created_at DESC;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
