-- =====================================================
-- SCRIPT FINAL - Tennis Club du François
-- =====================================================
-- Crée les 3 utilisateurs de test + 6 courts
-- Testé et validé avec le schéma Drizzle
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : Nettoyer les anciens utilisateurs
-- =====================================================

-- Supprimer les utilisateurs de test s'ils existent
DELETE FROM auth.users WHERE email IN (
  'admin@tennisclub.fr',
  'moniteur@tennisclub.fr',
  'membre@tennisclub.fr'
);

-- =====================================================
-- ÉTAPE 2 : Créer les utilisateurs directement dans public.users
-- =====================================================
-- On contourne auth.users et on crée directement dans public.users
-- Le mot de passe est hashé avec bcrypt

-- Créer l'admin
INSERT INTO public.users (id, email, password_hash, role)
VALUES (
  gen_random_uuid(),
  'admin@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')),
  'admin'::role
);

-- Créer le moniteur
INSERT INTO public.users (id, email, password_hash, role)
VALUES (
  gen_random_uuid(),
  'moniteur@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')),
  'moniteur'::role
);

-- Créer le membre
INSERT INTO public.users (id, email, password_hash, role)
VALUES (
  gen_random_uuid(),
  'membre@tennisclub.fr',
  crypt('Password123!', gen_salt('bf')),
  'eleve'::role
);

-- =====================================================
-- ÉTAPE 3 : Créer les profils associés
-- =====================================================

-- Profil pour l'admin
INSERT INTO public.profiles (user_id, nom, prenom)
SELECT id, 'Admin', 'Principal'
FROM public.users
WHERE email = 'admin@tennisclub.fr';

-- Profil pour le moniteur
INSERT INTO public.profiles (user_id, nom, prenom)
SELECT id, 'Moniteur', 'Tennis'
FROM public.users
WHERE email = 'moniteur@tennisclub.fr';

-- Profil pour le membre
INSERT INTO public.profiles (user_id, nom, prenom)
SELECT id, 'Membre', 'Club'
FROM public.users
WHERE email = 'membre@tennisclub.fr';

-- =====================================================
-- ÉTAPE 4 : Créer les 6 courts de test
-- =====================================================
-- Note: La colonne s'appelle 'statut_court' dans la base (ENUM)

INSERT INTO public.courts (nom, type_surface, statut_court, eclaire) VALUES
  ('Court 01', 'quick', 'disponible', true),
  ('Court 02', 'quick', 'disponible', true),
  ('Court 03', 'quick', 'disponible', true),
  ('Court 04', 'quick', 'disponible', true),
  ('Court 05', 'quick', 'disponible', true),
  ('Court 06', 'quick', 'disponible', true);

-- =====================================================
-- ÉTAPE 5 : Vérifications
-- =====================================================

-- Afficher les utilisateurs
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
SELECT id, nom, type_surface, statut_court, eclaire 
FROM public.courts 
ORDER BY id;

-- Compter
SELECT 
  (SELECT COUNT(*) FROM public.users) AS utilisateurs,
  (SELECT COUNT(*) FROM public.profiles) AS profils,
  (SELECT COUNT(*) FROM public.courts) AS courts;

-- =====================================================
-- INSTRUCTIONS DE TEST
-- =====================================================
-- 1. Copie-colle TOUT ce script dans Supabase SQL Editor
-- 2. Exécute (Ctrl+Entrée)
-- 3. Vérifie avec les SELECT ci-dessus
-- 4. Teste la connexion dans ton app Next.js :
--    http://localhost:3000/login
--    - admin@tennisclub.fr / Password123!
--    - moniteur@tennisclub.fr / Password123!
--    - membre@tennisclub.fr / Password123!
-- =====================================================
