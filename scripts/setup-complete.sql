-- =====================================================
-- SCRIPT COMPLET ET DÉFINITIF - Tennis Club du François
-- =====================================================
-- Ce script fait TOUT d'un coup :
-- 1. Nettoie les anciennes données
-- 2. Crée le trigger correct
-- 3. Crée les 3 utilisateurs
-- 4. Crée les 6 courts
-- 5. Vérifie que tout est bon
-- =====================================================

-- =====================================================
-- ÉTAPE 0 : NETTOYAGE COMPLET
-- =====================================================

-- Supprimer dans l'ordre inverse des contraintes FK
DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN (
  'admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'
));
DELETE FROM public.users WHERE email IN (
  'admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'
);
DELETE FROM auth.users WHERE email IN (
  'admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'
);

-- =====================================================
-- ÉTAPE 1 : CRÉER LE TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- public.users
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (NEW.id, NEW.email, NEW.encrypted_password, COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role)
  ON CONFLICT (id) DO UPDATE SET email = NEW.email, role = COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role;
  
  -- profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'), COALESCE(NEW.raw_user_meta_data->>'prenom', ''))
  ON CONFLICT (user_id) DO UPDATE SET nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'), prenom = COALESCE(NEW.raw_user_meta_data->>'prenom', '');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ÉTAPE 2 : CRÉER LES 3 UTILISATEURS
-- =====================================================

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(), jsonb_build_object('nom', 'Admin', 'prenom', 'Principal', 'role', 'admin'), NOW(), NOW()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'moniteur@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(), jsonb_build_object('nom', 'Moniteur', 'prenom', 'Tennis', 'role', 'moniteur'), NOW(), NOW()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'membre@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(), jsonb_build_object('nom', 'Membre', 'prenom', 'Club', 'role', 'eleve'), NOW(), NOW());

-- =====================================================
-- ÉTAPE 3 : CRÉER LES 6 COURTS
-- =====================================================

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire) VALUES
('Court 01', 'quick', 'disponible', true),
('Court 02', 'quick', 'disponible', true),
('Court 03', 'quick', 'disponible', true),
('Court 04', 'quick', 'disponible', true),
('Court 05', 'quick', 'disponible', true),
('Court 06', 'quick', 'disponible', true);

-- =====================================================
-- ÉTAPE 4 : VÉRIFICATIONS
-- =====================================================

SELECT 'auth.users' as table_name, email, role FROM auth.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
UNION ALL
SELECT 'public.users' as table_name, email, role FROM public.users WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

SELECT 'Courts: ' || COUNT(*) as info FROM public.courts;
SELECT 'Profiles: ' || COUNT(*) as info FROM public.profiles;

-- =====================================================
-- TEST DE CONNEXION
-- =====================================================
-- http://localhost:3000/login
-- admin@tennisclub.fr / Password123!
-- moniteur@tennisclub.fr / Password123!
-- membre@tennisclub.fr / Password123!
-- =====================================================
