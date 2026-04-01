-- =====================================================
-- SCRIPT DE RÉPARATION DU TRIGGER - Tennis Club du François
-- =====================================================
-- Corrige le trigger pour synchroniser auth.users → public.users
-- =====================================================

-- 0. Nettoyer les anciennes données (IMPORTANT !)
DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@tennisclub.fr');
DELETE FROM public.users WHERE email = 'admin@tennisclub.fr';
DELETE FROM auth.users WHERE email = 'admin@tennisclub.fr';

-- 1. Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Recréer la fonction avec le bon password_hash
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans public.users avec le password_hash de auth.users
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.encrypted_password,  -- Utiliser le password hash de auth.users
    COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = NEW.email,
    role = COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Tester en recréant un utilisateur
-- Supprimer l'admin existant
DELETE FROM auth.users WHERE email = 'admin@tennisclub.fr';

-- Recréer l'admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'admin@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(),
  jsonb_build_object('nom', 'Admin', 'prenom', 'Principal', 'role', 'admin'), NOW(), NOW()
);

-- 5. Vérifier que public.users a été peuplé
SELECT email, role FROM public.users;
SELECT email, role FROM auth.users;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Exécute ce script dans Supabase SQL Editor
-- 2. Vérifie que les 2 SELECT retournent des résultats
-- 3. Si OK, exécute scripts/setup-test-users-v2.sql pour recréer les 3 utilisateurs
-- 4. Teste la connexion sur http://localhost:3000/login
-- =====================================================
