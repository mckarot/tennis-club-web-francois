-- =====================================================
-- CORRECTION COMPLÈTE - Tennis Club du François
-- =====================================================
-- 1. Corrige le middleware (lire role depuis users, pas profiles)
-- 2. Vérifie que les utilisateurs ont un rôle
-- =====================================================

-- 1. Vérifier que public.users a les bons rôles
SELECT email, role FROM public.users;

-- 2. Si besoin, mettre à jour les rôles
UPDATE public.users SET role = 'admin' WHERE email = 'admin@tennisclub.fr';
UPDATE public.users SET role = 'moniteur' WHERE email = 'moniteur@tennisclub.fr';
UPDATE public.users SET role = 'eleve' WHERE email = 'membre@tennisclub.fr';

-- 3. Vérifier
SELECT email, role FROM public.users;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Exécute ce script dans Supabase SQL Editor
-- 2. Vérifie que les 3 utilisateurs ont les bons rôles
-- 3. Ensuite, teste la connexion sur http://localhost:3000/login
-- =====================================================
