-- =====================================================
-- Script de réparation : email_change NULL dans auth.users
-- Problème: GoTrue ne supporte pas NULL pour email_change
-- Solution: Remplacer NULL par chaîne vide ''
-- =====================================================

-- 1. Mettre à jour toutes les lignes avec email_change NULL
UPDATE auth.users
SET email_change = ''
WHERE email_change IS NULL;

-- 2. Mettre à jour toutes les colonnes similaires qui pourraient être NULL
UPDATE auth.users
SET 
  phone_change = COALESCE(phone_change, ''),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '');

-- 3. Vérification : afficher les colonnes qui sont encore NULL
SELECT 
  id,
  email,
  CASE WHEN email_change IS NULL THEN 'NULL' ELSE 'OK' END as email_change_status,
  CASE WHEN phone_change IS NULL THEN 'NULL' ELSE 'OK' END as phone_change_status
FROM auth.users;

-- 4. Optionnel: Ajouter une contrainte NOT NULL avec DEFAULT '' pour éviter le problème à l'avenir
-- NOTE: À exécuter avec précaution, peut nécessiter un redémarrage du service Auth
-- ALTER TABLE auth.users ALTER COLUMN email_change SET DEFAULT '';
-- ALTER TABLE auth.users ALTER COLUMN email_change SET NOT NULL;
