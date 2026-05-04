# 🚨 SUPABASE LOCAL DOIT ÊTRE DÉMARRÉ

## Problème détecté

L'erreur **"Database error querying schema"** persiste car **Supabase Local n'est pas démarré**.

---

## ✅ Solution - 3 Étapes

### Étape 1 : Démarrer Supabase Local

```bash
cd /Users/mathieu/StudioProjects/tennis_web
npx supabase start
```

**Attendre que tous les services soient prêts :**
```
✓ Starting container
✓ Started database
✓ Started auth server
✓ Started studio
✓ Supabase Local is running
```

---

### Étape 2 : Vérifier que Supabase tourne

```bash
npx supabase status
```

**Résultat attendu :**
```
✓ Supabase Local is running
✓ All containers are healthy
```

**URLs disponibles :**
- Supabase Studio : http://localhost:54323
- Auth API : http://localhost:54321
- Database : localhost:54322

---

### Étape 3 : Réexécuter le Script SQL

1. Ouvrir **Supabase Studio** : http://localhost:54323
2. Aller dans **SQL Editor**
3. Copier-coller `scripts/repair-auth-complete.sql`
4. Cliquer sur **"Run"**

---

## 🧪 Vérification

### Test 1 : API Auth fonctionne

```bash
curl -X POST 'http://localhost:54321/auth/v1/token?grant_type=password' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@tennis-club.fr",
    "password": "Admin123!"
  }'
```

**Résultat attendu :** Un JSON avec `access_token`

---

### Test 2 : Connexion dans l'app

1. Redémarrer Next.js : `npm run dev`
2. Ouvrir http://localhost:3000/login
3. Cliquer sur un bouton de remplissage automatique
4. Cliquer sur "Se connecter"

**Résultat attendu :** Redirection vers `/dashboard/admin`

---

## 🔧 Dépannage

### Problème : Docker n'est pas démarré

**Solution :**
```bash
# Ouvrir Docker Desktop
open -a Docker
# OU sur Linux
sudo systemctl start docker
```

---

### Problème : Conteneurs en erreur

**Solution : Reset complet**
```bash
# Arrêter et supprimer
npx supabase stop --no-backup

# Redémarrer proprement
npx supabase start
```

---

### Problème : Port déjà utilisé

**Solution :**
```bash
# Tuer les processus sur les ports 54321, 54322, 54323
lsof -ti:54321 | xargs kill -9
lsof -ti:54322 | xargs kill -9
lsof -ti:54323 | xargs kill -9

# Redémarrer Supabase
npx supabase start
```

---

## 📊 Checklist

- [ ] Docker Desktop est ouvert et fonctionne
- [ ] `npx supabase start` s'est terminé avec succès
- [ ] `npx supabase status` retourne "Running"
- [ ] Supabase Studio est accessible : http://localhost:54323
- [ ] Script SQL réexécuté avec succès
- [ ] Next.js redémarré : `npm run dev`
- [ ] Connexion testée avec succès

---

**Dernière mise à jour :** 2026-03-31
