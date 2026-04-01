-- =====================================================
-- CORRIGER TABLE public.users POUR AUTH
-- Tennis Club du François
-- =====================================================
-- Ce script rend password_hash optionnel pour éviter les erreurs Auth
-- =====================================================

-- 1. Rendre password_hash NULL (optionnel)
-- L'authentification se fait via auth.users, pas public.users
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Vérifier la structure de la table
SELECT 'Structure de public.users :' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Mettre à jour le trigger pour ne pas mettre de password_hash
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans public.users SANS password_hash
  -- L'authentification se fait via auth.users uniquement
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    role = COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role),
    updated_at = NOW();

  -- Créer une entrée dans profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    prenom = COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier que le trigger est créé
SELECT 'Trigger créé :' as info;
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 5. Supprimer les anciens utilisateurs de public.users (IMPORTANT !)
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'
  )
);
DELETE FROM public.users WHERE email IN (
  'admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'
);

-- Maintenant, supprimer et recréer les utilisateurs dans auth.users
DELETE FROM auth.users WHERE email IN (
  'admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr'
);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated', 'admin@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')), NOW(),
  jsonb_build_object('nom', 'Administrateur', 'prenom', 'Principal', 'role', 'admin'),
  NOW(), NOW()
), (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated', 'moniteur@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')), NOW(),
  jsonb_build_object('nom', 'Moniteur', 'prenom', 'Tennis', 'role', 'moniteur'),
  NOW(), NOW()
), (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated', 'membre@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')), NOW(),
  jsonb_build_object('nom', 'Membre', 'prenom', 'Club', 'role', 'eleve'),
  NOW(), NOW()
);

-- 6. Vérifier que les utilisateurs sont créés
SELECT 'Utilisateurs créés :' as info;
SELECT email, role FROM public.users
WHERE email IN ('admin@tennisclub.fr', 'moniteur@tennisclub.fr', 'membre@tennisclub.fr')
ORDER BY email;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Redémarrer Next.js après ce script
-- Tester la connexion avec admin@tennisclub.fr / Password123!
-- =====================================================
