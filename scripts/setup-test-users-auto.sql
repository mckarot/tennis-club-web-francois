-- =====================================================
-- SCRIPT COMPLET AVEC CRÉATION DES UTILISATEURS
-- Tennis Club du François
-- =====================================================
-- Ce script crée TOUT automatiquement, y compris les 3 utilisateurs
-- Fonctionne sur Supabase LOCAL et Cloud
-- =====================================================

-- =====================================================
-- ÉTAPE 0 : Créer le trigger automatique
-- =====================================================

-- Fonction qui crée un profil automatiquement quand un user est créé
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Créer une entrée dans public.users (avec le role casté en type role)
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role
  )
  ON CONFLICT (id) DO UPDATE SET role = COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role;
  
  -- 2. Créer une entrée dans profiles
  INSERT INTO public.profiles (user_id, nom, prenom, telephone, adresse, code_postal, ville, date_naissance, photo_url, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'adresse', ''),
    COALESCE(NEW.raw_user_meta_data->>'code_postal', ''),
    COALESCE(NEW.raw_user_meta_data->>'ville', ''),
    (NEW.raw_user_meta_data->>'date_naissance')::date,
    COALESCE(NEW.raw_user_meta_data->>'photo_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui appelle la fonction à chaque nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ÉTAPE 1 : Supprimer les anciens utilisateurs (si existent)
-- =====================================================
-- Ça évite les erreurs de doublons

-- Supprimer les 3 utilisateurs de test s'ils existent déjà
DELETE FROM auth.users WHERE email IN (
  'admin@tennisclub.fr',
  'moniteur@tennisclub.fr',
  'membre@tennisclub.fr'
);

-- =====================================================
-- ÉTAPE 2 : Créer les utilisateurs avec insert direct
-- =====================================================

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
  updated_at
)
VALUES 
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
   'admin@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(), 
   jsonb_build_object('nom', 'Admin', 'prenom', 'Principal', 'role', 'admin'),
   NOW(), NOW());

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
  updated_at
)
VALUES 
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
   'moniteur@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(), 
   jsonb_build_object('nom', 'Moniteur', 'prenom', 'Tennis', 'role', 'moniteur'),
   NOW(), NOW());

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
  updated_at
)
VALUES 
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
   'membre@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(), 
   jsonb_build_object('nom', 'Membre', 'prenom', 'Club', 'role', 'eleve'),
   NOW(), NOW());

-- =====================================================
-- ÉTAPE 2 : Mettre à jour les rôles dans public.users
-- =====================================================
-- Le trigger a créé les profils, maintenant on définit les rôles

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@tennisclub.fr';

UPDATE public.users 
SET role = 'moniteur' 
WHERE email = 'moniteur@tennisclub.fr';

UPDATE public.users 
SET role = 'eleve' 
WHERE email = 'membre@tennisclub.fr';

-- =====================================================
-- ÉTAPE 3 : Créer les 6 courts de test
-- =====================================================

INSERT INTO public.courts (nom, type_surface, statut, eclaire) VALUES
  ('Court 01', 'quick', 'disponible', true),
  ('Court 02', 'quick', 'disponible', true),
  ('Court 03', 'quick', 'disponible', true),
  ('Court 04', 'quick', 'disponible', true),
  ('Court 05', 'quick', 'disponible', true),
  ('Court 06', 'quick', 'disponible', true);

-- =====================================================
-- ÉTAPE 4 : Vérifications
-- =====================================================

-- Afficher tous les utilisateurs
SELECT 
  u.id,
  u.email,
  u.role,
  p.nom,
  p.prenom
FROM public.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
ORDER BY u.role, u.email;

-- Afficher les courts
SELECT * FROM public.courts ORDER BY id;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Copie-colle TOUT ce script dans Supabase SQL Editor
-- 2. Exécute (Ctrl+Entrée)
-- 3. Vérifie avec les SELECT ci-dessus
-- 4. Teste la connexion dans ton app Next.js :
--    - admin@tennisclub.fr / Password123!
--    - moniteur@tennisclub.fr / Password123!
--    - membre@tennisclub.fr / Password123!
-- =====================================================
