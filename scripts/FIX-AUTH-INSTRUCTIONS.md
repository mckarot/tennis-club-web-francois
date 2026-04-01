# 🔧 FIX AUTH SCHEMA - Instructions Complètes

## 🎯 Problème

```
Error [AuthApiError]: Database error querying schema
code: 'unexpected_failure'
```

Cette erreur vient de **Supabase Auth** lui-même, pas de notre code.

---

## 📋 CAUSES POSSIBLES

| Cause | Probabilité | Solution |
|-------|-------------|----------|
| Schéma `auth` corrompu | ⭐⭐⭐⭐⭐ | `fix-auth-schema.sql` |
| Extensions manquantes | ⭐⭐⭐⭐ | `fix-auth-schema.sql` |
| RLS activé sur `public.users` | ⭐⭐⭐⭐ | `fix-auth-schema.sql` |
| Trigger `on_auth_user_created` manquant | ⭐⭐⭐ | `fix-auth-schema.sql` |
| Sessions corrompues | ⭐⭐⭐ | Redémarrage Supabase |
| JWT mal configuré | ⭐⭐ | Vérifier `.env` |

---

## 🚀 SOLUTION ÉTAPE PAR ÉTAPE

### Étape 1 : Diagnostiquer le problème

```bash
# 1. Vérifier que Supabase Local tourne
npx supabase status

# 2. Si ne tourne pas, démarrer
npx supabase start

# 3. Vérifier les conteneurs Docker
docker ps | grep supabase
```

**Résultat attendu :**
```
✓ Supabase Local is running
✓ All containers are healthy
```

---

### Étape 2 : Exécuter le diagnostic SQL

1. Ouvre **Supabase Studio** : http://localhost:54323
2. Va dans **SQL Editor**
3. Copie-colle le contenu de `scripts/diagnostic-auth-schema.sql`
4. Exécute (Ctrl+Entrée)

**Résultat attendu :**
```
✓ TOUT EST CORRECT
→ Aucun problème détecté, teste la connexion dans l'app
```

**Si problème détecté → Passe à l'Étape 3**

---

### Étape 3 : Exécuter la réparation

1. Toujours dans **Supabase Studio** → **SQL Editor**
2. Copie-colle le contenu de `scripts/fix-auth-schema.sql`
3. Exécute (Ctrl+Entrée)

**Résultat attendu :**
```
======================================================
  ✅ RÉPARATION TERMINÉE AVEC SUCCÈS
======================================================

UTILISATEURS CRÉÉS:
  - admin@tennisclub.fr / Password123! (role: admin)
  - moniteur@tennisclub.fr / Password123! (role: moniteur)
  - membre@tennisclub.fr / Password123! (role: eleve)
```

---

### Étape 4 : Redémarrer Supabase Local

```bash
# 1. Arrêter Supabase
npx supabase stop

# 2. Attendre 5 secondes
sleep 5

# 3. Redémarrer
npx supabase start

# 4. Vérifier l'état
npx supabase status
```

---

### Étape 5 : Vérifier les logs Auth

```bash
# Voir les logs du service Auth
docker logs supabase-auth-1 --tail 50

# Ou en temps réel
docker logs -f supabase-auth-1
```

**Chercher :**
- ✅ `POST /token` - Connexion réussie
- ❌ `Database error querying schema` - Problème persistant
- ❌ `Invalid Refresh Token` - Token corrompu

---

### Étape 6 : Tester la connexion API

```bash
# Tester la connexion avec curl
curl -X POST 'http://localhost:54321/auth/v1/token?grant_type=password' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@tennisclub.fr",
    "password": "Password123!"
  }'
```

**Résultat attendu :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "refresh_token": "v1_abc123...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "admin@tennisclub.fr"
  }
}
```

---

### Étape 7 : Tester dans l'application

```bash
# 1. Redémarrer le serveur Next.js
npm run dev

# 2. Ouvrir http://localhost:3000/login

# 3. Se connecter avec :
#    - Email: admin@tennisclub.fr
#    - Password: Password123!
```

**Résultat attendu :**
- ✅ Redirection vers `/dashboard`
- ❌ Erreur "Database error querying schema" → Problème persistant

---

## 🐛 PROBLÈMES PERSISTANTS

### Si l'erreur persiste après toutes les étapes :

#### Option A : Reset complet de Supabase Local

```bash
# 1. Arrêter et supprimer tous les conteneurs
npx supabase stop --no-backup

# 2. Supprimer les données (ATTENTION: irréversible!)
docker volume rm tennis-club-francois_db_data

# 3. Redémarrer proprement
npx supabase start

# 4. Exécuter fix-auth-schema.sql dans Supabase Studio
```

#### Option B : Vérifier la configuration JWT

```bash
# 1. Vérifier les variables d'environnement
cat tennis-club-francois/.env.local

# 2. Les clés doivent correspondre à celles de Supabase Local
#    Voir: http://localhost:54323/project/default/settings/api

# 3. Si différent, mettre à jour .env.local
```

#### Option C : Créer les utilisateurs via l'interface Supabase

1. Va dans **Supabase Studio** → **Authentication** → **Users**
2. Clique sur **Add User**
3. Crée manuellement :
   - `admin@tennisclub.fr` / `Password123!`
   - `moniteur@tennisclub.fr` / `Password123!`
   - `membre@tennisclub.fr` / `Password123!`
4. Ajoute les metadata :
   ```json
   {
     "nom": "Admin",
     "prenom": "Principal",
     "role": "admin"
   }
   ```

---

## 📊 VÉRIFICATION FINALE

### Checklist de validation

| # | Vérification | Commande | Résultat attendu |
|---|--------------|----------|------------------|
| 1 | Supabase tourne | `npx supabase status` | ✅ Running |
| 2 | Schéma auth existe | `diagnostic-auth-schema.sql` | ✅ Schéma auth existe |
| 3 | Trigger existe | `diagnostic-auth-schema.sql` | ✅ Trigger existe |
| 4 | RLS désactivé | `diagnostic-auth-schema.sql` | ✅ RLS désactivé |
| 5 | Utilisateurs sync | `diagnostic-auth-schema.sql` | ✅ Utilisateurs synchronisés |
| 6 | API Auth marche | `curl` test | ✅ access_token retourné |
| 7 | App Next.js marche | Login dans l'app | ✅ Redirection dashboard |

---

## 📞 HANDOFF

### Si problème persiste → @architecte-supabase

```markdown
## Handoff @architecte-supabase

**Problème :** Erreur "Database error querying schema" persiste

**Déjà essayé :**
1. ✅ fix-auth-schema.sql exécuté
2. ✅ Supabase Local redémarré
3. ✅ Logs Auth vérifiés
4. ✅ Test curl API Auth échoué

**Logs d'erreur :**
[coller les logs Docker ici]

**Diagnostic SQL :**
[résultat de diagnostic-auth-schema.sql]
```

### Si code Next.js → @sql-generator

```markdown
## Handoff @sql-generator

**Problème :** Le code Next.js ne gère pas correctement l'erreur Auth

**Fichiers à vérifier :**
- `src/app/(auth)/actions.ts`
- `src/lib/supabase/server.ts`

**Erreur :**
[Erreur complète]
```

---

## 📚 RESSOURCES

- [Supabase Auth Local Development](https://supabase.com/docs/guides/local-development/auth)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**Dernière mise à jour :** 2026-03-31
**Version :** 1.0
