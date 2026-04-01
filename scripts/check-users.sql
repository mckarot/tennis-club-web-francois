-- =====================================================
-- VÉRIFICATION SIMPLE - Tennis Club du François
-- =====================================================
-- Exécute ce script pour vérifier que public.users est peuplé
-- =====================================================

-- 1. Vérifier auth.users
SELECT 'auth.users' as source, email, role 
FROM auth.users 
WHERE email = 'admin@tennisclub.fr';

-- 2. Vérifier public.users
SELECT 'public.users' as source, email, role 
FROM public.users 
WHERE email = 'admin@tennisclub.fr';

-- 3. Vérifier public.profiles
SELECT 'public.profiles' as source, user_id, nom, prenom 
FROM public.profiles;

-- 4. Si public.users est VIDE, exécuter la suite :

-- Créer le trigger correct
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- public.users (avec password_hash de auth.users)
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (NEW.id, NEW.email, NEW.encrypted_password, COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role)
  ON CONFLICT (id) DO UPDATE SET role = COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role;
  
  -- profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'), COALESCE(NEW.raw_user_meta_data->>'prenom', ''))
  ON CONFLICT (user_id) DO UPDATE SET nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Tester avec un nouvel utilisateur
DELETE FROM auth.users WHERE email = 'test@tennisclub.fr';

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  gen_random_uuid(), 
  'authenticated', 
  'authenticated', 
  'test@tennisclub.fr', 
  crypt('Test123!', gen_salt('bf')), 
  NOW(),
  jsonb_build_object('nom', 'Test', 'prenom', 'User', 'role', 'admin'), 
  NOW(), 
  NOW()
);

-- 6. Vérifier le résultat
SELECT 'RESULTAT:' as info;
SELECT email, role FROM public.users;
SELECT * FROM public.profiles;
