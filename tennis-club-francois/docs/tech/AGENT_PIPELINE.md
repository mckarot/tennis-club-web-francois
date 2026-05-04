# 🤖 Pipeline d'Agents — Tennis Club du François
**Version :** 1.0  
**Date :** 2 avril 2026  
**Objectif :** Orchestrer des agents spécialisés pour accélérer le développement, maintenir la qualité et assurer la cohérence du projet.

---

## 🏗️ Architecture du Pipeline (.agent/)

Les agents, skills et workflows sont situés dans le dossier racine `.agent/` pour être reconnus nativement par le système d'orchestration.

```
.agent/
├── orchestrator.md          🎭 Chef d'orchestre
├── design_agent.md          🎨 Intégrateur Stitch
├── db_agent.md              🗄️ Architecte Base de Données
├── security_agent.md        🔐 Gardien Sécurité
├── dev_agent.md             ⚙️ Développeur Fonctionnel
├── test_agent.md            🧪 Validateur Qualité
├── skills/                  📂 Compétences techniques
└── workflows/               📂 Processus automatisés
```

---

## 🎯 Agents Disponibles
┌─────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR AGENT                     │
│              Reçoit les demandes, planifie,              │
│               délègue, valide, synthétise                │
└────────┬────────┬────────┬────────┬────────┬────────────┘
         │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼
    ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
    │ DESIGN │ │  DB  │ │ SEC  │ │ DEV  │ │   TEST   │
    │ AGENT  │ │AGENT │ │AGENT │ │AGENT │ │  AGENT   │
    └────────┘ └──────┘ └──────┘ └──────┘ └──────────┘
    Stitch →   Schema  RLS +     Next.js   Vitest +
    Next.js    Migrations Middleware Components  E2E
```

---

## 🎯 Agents Disponibles

### 🎭 `ORCHESTRATOR` — Chef d'Orchestre
**Rôle :** Point d'entrée unique. Analyse la demande, consulte le PROJECT_TRACKER, sélectionne et délègue aux agents spécialisés.

**Déclencheur :** Toute nouvelle demande de fonctionnalité ou tâche.

**Instructions :**
```
Tu es l'orchestrateur du projet "Tennis Club du François".
À chaque demande :
1. Consulte /docs/PROJECT_TRACKER.md pour le contexte
2. Consulte /docs/tech/AUDIT_COMPLET.md pour les priorités
3. Identifie quel(s) agent(s) sont nécessaires
4. Délègue avec un brief précis (contexte + objectif + contraintes)
5. Valide que le résultat est cohérent avec le design Stitch
6. Mets à jour PROJECT_TRACKER.md en fin de session

Fichiers de référence à toujours consulter en priorité :
- docs/PROJECT_TRACKER.md
- docs/tech/AUDIT_COMPLET.md
- docs/tech/DATABASE.md
- docs/tech/RLS_AUDIT.md
```

---

### 🎨 `DESIGN_AGENT` — Intégrateur Stitch
**Rôle :** Transformer les écrans Stitch en composants Next.js/Tailwind v4 fidèles au design system.

**Spécialités :**
- Lecture des fichiers `code.html` dans `/stitch_connexion_membres_admin/*/`
- Conversion HTML statique → composants React/TSX
- Respect du Design System (couleurs Stitch, Material Symbols, `font-['Lexend']`)
- Composants réutilisables dans `src/components/`

**Brief type :**
```
[DESIGN_AGENT]
Écran source : /stitch_connexion_membres_admin/planning_des_courts_admin/code.html
Destination : src/app/dashboard/admin/planning/page.tsx + composants
Contraintes :
- Tout en français
- Utiliser les classes Tailwind du design system existant
- Material Symbols pour les icônes
- Gérer les états vide / chargement / erreur
```

**Checklist de sortie :**
- [ ] Composant TSX compilable sans erreur
- [ ] Tous les textes en français
- [ ] Icônes Material Symbols (pas d'emoji)
- [ ] États vide et chargement gérés
- [ ] Props typées avec TypeScript strict

---

### 🗄️ `DB_AGENT` — Architecte Base de Données
**Rôle :** Concevoir, migrer et optimiser le schéma Supabase.

**Spécialités :**
- Rédaction de migrations SQL (`supabase/migrations/`)
- Mise à jour du seed (`supabase/seed.sql`)
- Génération des types TypeScript depuis le schéma
- Optimisation des index et des jointures

**Brief type :**
```
[DB_AGENT]
Besoin : Ajouter la table `cours` pour les cours collectifs
Référence schéma : docs/tech/DATABASE.md
Contraintes :
- Respecter les conventions de nommage existantes (snake_case, user_id)
- Créer la migration dans supabase/migrations/YYYYMMDD_add_cours.sql
- Mettre à jour le seed avec des données de test réalistes
- Générer les nouveaux types TypeScript
```

**Checklist de sortie :**
- [ ] Migration SQL sans erreur de syntaxe
- [ ] Seed mis à jour
- [ ] Types TypeScript générés et ajoutés
- [ ] `docs/tech/DATABASE.md` mis à jour

---

### 🔐 `SECURITY_AGENT` — Gardien de la Sécurité
**Rôle :** Auditer et implémenter les politiques RLS, valider les Server Actions, vérifier le middleware.

**Spécialités :**
- Rédaction et vérification des politiques RLS (cf. `docs/tech/RLS_AUDIT.md`)
- Validation du middleware Next.js
- Vérification du pattern Zero-Trust dans les Server Actions
- Audit des expositions de données

**Brief type :**
```
[SECURITY_AGENT]
Tâche : Appliquer les politiques RLS du fichier docs/tech/RLS_AUDIT.md
Fichier cible : supabase/migrations/20260403000000_rls_policies.sql
Vérifier aussi : que le middleware utilise getUser() et non getSession()
Fichier middleware : middleware.ts
```

**Checklist de sortie :**
- [ ] Politiques RLS appliquées pour chaque table
- [ ] `getSession()` remplacé par `getUser()` dans le middleware
- [ ] Aucune Server Action n'expose de données sans vérification d'auth
- [ ] `docs/tech/RLS_AUDIT.md` mis à jour avec le statut

---

### ⚙️ `DEV_AGENT` — Développeur Fonctionnel
**Rôle :** Implémenter les Server Actions, la logique métier et câbler les composants React aux données.

**Spécialités :**
- Server Actions dans `src/app/dashboard/actions.ts`
- Validation Zod côté serveur
- Gestion des états de chargement/erreur dans les composants Client
- Pattern Zero-Trust : `requireAdmin()` dans chaque action admin

**Brief type :**
```
[DEV_AGENT]
Fonctionnalité : Modifier les informations d'un membre (Admin)
Backend : Ajouter `updateMemberAction(userId, data)` dans actions.ts
Frontend : Créer `EditMemberModal.tsx` dans src/components/dashboard/admin/modals/
Validation Zod : schema dans src/lib/validators/members.ts
Types : Mettre à jour MemberWithProfile si nécessaire
Référence design : gestion_des_membres_admin (modale d'édition)
```

**Checklist de sortie :**
- [ ] Server Action avec validation Zod et `requireAdmin()`
- [ ] Réponse au format `ActionResult<T>` standardisé
- [ ] Composant Client avec gestion des états (loading, success, error)
- [ ] `revalidatePath()` appelé après mutation
- [ ] Aucune console.log sensible en production

---

### 🧪 `TEST_AGENT` — Validateur Qualité
**Rôle :** Écrire et exécuter les tests pour garantir la non-régression.

**Spécialités :**
- Tests unitaires Vitest pour les Server Actions
- Tests de composants avec @testing-library/react
- Tests E2E avec Playwright (à venir)
- Vérification des cas limites (données manquantes, erreurs DB)

**Brief type :**
```
[TEST_AGENT]
Tester : getMembersAction() dans src/app/dashboard/actions.ts
Framework : Vitest (à ajouter en devDependencies)
Cas à couvrir :
  - Retourne une liste vide si aucun membre
  - Filtre correctement par rôle
  - Retourne une erreur si l'utilisateur n'est pas admin
  - Recherche par nom fonctionne (insensible à la casse)
```

---

## 📋 Workflows Prédéfinis

### Workflow A : "Nouvel Écran" 🎨
```
1. ORCHESTRATOR → analyse la demande, identifie l'écran Stitch
2. DESIGN_AGENT → convertit code.html en composants TSX
3. DB_AGENT → vérifie si de nouvelles données sont nécessaires
4. DEV_AGENT → câble les Server Actions
5. SECURITY_AGENT → vérifie les permissions RLS
6. TEST_AGENT → écrit les tests de base
7. ORCHESTRATOR → valide et met à jour PROJECT_TRACKER
```

### Workflow B : "Correction de Bug" 🐛
```
1. ORCHESTRATOR → reproduit et analyse le bug
2. DEV_AGENT → identifie et corrige la cause racine
3. SECURITY_AGENT → vérifie si le bug avait un impact sécurité
4. TEST_AGENT → ajoute un test pour prévenir la régression
5. ORCHESTRATOR → clôture le bug dans PROJECT_TRACKER
```

### Workflow C : "Audit Sécurité" 🔐
```
1. ORCHESTRATOR → déclenche l'audit
2. SECURITY_AGENT → analyse les RLS, middleware et Server Actions
3. DB_AGENT → vérifie les contraintes DB et les index
4. DEV_AGENT → corrige les vulnérabilités détectées
5. ORCHESTRATOR → met à jour RLS_AUDIT.md et PROJECT_TRACKER
```

### Workflow D : "Migration DB" 🗄️
```
1. ORCHESTRATOR → valide le besoin de migration
2. DB_AGENT → rédige la migration SQL
3. SECURITY_AGENT → vérifie les nouvelles RLS nécessaires
4. DEV_AGENT → met à jour types TypeScript et Server Actions
5. TEST_AGENT → teste les nouvelles queries
```

---

## 🚀 Comment Utiliser Ce Pipeline

### En session (chat avec Antigravity)
Préfixe ta demande avec l'agent cible pour une réponse optimisée :

```
[DESIGN_AGENT] Implémente la page Planning Admin depuis le Stitch
[DB_AGENT] Ajoute la table paiements avec les bonnes FK
[SECURITY_AGENT] Applique les RLS du fichier RLS_AUDIT.md
[DEV_AGENT] Crée la modale d'édition de membre
[ORCHESTRATOR] Démarre le Workflow A pour la page Paramètres
```

### Références à inclure dans chaque brief
Pour que l'agent soit le plus efficace possible, toujours préciser :
- **Fichier source** (Stitch, migration, composant existant)
- **Fichier de destination**
- **Contraintes** (langue, design system, sécurité)
- **Critères de succès** (checklist)

---

## 📊 Suivi des Agents Activés

| Date | Workflow | Agent | Tâche | Statut |
|---|---|---|---|---|
| 2026-04-02 | B (Bug) | DEV_AGENT | Fix ReservationModal + user lookup | ✅ |
| 2026-04-02 | B (Bug) | DB_AGENT | Fix trigger split nom/prénom | ✅ |
| 2026-04-02 | A (Écran) | DESIGN_AGENT | Page Gestion Membres Admin | ✅ |
| 2026-04-02 | B (Bug) | DEV_AGENT | SidebarNav surbrillance active | ✅ |
| 2026-04-03 | C (Audit) | ORCHESTRATOR | Audit complet + docs tech | 🔄 |

---

## 🗺️ Feuille de Route Agents (Prochaines Sessions)

| Priorité | Agent | Tâche |
|---|---|---|
| 🔴 P0 | SECURITY_AGENT | Appliquer RLS corrigées (RLS_AUDIT.md) |
| 🔴 P0 | DEV_AGENT | Fix middleware `getUser()` |
| 🟠 P1 | DESIGN_AGENT | Page Planning Admin (Stitch disponible) |
| 🟠 P1 | DEV_AGENT | Modale édition de membre |
| 🟡 P2 | DESIGN_AGENT | Dashboard Membre complet |
| 🟡 P2 | DESIGN_AGENT | Dashboard Moniteur complet |
| 🟡 P2 | TEST_AGENT | Ajouter Vitest + premiers tests |
