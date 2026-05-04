# 🤖 Réflexes IA - Tennis Club du François

**Date de création :** 2026-04-01  
**Date de mise à jour :** 2026-04-01 (v2 - Agents + Logging)  
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

### 0. ✅ TOUJOURS Utiliser les Agents Spécialisés

**QUAND :** Tu commences une tâche complexe ou spécifique  
**ALORS :** Utilise l'agent spécialisé approprié AVANT de coder

| Agent | Quand l'utiliser | Exemple |
|-------|------------------|---------|
| **`architecte-supabase`** | Schéma DB, RLS, Auth, relations tables | "Créer tables pour gestion membres" |
| **`data-schema-architect`** | Transformer UI Stitch → Schéma PostgreSQL | "Générer DB depuis composants Stitch" |
| **`db-reviewer`** | Review SQL, audit sécurité RLS | "Vérifier ce script SQL avant exécution" |
| **`orchestrator-lead`** | Coordonner multi-agents, gros chantiers | "Transformer export Stitch en app complète" |
| **`server-actions-builder`** | Server Actions avec validation Zero-Trust | "Créer mutations DB sécurisées" |
| **`sql-generator`** | Générer scripts SQL production-ready | "Créer table profiles avec RLS" |
| **`stitch-ui-integrator`** | Intégrer backend dans UI Stitch | "Connecter formulaire à Server Action" |
| **`agent-logger`** | **Logs de debug** dans Server Actions et Pages | "Ajouter logs de debug dans Dashboard Admin" |
| **`general-purpose`** | Recherche code, tâches multi-étapes | "Trouver toutes les Server Actions" |
| **`Explore`** | Explorer codebase rapidement | "Trouver tous les components dashboard" |

**Pourquoi :** Qualité, sécurité, cohérence, gain de temps

```bash
# ❌ À NE PAS FAIRE
Coder directement sans réfléchir à l'architecture

# ✅ À FAIRE
1. Identifier le type de tâche
2. Choisir l'agent spécialisé
3. Lui donner un prompt détaillé
4. Valider le livrable
5. Intégrer dans le codebase
```

---

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

### 6. ✅ Utiliser l'Agent Logger pour le Debugging

**QUAND :**
- Tu crées une nouvelle Server Action
- Tu crées une nouvelle Page/Layout
- Tu débogues un problème de données
- Tu fais une review de code

**ALORS :** Invoque `@agent-logger` pour implémenter le protocole de logging structuré

**Comment invoquer l'agent :**

```bash
# Exemple 1 : Nouvelle Server Action
@agent-logger "Crée la Server Action getMemberDashboardData avec les logs de debug complets"

# Exemple 2 : Ajouter des logs existants
@agent-logger "Ajoute les logs de debug dans src/app/dashboard/actions.ts"

# Exemple 3 : Débogage
@agent-logger "Les données ne s'affichent pas dans le dashboard, ajoute des logs pour tracer le problème"

# Exemple 4 : Review
@agent-logger "Vérifie que tous les logs sont correctement implémentés dans le Dashboard Admin"
```

**Protocole de Logging à respecter :**

| Niveau | Méthode | Quand l'utiliser | Exemple |
|--------|---------|------------------|---------|
| **Log** | `console.log()` | Flux d'exécution normal | Entrée/sortie de fonction |
| **Info** | `console.info()` | Données importantes | Résultats d'API, données brutes |
| **Warn** | `console.warn()` | Situations inattendues non bloquantes | Valeur par défaut utilisée |
| **Error** | `console.error()` | Erreurs critiques | Échec d'appel API, exception |

**Structure des logs :**

```typescript
// ✅ TOUJOURS préfixer par le contexte
console.log('[Admin Dashboard] Entrée dans getAdminDashboardData...');
console.info('[Admin Dashboard] Données brutes:', data);
console.error('[Admin Dashboard] Erreur Supabase (reservations):', error);

// ❌ À NE PAS FAIRE
console.log('Erreur dans la fonction');
console.log(data);
```

**Pourquoi :** Débogage rapide, traçabilité complète, logs cohérents dans toute l'app

---

### 7. ✅ Appliquer le Protocole de Logging (Manuel)

**QUAND :** Tu crées/modifies une Server Action ou un composant Page ET tu n'as pas invoqué l'agent logger  
**ALORS :** Implémente manuellement le logging structuré comme défini dans `docs/LOGGING_PROTOCOL.md`

**Règles :**
1. **Prefixe chaque log** : `[Contexte] Description`
2. **Niveaux de log** :
   - `console.log()` : Flux d'exécution (entrée fonction)
   - `console.info()` : Données importantes (résultats API)
   - `console.warn()` : Situations inattendues non bloquantes
   - `console.error()` : Erreurs critiques avec détails

**Exemple Server Action :**
```typescript
export async function getAdminDashboardData() {
  console.log('[Admin Dashboard] Entrée dans getAdminDashboardData...');
  
  try {
    // ... code ...
    
    console.info('[Admin Dashboard] Données brutes:', data);
    
    if (error) {
      console.error('[Admin Dashboard] Erreur Supabase:', error);
    }
  } catch (error) {
    console.error('[Admin Dashboard] ERREUR FATALE:', error);
  }
}
```

**Exemple Composant Page :**
```typescript
export default async function AdminDashboardPage() {
  console.log('[Client Page] Rendu de AdminDashboardPage.');
  
  const result = await getAdminDashboardData();
  console.info('[Client Page] Résultat Server Action:', result);
  
  if (!result.success) {
    console.error('[Client Page] Erreur serveur:', result.error);
  }
  
  console.info('[Client Page] Données pour rendu:', data);
}
```

**Pourquoi :** Débogage rapide, traçabilité complète

---

### 8. ✅ Fichiers de Référence à Connaître

| Fichier | Rôle |
|---------|------|
| `docs/00-START-HERE.md` | **FICHIER PRINCIPAL** - État du projet + méthodologie |
| `docs/PROJECT_TRACKER.md` | Suivi des écrans (15 écrans) |
| `docs/LOGGING_PROTOCOL.md` | **Protocole de logging** - À appliquer dans TOUTES les pages |
| `docs/DEBUGGING_GUIDE.md` | **Guide de debugging** - Scénarios courants + checklist |
| `agents/agent-logger.md` | **Agent spécialisé** - Logs de debug dans Server Actions et Pages |
| `scripts/GUIDE-SEED-DATABASE.md` | Méthodologie de remplissage DB |
| `scripts/` | Tous les scripts SQL et shell |
| `.qwen/REFLEXES-IA.md` | **CE FICHIER** - Réflexes IA à appliquer |

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

4. **Choisir l'agent spécialisé** (si tâche complexe) :
   - DB/Schema → `architecte-supabase` ou `data-schema-architect`
   - Server Actions → `server-actions-builder`
   - UI Stitch → `stitch-ui-integrator`
   - SQL → `sql-generator`
   - Review → `db-reviewer`
   - **Logs/Debug → `agent-logger`**

5. **Appliquer les réflexes** :
   - Automatiser SQL
   - Vérifier build
   - Mettre à jour docs
   - **Invoquer @agent-logger pour les logs**

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
- ✅ **Logging structuré dans chaque Server Action et Page**

### Documentation

- ✅ Mettre à jour PROJECT_TRACKER.md après chaque feature
- ✅ Garder 00-START-HERE.md à jour
- ✅ Créer des guides méthodologiques (comme GUIDE-SEED-DATABASE.md)
- ✅ **Appliquer LOGGING_PROTOCOL.md dans tout nouveau code**

---

## 🐛 En Cas de Doute / Debug

**Questions à se poser :**

1. "Est-ce que j'ai vérifié ce qui existe déjà ?"
2. "Est-ce que j'automatise l'exécution SQL ?"
3. "Est-ce que le build passe ?"
4. "Est-ce que la doc est à jour ?"
5. **"Est-ce que j'ai invoqué @agent-logger pour les logs ?"**

**Logs à vérifier en priorité :**
```bash
# Terminal (logs serveur)
npm run dev 2>&1 | grep -E "\[.*\]"

# Navigateur (logs client)
# Ouvrir Console (F12) → Filtrer par "[Client Page]"
```

**Fichiers à consulter :**
- `docs/00-START-HERE.md` (état du projet)
- `docs/LOGGING_PROTOCOL.md` (protocole de logging)
- `docs/DEBUGGING_GUIDE.md` (guide complet de debugging)
- `agents/agent-logger.md` (agent spécialisé pour les logs)

---

## 🤖 Agents Spécialisés - Guide Rapide

### Quand utiliser quel agent ?

| Type de tâche | Agent à utiliser | Prompt type |
|---------------|------------------|-------------|
| **Créer tables DB + RLS** | `architecte-supabase` | "Créer schéma pour X avec politiques RLS" |
| **Transformer UI → DB** | `data-schema-architect` | "Générer tables PostgreSQL depuis composants Stitch" |
| **Review SQL** | `db-reviewer` | "Auditer ce script SQL (sécurité, perf, RLS)" |
| **Gros chantier multi-agents** | `orchestrator-lead` | "Coordonner transformation export Stitch → app" |
| **Server Actions (mutations)** | `server-actions-builder` | "Créer Server Action pour X avec validation Zero-Trust" |
| **Scripts SQL production** | `sql-generator` | "Générer script SQL pour table X avec RLS" |
| **Connecter UI → Backend** | `stitch-ui-integrator` | "Intégrer Server Action dans composant Stitch" |
| **🪵 Logs de debug** | `agent-logger` | "Ajouter logs de debug dans Server Actions et Pages" |
| **Recherche code** | `Explore` | "Trouver tous les composants X dans le codebase" |
| **Tâche complexe multi-étapes** | `general-purpose` | "Rechercher X et faire Y" |

---

**Document à lire au début de CHAQUE nouvelle discussion.**  
**Objectif :** Rendre l'IA efficace, autonome, et cohérente dès le premier message.

**Mise à jour v3 :** Ajout agent-logger comme réflexe obligatoire + section debugging enrichie
