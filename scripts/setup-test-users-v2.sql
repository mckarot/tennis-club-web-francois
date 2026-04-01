-- =====================================================
-- SCRIPT FINAL V2 - Tennis Club du François
-- =====================================================
-- Crée les 3 utilisateurs de test via Supabase Auth + 6 courts
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : Nettoyer
-- =====================================================

-- Supprimer les utilisateurs existants dans auth.users (cascade vers public.users)
DELETE FROM auth.users WHERE email IN (
  'admin@tennisclub.fr',
  'moniteur@tennisclub.fr',
  'membre@tennisclub.fr'
);

-- =====================================================
-- ÉTAPE 2 : Créer le trigger pour synchroniser auth.users → public.users
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans public.users
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- Le password_hash est déjà géré par auth.users
    '', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Créer une entrée dans profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ÉTAPE 3 : Créer les utilisateurs directement dans auth.users
-- =====================================================
-- Méthode pour Supabase Local

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
) VALUES 
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
 'admin@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(),
 jsonb_build_object('nom', 'Admin', 'prenom', 'Principal', 'role', 'admin'), NOW(), NOW()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
 'moniteur@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(),
 jsonb_build_object('nom', 'Moniteur', 'prenom', 'Tennis', 'role', 'moniteur'), NOW(), NOW()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
 'membre@tennisclub.fr', crypt('Password123!', gen_salt('bf')), NOW(),
 jsonb_build_object('nom', 'Membre', 'prenom', 'Club', 'role', 'eleve'), NOW(), NOW());

-- =====================================================
-- ÉTAPE 5 : Créer les 6 courts
-- =====================================================

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire) VALUES
  ('Court 01', 'quick', 'disponible', true),
  ('Court 02', 'quick', 'disponible', true),
  ('Court 03', 'quick', 'disponible', true),
  ('Court 04', 'quick', 'disponible', true),
  ('Court 05', 'quick', 'disponible', true),
  ('Court 06', 'quick', 'disponible', true);

-- =====================================================
-- ÉTAPE 6 : Vérifications
-- =====================================================

-- Voir les utilisateurs auth
SELECT email, role, raw_user_meta_data->>'nom' as nom
FROM auth.users
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr');

-- Voir les utilisateurs public
SELECT u.email, u.role, p.nom, p.prenom
FROM public.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
ORDER BY u.role;

-- Voir les courts
SELECT nom, type_surface, statut_court FROM public.courts;
