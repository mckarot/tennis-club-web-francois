# Guide de Résolution : Authentification Supabase Locale

Ce document explique les problèmes rencontrés lors de la mise en place de l'auth locale et comment les résoudre.

## 1. Le Problème Initial
L'utilisateur administrateur était redirigé vers le tableau de bord "membre". 
**Causes :**
- Le rôle était enregistré en tant qu'`Admin` (majuscule) dans le code React, mais `admin` (minuscule) était attendu par la logique de redirection ou stocké différemment dans la base.
- La table `public.profiles` n'était pas synchronisée avec `auth.users`.

## 2. La Solution Technique

### A. Synchronisation Automatique (Trigger)
Nous avons ajouté un trigger Postgres (`on_auth_user_created`) dans une migration (`supabase/migrations/initial_schema.sql`). À chaque fois qu'un utilisateur s'inscrit (via l'API ou le Dashboard), Supabase crée automatiquement une ligne correspondante dans `public.profiles` avec son rôle et ses informations.

### B. Le Piège du "Seeding" SQL (Important pour l'IA)
Nous avons d'abord essayé de créer les utilisateurs via des commandes `INSERT` SQL dans le fichier `seed.sql`. 
**Pourquoi ça a échoué (Erreur 500) :**
- Supabase Auth (Go-True) est un service complexe qui s'attend à ce que certaines colonnes internes (`instance_id`, `aud`, `confirmed_at`) soient remplies de manière très précise.
- Dans certains environnements Docker, certaines colonnes sont "Generated Always" et refusent l'insertion manuelle, tandis que d'autres sont obligatoires mais invisibles. Une insertion SQL manuelle incomplète fait "planter" le serveur Auth lors de la vérification du mot de passe.

**Règle d'or :** 
> Ne jamais faire d'INSERT SQL manuel dans le schéma `auth` pour le seeding. Toujours utiliser l'API officielle (`signup`) ou le Dashboard Supabase.

## 3. Procédure de Secours / Setup
Si l'authentification locale semble "cassée" ou après un reset :
1. Faire un `npx supabase db reset` (pour nettoyer le schéma et les tables publiques).
2. Utiliser des commandes `curl` contre l'API locale (`http://localhost:54321/auth/v1/signup`) pour créer les comptes de test. Cela garantit que Supabase génère correctement les hashes de mots de passe et les métadonnées Docker spécifiques à ton instance.

## 4. Identifiants de Test Actuels
- **Admin** : `admin@tennis-club.fr` / `Admin123!`
- **Membre** : `membre@tennis-club.fr` / `Membre123!`
