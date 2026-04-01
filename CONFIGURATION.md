# 🤖 Configuration des Agents - Tennis Club François

**Projet :** Tennis Club François
**Stack :** Next.js 16 + TypeScript + Tailwind 4 + Supabase + Drizzle ORM

---

## 📁 Structure des Agents

```
agents/
├── agent-orchestrateur.md    # 🎯 Lead Dev - Coordination globale
├── agent-architecte.md       # 🏗️ Data & Schema - SQL, Drizzle, Zod, RLS
├── agent-logic.md            # ⚙️ Backend - Server Actions, Auth, Validation
└── agent-security-wiring.md  # 🛡️ Frontend - UI, useActionState, Middleware

docs/
├── PROJECT_TRACKER.md        # Suivi de projet et tâches
├── RLS_POLICIES.md           # Politiques de sécurité Row Level Security
└── PROJECT_ROADMAP.md        # Roadmap produit (à créer)
```

---

## 🚀 Comment Utiliser le Système d'Agents

### Mode 1 : Orchestration Complète (Recommandé)

Pour démarrer une nouvelle fonctionnalité, utilise ce prompt :

```
@agent-orchestrateur

🎯 NOUVELLE FEATURE : [Nom de la fonctionnalité]

📋 CONTEXTE :
- Écran : [Nom de l'écran]
- Description : [Ce que doit faire la feature]
- Priorité : P0/P1/P2

📦 ENTRÉE :
- [ ] Export Stitch fourni
- [ ] Schémas existants
- [ ] Maquettes

---

Démarre le protocole complet en 3 phases selon ta documentation.
```

### Mode 2 : Agent Spécialisé

Pour une tâche spécifique, appelle l'agent concerné :

```
@agent-architecte
Crée le schéma de données pour [feature] selon ton protocole.
```

```
@agent-logic
Implémente les Server Actions pour [feature] avec validation Zero-Trust.
```

```
@agent-security-wiring
Intègre [feature] dans l'UI avec useActionState et gestion des erreurs.
```

---

## ✅ Checklist de Démarrage

### Environnement

- [ ] Docker Desktop lancé (icône baleine 🐳 visible)
- [ ] Supabase local ou cloud configuré
- [ ] Variables d'environnement dans `.env.local`
- [ ] `npm install` exécuté

### Projet

- [ ] `docs/PROJECT_TRACKER.md` à jour
- [ ] `docs/RLS_POLICIES.md` documenté
- [ ] Agents configurés dans `agents/`

---

## 📊 Workflow Type

```
1. @agent-orchestrateur analyse la demande
   ↓
2. @agent-architecte crée le schéma de données
   ↓ (après validation drizzle-kit check)
3. @agent-logic implémente les Server Actions
   ↓ (après validation tests unitaires)
4. @agent-security-wiring intègre l'UI
   ↓ (après validation build + audit visuel)
5. @agent-orchestrateur valide la livraison
```

---

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Lance le serveur de dev
npm run build            # Build de production
npm run start            # Start serveur prod

# Qualité
npm run lint             # ESLint
npm run type-check       # TypeScript

# Database
npx drizzle-kit check    # Vérifie le schéma
npx drizzle-kit migrate  # Applique les migrations
npx drizzle-kit studio   # UI de gestion de DB

# Docker (Supabase local)
docker-compose up -d     # Lance Supabase local
docker-compose down      # Arrête Supabase
```

---

## 🔗 Liens Utiles

- **Repo :** `/Users/mathieu/StudioProjects/tennis_web/tennis-club-francois`
- **Supabase Dashboard :** [À configurer]
- **Drizzle Studio :** `http://localhost:3000` (après `drizzle-kit studio`)

---

## 📚 Documentation des Agents

| Agent | Rôle | Checklist | Livrables |
|-------|------|-----------|-----------|
| [Orchestrateur](./agent-orchestrateur.md) | Lead Dev | ✅ | Roadmap, Validation |
| [Architecte](./agent-architecte.md) | Data/SQL | ✅ | Schéma, Migrations, Zod, RLS |
| [Logic](./agent-logic.md) | Backend | ✅ | Server Actions, Validation |
| [Security & Wiring](./agent-security-wiring.md) | Frontend | ✅ | UI, Middleware, Error Boundaries |

---

## 🎯 Prochaine Étape

Pour démarrer le projet, lance :

```bash
# 1. Vérifier l'environnement
docker info

# 2. Lancer le serveur de dev
npm run dev

# 3. Consulter le PROJECT TRACKER
open docs/PROJECT_TRACKER.md
```

Puis utilise le prompt d'orchestration pour la première feature :

```
@agent-orchestrateur

🎯 NOUVELLE FEATURE : Système d'authentification

📋 CONTEXTE :
- Écrans : Login, Register, Password Reset
- Description : Auth complète avec Supabase
- Priorité : P0

Démarre le protocole complet.
```
