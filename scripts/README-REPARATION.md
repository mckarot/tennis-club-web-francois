# 📋 Réparation Authentification Supabase

## 🎯 Problème Résolu

- ❌ Erreur : `Database error querying schema`
- ❌ Redirection après connexion ne fonctionne pas
- ❌ Incohérence des identifiants entre frontend et backend

---

## 🔧 Solution en 3 Étapes

### Étape 1 : Exécuter le Script SQL de Réparation

**Fichier :** `scripts/repair-auth-complete.sql`

**Instructions :**

1. Ouvrir **Supabase SQL Editor**
2. Copier-coller le contenu complet du fichier `scripts/repair-auth-complete.sql`
3. Cliquer sur **"Run"**
4. Vérifier que le message `✅ RÉPARATION TERMINÉE AVEC SUCCÈS` apparaît

**Ce que fait le script :**

| Étape | Action |
|-------|--------|
| 1 | Active les extensions `uuid-ossp` et `pgcrypto` |
| 2 | Crée l'enum `user_role` (admin, moniteur, membre) |
| 3 | Crée la table `public.users` |
| 4 | Crée la table `public.profiles` avec colonne `role` |
| 5 | Crée le trigger `set_updated_at` |
| 6 | Crée la fonction `handle_new_user` |
| 7 | Crée le trigger `on_auth_user_created` |
| 8 | Configure RLS (désactivé sur `users`, activé sur `profiles`) |
| 9 | Nettoie les anciens utilisateurs |
| 10 | Crée les 3 utilisateurs de test |

---

### Étape 2 : Redémarrer les Services

```bash
# 1. Redémarrer Supabase Local
cd /Users/mathieu/StudioProjects/tennis_web
npx supabase stop
npx supabase start

# 2. Redémarrer Next.js
cd tennis-club-francois
npm run dev
```

---

### Étape 3 : Tester la Connexion

**URL :** http://localhost:3000/login

**Identifiants de test :**

| Rôle | Email | Mot de passe | Redirection |
|------|-------|--------------|-------------|
| 👤 Admin | `admin@tennis-club.fr` | `Admin123!` | `/dashboard/admin` |
| 🎾 Membre | `membre@tennis-club.fr` | `Membre123!` | `/dashboard/membre` |
| 🏆 Moniteur | `moniteur@tennis-club.fr` | `Moniteur123!` | `/dashboard/moniteur` |

---

## 🧪 Vérification

### Option 1 : Via le SQL Editor

Exécuter le script `scripts/quick-diagnostic-auth.sql` dans Supabase SQL Editor.

**Résultat attendu :**

```
✓ Schéma auth existe
✓ Table auth.users existe
✓ Trigger on_auth_user_created existe
✓ Fonction handle_new_user existe
✓ RLS désactivé sur public.users (CORRECT)
✓ Table public.profiles existe
✓ Colonne role existe dans profiles
Utilisateurs dans auth.users: 3
Utilisateurs synchronisés: 3
Profils créés: 3
✓ TOUT EST CORRECT - Tester la connexion
```

### Option 2 : Via le Terminal

```bash
# Vérifier que les tables existent
psql -h localhost -U postgres -d postgres -c \
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'profiles');"

# Vérifier que le trigger existe
psql -h localhost -U postgres -d postgres -c \
  "SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';"
```

---

## 📁 Fichiers Modifiés

| Fichier | Modification |
|---------|--------------|
| `scripts/repair-auth-complete.sql` | ✅ Créé - Script unifié de réparation |
| `scripts/quick-diagnostic-auth.sql` | ✅ Créé - Diagnostic rapide |
| `tennis-club-francois/src/db/schema.ts` | ✅ Mis à jour - Structure `profiles` avec `user_id`, `nom`, `prenom`, `role` |
| `tennis-club-francois/src/app/(auth)/actions.ts` | ✅ Corrigé - Utilisation de `user_id` au lieu de `id` |
| `tennis-club-francois/src/lib/supabase/server.ts` | ✅ Corrigé - Utilisation de `user_id` au lieu de `id` |

---

## 🚨 Dépannage

### Problème : "Database error querying schema" persiste

**Solution :**

```sql
-- Vérifier que le schéma auth existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
);

-- Si false, réinstaller Supabase Auth
-- npx supabase stop && npx supabase start
```

### Problème : La redirection ne fonctionne pas

**Vérifier :**

1. Le trigger `on_auth_user_created` existe-t-il ?
2. La table `public.profiles` a-t-elle une colonne `role` ?
3. Les utilisateurs sont-ils synchronisés entre `auth.users` et `public.profiles` ?

```sql
-- Vérifier le trigger
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Vérifier la structure de profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Vérifier la synchronisation
SELECT u.email, p.role 
FROM auth.users u
JOIN public.users pu ON u.id = pu.id
JOIN public.profiles p ON pu.id = p.user_id
WHERE u.email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');
```

### Problème : Erreur de connexion "Invalid credentials"

**Vérifier que les utilisateurs existent :**

```sql
SELECT email, role 
FROM auth.users 
WHERE email IN ('admin@tennis-club.fr', 'membre@tennis-club.fr', 'moniteur@tennis-club.fr');
```

Si aucun utilisateur n'est présent, réexécuter `repair-auth-complete.sql`.

---

## 📝 Notes Techniques

### Structure de la Table `profiles`

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  nom text NOT NULL DEFAULT 'Utilisateur',
  prenom text NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'membre',
  avatar_url text
);
```

### Trigger `on_auth_user_created`

Ce trigger est **CRITIQUE** pour le fonctionnement de l'authentification :

- Se déclenche après l'insertion dans `auth.users`
- Crée automatiquement les entrées dans `public.users` et `public.profiles`
- Utilise `SECURITY DEFINER` pour contourner RLS
- RLS doit être **DÉSACTIVÉ** sur `public.users`

### RLS (Row Level Security)

| Table | RLS | Raison |
|-------|-----|--------|
| `public.users` | ❌ Désactivé | Le trigger a besoin d'accès complet |
| `public.profiles` | ✅ Activé | Protection des données utilisateurs |

---

## ✅ Checklist Finale

- [ ] Script `repair-auth-complete.sql` exécuté avec succès
- [ ] Supabase Local redémarré
- [ ] Next.js redémarré
- [ ] Connexion testée avec `admin@tennis-club.fr` / `Admin123!`
- [ ] Redirection vers `/dashboard/admin` fonctionne
- [ ] Diagnostic `quick-diagnostic-auth.sql` retourne "✓ TOUT EST CORRECT"

---

**Date de mise à jour :** 2026-03-31  
**Version :** 1.0
