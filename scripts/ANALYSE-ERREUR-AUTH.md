# 🔍 ANALYSE ERREUR "DATABASE ERROR QUERYING SCHEMA"

## 📋 SYNTHÈSE DE L'ANALYSE

### Erreur Complète
```
Error [AuthApiError]: Invalid Refresh Token: Refresh Token Not Found
Error [AuthApiError]: Database error querying schema
code: 'unexpected_failure'
```

### Cause Racine Identifiée

L'erreur **"Database error querying schema"** provient de **Supabase Auth** lui-même, pas de notre code. C'est une erreur interne qui survient quand le service Auth ne peut pas interroger correctement sa base de données.

---

## 🎯 CAUSES POSSIBLES (par ordre de probabilité)

### 1. ⭐⭐⭐⭐⭐ Schéma `auth` corrompu ou mal initialisé

**Pourquoi :** Supabase Local peut mal s'initialiser, surtout après un arrêt brutal ou une mise à jour.

**Symptômes :**
- L'erreur apparaît immédiatement lors de la connexion
- Même les utilisateurs existants ne peuvent pas se connecter
- L'API Auth retourne une erreur 500

**Solution :** `scripts/fix-auth-schema.sql`

---

### 2. ⭐⭐⭐⭐ Extensions PostgreSQL manquantes

**Pourquoi :** Supabase Auth nécessite les extensions `uuid-ossp` et `pgcrypto`.

**Symptômes :**
- Erreurs lors de la création d'utilisateurs
- Fonctions de hachage de mot de passe échouent

**Solution :** `fix-auth-schema.sql` recrée les extensions

---

### 3. ⭐⭐⭐⭐ RLS activé sur `public.users` (BLOQUE LE TRIGGER!)

**Pourquoi :** Le trigger `on_auth_user_created` s'exécute avec `SECURITY DEFINER`, mais si RLS est activé sur `public.users`, les politiques RLS peuvent bloquer l'insertion.

**Symptômes :**
- Les utilisateurs sont créés dans `auth.users` mais PAS dans `public.users`
- Le trigger semble "silencieusement" échouer

**Solution :** `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`

---

### 4. ⭐⭐⭐ Trigger `on_auth_user_created` manquant ou incorrect

**Pourquoi :** Le trigger peut être supprimé accidentellement ou mal configuré.

**Symptômes :**
- Utilisateurs dans `auth.users` mais pas dans `public.users`
- Pas de profils créés automatiquement

**Solution :** `fix-auth-schema.sql` recrée le trigger correctement

---

### 5. ⭐⭐⭐ Sessions ou tokens corrompus

**Pourquoi :** Les tokens de refresh expirés ou corrompus peuvent causer des erreurs.

**Symptômes :**
- "Invalid Refresh Token: Refresh Token Not Found"
- Déconnexions inattendues

**Solution :** Redémarrer Supabase Local + nettoyer les sessions

---

### 6. ⭐⭐ JWT mal configuré

**Pourquoi :** Les clés JWT doivent correspondre entre le client et le serveur.

**Symptômes :**
- Tokens invalides
- Erreurs d'authentification aléatoires

**Solution :** Vérifier `.env.local` correspond aux clés Supabase Local

---

## 🔧 SOLUTIONS

### Solution Rapide (90% des cas)

```bash
# 1. Exécuter le script de réparation SQL
# (Dans Supabase Studio → SQL Editor)
scripts/fix-auth-schema.sql

# 2. Redémarrer Supabase Local
npx supabase stop
npx supabase start

# 3. Tester la connexion
./scripts/test-auth-connexion.sh
```

---

### Solution Complète (si l'erreur persiste)

```bash
# 1. Diagnostiquer
# (Dans Supabase Studio → SQL Editor)
scripts/diagnostic-auth-schema.sql

# 2. Si problème détecté → Exécuter la réparation
scripts/fix-auth-schema.sql

# 3. Redémarrer Supabase Local
npx supabase stop --no-backup
npx supabase start

# 4. Vérifier les logs Auth
docker logs supabase-auth-1 --tail 50

# 5. Tester l'API directement
./scripts/test-auth-connexion.sh

# 6. Si toujours une erreur → Reset complet
npx supabase stop --no-backup
docker volume rm tennis-club-francois_db_data
npx supabase start
scripts/fix-auth-schema.sql
```

---

## 📊 FLUX DE DÉCISION

```
┌─────────────────────────────────────────┐
│  Erreur "Database error querying schema" │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ 1. Diagnostic   │
         │ (SQL Editor)    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Problème détecté│
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐   ┌────────┐   ┌────────┐
│ Schéma │   │ Trigger│   │  RLS   │
│  auth  │   │manquant│   │ activé │
└───┬────┘   └───┬────┘   └───┬────┘
    │            │            │
    └────────────┴────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ fix-auth-schema│
        │     .sql       │
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │  npx supabase  │
        │  stop && start │
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ test-auth-     │
        │ connexion.sh   │
        └────────┬───────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
  ✅ Succès   ❌ Échec    ⚠️ Partiel
    │            │            │
    │            ▼            │
    │    ┌──────────────┐    │
    │    │ Reset complet│    │
    │    │ + Recréer    │    │
    │    │ utilisateurs │    │
    │    └──────────────┘    │
    │            │            │
    └────────────┴────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Test dans     │
        │  l'application │
        └────────────────┘
```

---

## 🧪 TESTS DE VALIDATION

### Test 1 : Connectivité Supabase

```bash
curl http://localhost:54321
```

**Attendu :** Réponse HTTP (200 ou 400)

---

### Test 2 : API Auth

```bash
curl -X POST 'http://localhost:54321/auth/v1/token?grant_type=password' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@tennisclub.fr","password":"Password123!"}'
```

**Attendu :** JSON avec `access_token`

---

### Test 3 : Synchronisation Utilisateurs

```sql
-- Dans Supabase Studio
SELECT 
  'auth.users' as source, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 
  'public.users' as source, COUNT(*) as count FROM public.users;
```

**Attendu :** Mêmes counts dans les deux tables

---

### Test 4 : Trigger Fonctionne

```sql
-- Créer un utilisateur test
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@trigger.fr',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Test', 'prenom', 'Trigger', 'role', 'admin'),
  NOW(),
  NOW()
);

-- Vérifier que public.users a été peuplé
SELECT * FROM public.users WHERE email = 'test@trigger.fr';

-- Nettoyer
DELETE FROM auth.users WHERE email = 'test@trigger.fr';
```

**Attendu :** 1 ligne dans `public.users`

---

## 📁 FICHIERS CRÉÉS

| Fichier | Description | Usage |
|---------|-------------|-------|
| `scripts/fix-auth-schema.sql` | Réparation complète du schéma auth | Exécuter dans Supabase Studio |
| `scripts/diagnostic-auth-schema.sql` | Diagnostic détaillé | Identifier le problème |
| `scripts/test-auth-connexion.sh` | Test de connexion API | Valider la réparation |
| `scripts/FIX-AUTH-INSTRUCTIONS.md` | Instructions détaillées | Guide pas à pas |
| `ANALYSE-ERREUR-AUTH.md` | Ce document | Compréhension du problème |

---

## 🚀 PROCÉDURE DE RÉPARATION (RÉSUMÉ)

```bash
# ÉTAPE 1 : Diagnostic
# → Ouvrir Supabase Studio → SQL Editor
# → Exécuter: scripts/diagnostic-auth-schema.sql

# ÉTAPE 2 : Réparation
# → Toujours dans SQL Editor
# → Exécuter: scripts/fix-auth-schema.sql

# ÉTAPE 3 : Redémarrage
npx supabase stop
npx supabase start

# ÉTAPE 4 : Validation
./scripts/test-auth-connexion.sh

# ÉTAPE 5 : Test dans l'app
npm run dev
# → http://localhost:3000/login
# → admin@tennisclub.fr / Password123!
```

---

## 📞 HANDOFF

### Vers @architecte-supabase

Si après toutes les réparations l'erreur persiste :

```markdown
## Handoff @architecte-supabase

**Problème :** Erreur "Database error querying schema" persiste

**Déjà essayé :**
1. ✅ fix-auth-schema.sql exécuté
2. ✅ Supabase Local redémarré (stop/start)
3. ✅ Reset complet (docker volume rm)
4. ✅ Logs Auth vérifiés

**Logs d'erreur :**
[Coller les logs Docker]

**Résultat diagnostic :**
[Coller le résultat de diagnostic-auth-schema.sql]

**Hypothèse :**
- Corruption profonde du schéma auth
- Incompatibilité de version Supabase Local
- Problème de configuration JWT
```

### Vers @sql-generator

Si le problème est résolu mais que le code Next.js doit être adapté :

```markdown
## Handoff @sql-generator

**Problème résolu :** Erreur Auth venait de Supabase Local

**Action requise :**
- Vérifier la gestion d'erreurs dans `actions.ts`
- Ajouter des logs pour déboguer futures erreurs
- S'assurer que le middleware gère correctement les tokens

**Fichiers :**
- `src/app/(auth)/actions.ts`
- `src/lib/supabase/server.ts`
- `src/middleware.ts`
```

---

## 📚 RESSOURCES

- [Supabase Auth Issues](https://github.com/supabase/supabase/issues?q=database+error+querying+schema)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Date :** 2026-03-31
**Version :** 1.0
**Statut :** ✅ PRÊT POUR EXÉCUTION
