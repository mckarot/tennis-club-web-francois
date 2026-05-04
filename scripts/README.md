# 📜 Scripts SQL - Tennis Club du François

**Dernière mise à jour :** 2026-04-01

---

## 🎯 SCRIPTS PRINCIPAUX

### ⭐ **`repair-auth-complete.sql`** - **RÉPARATION AUTHENTIFICATION**

**Quand l'utiliser :**
- 🚨 Erreur "Database error querying schema"
-  Problème de connexion à Supabase Auth
- 🚨 Après un redémarrage complet de Supabase

**Ce qu'il fait :**
- ✅ Active les extensions (uuid-ossp, pgcrypto)
- ✅ Crée l'enum `user_role`
- ✅ Crée les tables `public.users` et `public.profiles`
- ✅ Crée le trigger `on_auth_user_created`
- ✅ Configure RLS (Row Level Security)
- ✅ Crée les 3 utilisateurs de test

**Comment l'exécuter :**
1. Ouvrir Supabase Studio : http://localhost:54323
2. Aller dans SQL Editor
3. Copier-coller le contenu du fichier
4. Cliquer sur "Run"

**Identifiants créés :**
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@tennis-club.fr` | `Admin123!` |
| Membre | `membre@tennis-club.fr` | `Membre123!` |
| Moniteur | `moniteur@tennis-club.fr` | `Moniteur123!` |

---

### 🔧 **`fix-auth-email-change.sql`** - **FIX NULL COLUMNS**

**Quand l'utiliser :**
- 🚨 Erreur "converting NULL to string is unsupported"
- 🚨 Problème avec les colonnes `email_change`, `confirmation_token`, etc.

**Ce qu'il fait :**
- ✅ Met à jour `email_change` de NULL à ''
- ✅ Met à jour toutes les colonnes similaires
- ✅ Évite l'erreur GoTrue

**Comment l'exécuter :**
1. Ouvrir Supabase Studio
2. SQL Editor
3. Copier-coller le script
4. Run

---

### 👥 **`create-test-users.sql`** - **CRÉATION UTILISATEURS TEST**

**Quand l'utiliser :**
- 🧪 Besoin de nouveaux utilisateurs de test
- 🧪 Après un reset complet de la database

**Ce qu'il fait :**
- ✅ Crée 3 utilisateurs dans `auth.users`
- ✅ Crée les entrées correspondantes dans `public.users`
- ✅ Crée les profiles dans `public.profiles`
- ✅ Utilise la fonction `create_test_user()`

**Identifiants créés :**
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@tennis-club.fr` | `Admin123!` |
| Membre | `membre@tennis-club.fr` | `Membre123!` |
| Moniteur | `moniteur@tennis-club.fr` | `Moniteur123!` |

---

## 📚 DOCUMENTATION

### **`START-SUPABASE.md`** - **DÉMARRER SUPABASE LOCAL**

**Quand l'utiliser :**
- 🚀 Premier démarrage de Supabase
- 🚀 Après un `supabase stop`
- 🚀 Si Docker n'est pas démarré

**Contenu :**
- Instructions étape par étape
- Commandes de démarrage
- Vérification du statut
- Dépannage

---

### **`FIX-AUTH-INSTRUCTIONS.md`** - **INSTRUCTIONS DE RÉPARATION**

**Quand l'utiliser :**
- 🔧 Problème d'authentification persistant
- 🔧 Besoin d'instructions détaillées

**Contenu :**
- Causes possibles
- Solutions étape par étape
- Commandes de diagnostic
- Tests de vérification

---

### **`README-REPARATION.md`** - **GUIDE DE RÉPARATION**

**Quand l'utiliser :**
- 📖 Comprendre la réparation effectuée
- 📖 Référence pour les prochaines réparations

**Contenu :**
- Problème résolu
- Solution en 3 étapes
- Vérification post-réparation
- Dépannage

---

### **`ANALYSE-ERREUR-AUTH.md`** - **ANALYSE DE L'ERREUR AUTH**

**Quand l'utiliser :**
- 📚 Comprendre l'erreur "Database error querying schema"
- 📚 Historique du debug

**Contenu :**
- Analyse de l'erreur
- Cause racine
- Solution appliquée

---

### **`test-auth-api.md`** - **TEST API AUTH**

**Quand l'utiliser :**
- 🧪 Tester l'API Auth avec curl
- 🧪 Vérifier que l'authentification fonctionne

**Contenu :**
- Commandes curl de test
- Résultats attendus
- Interprétation des réponses

---

### **`test-auth-connexion.sh`** - **SCRIPT DE TEST BASH**

**Quand l'utiliser :**
- 🧪 Test rapide de la connexion
- 🧪 Automation des tests

**Comment l'utiliser :**
```bash
chmod +x test-auth-connexion.sh
./test-auth-connexion.sh
```

---

## 📁 STRUCTURE DES SCRIPTS

```
scripts/
├── README.md                      ← Ce fichier
├── repair-auth-complete.sql       ← ⭐ PRINCIPAL - Réparation Auth
├── fix-auth-email-change.sql      ← 🔧 Fix NULL columns
├── create-test-users.sql          ← 👥 Utilisateurs test
├── START-SUPABASE.md              ← 🚀 Démarrage Supabase
├── FIX-AUTH-INSTRUCTIONS.md       ← 📚 Instructions détaillées
├── README-REPARATION.md           ← 📚 Guide de réparation
├── ANALYSE-ERREUR-AUTH.md         ← 📚 Analyse erreur
├── test-auth-api.md               ← 🧪 Test API
└── test-auth-connexion.sh         ← 🧪 Script bash
```

---

## 🚀 QUICK START

### **Problème : "Database error querying schema"**

```bash
# 1. Exécuter le script de réparation
# Dans Supabase SQL Editor :
\i repair-auth-complete.sql

# 2. Si erreur persiste, exécuter le fix
\i fix-auth-email-change.sql

# 3. Redémarrer Supabase
npx supabase stop && npx supabase start

# 4. Tester la connexion
./test-auth-connexion.sh
```

---

### **Problème : Utilisateurs manquants**

```bash
# Exécuter le script de création
# Dans Supabase SQL Editor :
\i create-test-users.sql
```

---

### **Problème : Supabase ne démarre pas**

```bash
# 1. Vérifier Docker
docker ps

# 2. Lire le guide de démarrage
code START-SUPABASE.md

# 3. Redémarrer Docker Desktop
# Puis :
npx supabase start
```

---

## 📊 HISTORIQUE DES SCRIPTS

| Date | Script | Raison |
|------|--------|--------|
| 2026-04-01 | `repair-auth-complete.sql` | Réparation complète Auth |
| 2026-04-01 | `fix-auth-email-change.sql` | Fix NULL columns |
| 2026-04-01 | `create-test-users.sql` | Utilisateurs test |
| ~~22 scripts~~ | **SUPPRIMÉS** | Obsolètes / Anciennes versions |

---

## 🧹 NETTOYAGE

**22 scripts obsolètes ont été supprimés :**
- Anciennes versions de réparation Auth
- Scripts de diagnostic (intégrés dans repair-auth)
- Scripts de vérification (plus utiles)
- Scripts de setup (obsolètes)

**Seuls les scripts UTILES et ACTUELLEMENT UTILISÉS sont conservés.**

---

**Document généré automatiquement.**  
**Prochaine révision :** Après Dashboard Membre
