-- =====================================================
-- SCRIPT DE TEST COMPLET - Tennis Club du François
-- =====================================================
-- À exécuter dans Supabase SQL Editor
-- =====================================================
-- Ce script :
-- 1. Crée le trigger pour synchroniser auth.users → profiles
-- 2. Crée les 3 utilisateurs de test (admin, moniteur, membre)
-- 3. Met à jour les rôles
-- 4. Crée 6 courts de test
-- 5. Vérifie que tout est bon
-- =====================================================

-- =====================================================
-- ÉTAPE 0 : Créer le trigger automatique
-- =====================================================

-- Fonction qui crée un profil automatiquement quand un user est créé
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans profiles
  INSERT INTO public.profiles (user_id, nom, prenom, role, email, telephone, adresse, code_postal, ville, date_naissance, photo_url, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'eleve'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'adresse', ''),
    COALESCE(NEW.raw_user_meta_data->>'code_postal', ''),
    COALESCE(NEW.raw_user_meta_data->>'ville', ''),
    (NEW.raw_user_meta_data->>'date_naissance')::date,
    COALESCE(NEW.raw_user_meta_data->>'photo_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  );
  
  -- Créer une entrée dans member_profiles si le rôle est 'eleve'
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'eleve') = 'eleve' THEN
    INSERT INTO public.member_profiles (user_id, niveau_tennis, statut_adhesion, type_abonnement)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'niveau_tennis', 'debutant'),
      'en_attente',
      COALESCE(NEW.raw_user_meta_data->>'type_abonnement', 'standard')
    );
  END IF;
  
  -- Créer une entrée dans coach_profiles si le rôle est 'moniteur'
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'eleve') = 'moniteur' THEN
    INSERT INTO public.coach_profiles (user_id, certification, specialite, annees_experience)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'certification', ''),
      COALESCE(NEW.raw_user_meta_data->>'specialite', 'Tous niveaux'),
      0
    );
  END IF;
  
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
-- ÉTAPE 1 : Créer les 3 utilisateurs de test
-- =====================================================
-- IMPORTANT : Sur Supabase Local, auth.admin.create_user() peut ne pas être disponible.
-- Deux options :

-- OPTION A : Si auth.admin.create_user() est disponible (Supabase Cloud)
-- Décommente cette section pour Supabase Cloud

-- Créer l'admin
-- SELECT auth.admin.create_user(
--   'admin@tennisclub.fr',
--   'Password123!',
--   jsonb_build_object(
--     'nom', 'Admin',
--     'prenom', 'Principal',
--     'role', 'admin'
--   )
-- );

-- Créer le moniteur
-- SELECT auth.admin.create_user(
--   'moniteur@tennisclub.fr',
--   'Password123!',
--   jsonb_build_object(
--     'nom', 'Moniteur',
--     'prenom', 'Tennis',
--     'role', 'moniteur',
--     'certification', 'Brevet d État',
--     'specialite', 'Adultes'
--   )
-- );

-- Créer le membre
-- SELECT auth.admin.create_user(
--   'membre@tennisclub.fr',
--   'Password123!',
--   jsonb_build_object(
--     'nom', 'Membre',
--     'prenom', 'Club',
--     'role', 'eleve',
--     'niveau_tennis', 'intermediaire',
--     'type_abonnement', 'standard'
--   )
-- );

-- OPTION B : Pour Supabase Local (recommandé)
-- Crée les utilisateurs manuellement via :
-- 1. Va dans Authentication → Users
-- 2. Clique sur "Add user" → "Create new user"
-- 3. Crée les 3 comptes :
--    - admin@tennisclub.fr / Password123!
--    - moniteur@tennisclub.fr / Password123!
--    - membre@tennisclub.fr / Password123!
-- 4. Ensuite, exécute la suite de ce script (ÉTAPE 2 et 3)

-- =====================================================
-- ÉTAPE 3 : Créer les 6 courts de test
-- =====================================================

INSERT INTO public.courts (nom, type_surface, statut, eclaire) VALUES
  ('Court 01', 'quick', 'disponible', true),
  ('Court 02', 'quick', 'disponible', true),
  ('Court 03', 'quick', 'disponible', true),
  ('Court 04', 'quick', 'disponible', true),
  ('Court 05', 'quick', 'disponible', true),
  ('Court 06', 'quick', 'disponible', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 4 : Vérifications
-- =====================================================

-- Afficher tous les utilisateurs avec leur rôle
SELECT 
  u.id,
  u.email,
  u.role,
  u.created_at,
  p.nom,
  p.prenom
FROM public.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
ORDER BY u.role, u.email;

-- Afficher tous les courts
SELECT id, nom, type_surface, statut, eclaire 
FROM public.courts 
ORDER BY id;

-- Compter le nombre de tables
SELECT COUNT(*) AS nombre_tables
FROM information_schema.tables
WHERE table_schema = 'public';

-- Compter le nombre d'ENUMs
SELECT COUNT(*) AS nombre_enums
FROM pg_type
WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- INSTRUCTIONS DE TEST
-- =====================================================
-- 1. Crée les 3 comptes via Supabase : Authentication → Users → Add user
--    - admin@tennisclub.fr / Password123!
--    - moniteur@tennisclub.fr / Password123!
--    - membre@tennisclub.fr / Password123!
--
-- 2. Exécute ce script dans SQL Editor
--
-- 3. Vérifie avec les requêtes SELECT ci-dessus
--
-- 4. Teste la connexion dans ton app Next.js :
--    - admin@tennisclub.fr → /admin/dashboard
--    - moniteur@tennisclub.fr → /moniteur/dashboard
--    - membre@tennisclub.fr → /membre/dashboard
-- =====================================================
