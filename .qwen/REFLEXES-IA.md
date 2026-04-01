# 🤖 Réflexes IA - Tennis Club du François

**Date de création :** 2026-04-01  
**Objectif :** Guider l'IA pour qu'elle ait les bons réflexes dès le début d'une nouvelle discussion

---

## 🎯 Contexte du Projet

- **Framework :** Next.js 16+ (App Router)
- **Database :** Supabase Local (Docker)
- **Auth :** Supabase Auth (SSR)
- **Styling :** Tailwind CSS v4 + Design Stitch
- **État :** Dashboard Admin ✅ LIVRÉ, Dashboard Membre ⬜ À faire

---

## 🤖 Réflexes IA Obligatoires

### 1. ✅ Automatiser l'Exécution SQL

**QUAND :** Tu crées un script SQL  
**ALORS :** Exécute-le directement via Docker

```bash
# ❌ À NE PAS FAIRE
"Ouvre Supabase SQL Editor et copie ce script..."

# ✅ À FAIRE
cat scripts/mon-script.sql | docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres
```

**Pourquoi :** Gain de temps, reproductible, moins d'erreurs

---

### 2. ✅ Vérifier Automatiquement le Build

**QUAND :** Tu modifies des fichiers TypeScript/React  
**ALORS :** Lance `npm run build` et `tsc --noEmit`

```bash
cd tennis-club-francois && npm run build && npx tsc --noEmit
```

**Pourquoi :** Détecter les erreurs immédiatement

---

### 3. ✅ Mettre à jour la Documentation

**QUAND :** Tu livres une feature complète  
**ALORS :** Mets à jour `docs/PROJECT_TRACKER.md`

```markdown
| Écran | Architecte | Logic | Wiring | Tests | Statut |
|-------|------------|-------|--------|-------|--------|
| Dashboard Admin | ✅ | ✅ | ✅ | ⬜ | LIVRÉ |
```

**Pourquoi :** Suivi précis de l'avancement

---

### 4. ✅ Proposer des Scripts Shell Réutilisables

**QUAND :** Une commande est utile et réutilisable  
**ALORS :** Crée un script shell dans `/scripts/`

```bash
#!/bin/bash
# scripts/seed-dashboard.sh
cat scripts/seed-dashboard-admin.sql | docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres
```

**Pourquoi :** Automatiser les tâches répétitives

---

### 5. ✅ Toujours Vérifier l'Existant

**QUAND :** Tu vas modifier/créer quelque chose  
**ALORS :** Vérifie d'abord ce qui existe déjà

```bash
# Avant de créer une table
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "\dt public.*"

# Avant de créer un composant
find src -name "*.tsx" | grep -i dashboard
```

**Pourquoi :** Éviter les doublons et conflits

---

### 6. ✅ Fichiers de Référence à Connaître

| Fichier | Rôle |
|---------|------|
| `docs/00-START-HERE.md` | **FICHIER PRINCIPAL** - État du projet + méthodologie |
| `docs/PROJECT_TRACKER.md` | Suivi des écrans (15 écrans) |
| `scripts/GUIDE-SEED-DATABASE.md` | Méthodologie de remplissage DB |
| `scripts/` | Tous les scripts SQL et shell |

---

## 📋 Checklist de Démarrage (Nouvelle Discussion)

Dès le début d'une nouvelle discussion, l'IA doit :

1. **Lire le contexte** :
   ```bash
   cat docs/00-START-HERE.md | head -100
   ```

2. **Vérifier l'état actuel** :
   ```bash
   cat docs/PROJECT_TRACKER.md | grep "Statut"
   ```

3. **Identifier la prochaine tâche** :
   - Dashboard Membre ? (prochain écran P0)
   - Dashboard Moniteur ?
   - Feature spécifique ?

4. **Appliquer les réflexes** :
   - Automatiser SQL
   - Vérifier build
   - Mettre à jour docs

---

## 🚀 Commandes Utiles (À Connaître par Cœur)

### Database

```bash
# Exécuter un script SQL
cat scripts/*.sql | docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres

# Vérifier les tables
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "\dt public.*"

# Vérifier les données
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "SELECT COUNT(*) FROM public.courts;"
```

### Build & Tests

```bash
cd tennis-club-francois

# Build complet
npm run build

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Dev
npm run dev
```

### Supabase

```bash
cd /Users/mathieu/StudioProjects/tennis_web

# Démarrer
npx supabase start

# Arrêter
npx supabase stop

# Statut
npx supabase status
```

---

##  État Actuel du Projet (Résumé)

### ✅ Terminé

| Module | Fichiers | Statut |
|--------|----------|--------|
| Authentification | Login, Register, Middleware | ✅ 100% |
| Landing Page | `src/app/page.tsx` | ✅ 100% |
| Dashboard Admin | SQL, Server Actions, UI Stitch | ✅ 100% |
| Database Seed | `scripts/seed-dashboard-admin.sql` | ✅ 6 courts, 20 réservations |

### ⬜ À Faire (Par Ordre de Priorité)

| Priorité | Écran | Tables Requises |
|----------|-------|-----------------|
| **P0** | Dashboard Membre | `courts`, `reservations` (✅ existantes) |
| **P0** | Dashboard Moniteur | `cours`, `student_profiles` |
| **P1** | Gestion des Membres | `member_profiles` |
| **P1** | Planning Admin | `courts`, `reservations` (✅ existantes) |

---

## 🎯 Prochaine Action Recommandée

**Dashboard Membre** est le prochain écran logique :

1. **Tables SQL** : Déjà créées (courts, reservations) ✅
2. **Server Actions** : À créer (`getMemberDashboardData`, `createReservationAction`)
3. **UI Stitch** : `dashboard_membre_vision_des_courts_directe`
4. **Design** : Similaire à Admin mais avec vue membre

---

## 💡 Bonnes Pratiques IA

### Communication

- ✅ Être concis et direct
- ✅ Utiliser des tableaux pour les comparaisons
- ✅ Fournir des exemples concrets
- ✅ Expliquer le "pourquoi" pas juste le "comment"

### Code

- ✅ Toujours vérifier le build avant de livrer
- ✅ Comments sparingly (focus on why, not what)
- ✅ Follow existing patterns
- ✅ TypeScript strict

### Documentation

- ✅ Mettre à jour PROJECT_TRACKER.md après chaque feature
- ✅ Garder 00-START-HERE.md à jour
- ✅ Créer des guides méthodologiques (comme GUIDE-SEED-DATABASE.md)

---

##  En Cas de Doute

**Questions à se poser :**

1. "Est-ce que j'ai vérifié ce qui existe déjà ?"
2. "Est-ce que j'automatise l'exécution SQL ?"
3. "Est-ce que le build passe ?"
4. "Est-ce que la doc est à jour ?"

**Fichier à consulter :** `docs/00-START-HERE.md`

---

**Document à lire au début de CHAQUE nouvelle discussion.**  
**Object :** Rendre l'IA efficace et autonome dès le premier message.
