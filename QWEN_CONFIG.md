# 🤖 Configuration Qwen Code - Tennis Club François

**Projet :** Tennis Club François  
**Stack :** Next.js 16 + TypeScript + Tailwind 4 + Supabase + Drizzle ORM

---

## 📋 Rôles des Agents Spécialisés

Ce projet utilise un système multi-agents pour transformer les exports Stitch en application production-ready.

### 🎯 Agent Orchestrateur (Lead Dev)
- Coordonne les 3 agents spécialisés
- Valide les livrables de chaque phase
- Garantit la cohérence globale
- **Fichier :** `.qwen/agent/agent-orchestrateur.md`

### 🏗️ Agent Architecte (Data & SQL)
- Crée les schémas Drizzle ORM
- Génère les migrations SQL
- Définit les schémas Zod
- Documente les politiques RLS
- **Fichier :** `.qwen/agent/agent-architecte.md`

### ⚙️ Agent Logic (Backend)
- Implémente les Server Actions
- Validation Zero-Trust avec Zod
- Gestion de session Supabase SSR
- Pattern de réponse uniforme
- **Fichier :** `.qwen/agent/agent-logic.md`

### 🛡️ Agent Security & Wiring (Frontend)
- Intègre `useActionState` dans l'UI
- États loading/error/success
- Configure `middleware.ts`
- Error boundaries
- **Fichier :** `.qwen/agent/agent-security-wiring.md`

---

## 🚀 Comment Utiliser le Système

### Mode 1 : Orchestration Complète (Recommandé)

Pour une nouvelle fonctionnalité :

```
🎯 NOUVELLE FEATURE : [Nom]

📋 CONTEXTE :
- Écran : [Nom]
- Description : [Ce que doit faire la feature]
- Priorité : P0/P1/P2

Démarre le protocole complet en 3 phases.
```

### Mode 2 : Agent Spécialisé

Pour une tâche spécifique :

```
Agis en tant qu'Agent Architecte selon ton protocole.
Crée le schéma de données pour [feature].
```

```
Agis en tant qu'Agent Logic selon ton protocole.
Implémente les Server Actions pour [feature].
```

```
Agis en tant qu'Agent Security & Wiring selon ton protocole.
Intègre [feature] dans l'UI avec useActionState.
```

---

## ✅ Workflow de Validation

```
1. Agent Architecte → drizzle-kit check = 0 erreur
2. Agent Logic → Tests unitaires passants
3. Agent Security & Wiring → Build + audit visuel OK
4. Agent Orchestrateur → Validation finale
```

---

## 📁 Structure de Documentation

```
.qwen/agent/
├── CONFIGURATION.md       # Ce fichier
├── README.md              # Mode d'emploi général
├── agent-orchestrateur.md # Lead Dev
├── agent-architecte.md    # Data & SQL
├── agent-logic.md         # Backend
└── agent-security-wiring.md # Frontend

docs/ (à créer dans tennis-club-francois/)
├── PROJECT_TRACKER.md     # Suivi de projet
├── RLS_POLICIES.md        # Politiques de sécurité
└── PROJECT_ROADMAP.md     # Roadmap produit
```

---

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Serveur de dev
npm run build            # Build production
npm run lint             # ESLint
npm run type-check       # TypeScript

# Database
npx drizzle-kit check    # Vérifie le schéma
npx drizzle-kit migrate  # Applique migrations
npx drizzle-kit studio   # UI gestion DB

# Docker (Supabase local)
docker-compose up -d     # Lance Supabase
docker-compose down      # Arrête Supabase
```

---

## 📊 Checklist de Démarrage

- [ ] Docker Desktop lancé (icône baleine 🐳 visible)
- [ ] Supabase local ou cloud configuré
- [ ] Variables d'environnement dans `.env.local`
- [ ] `npm install` exécuté
- [ ] `docs/PROJECT_TRACKER.md` à jour

---

## 🎯 Prochaine Étape

Pour démarrer une feature, utilise le prompt d'orchestration :

```
🎯 NOUVELLE FEATURE : [Nom]

📋 CONTEXTE :
- Écran : [Nom]
- Description : [Ce que doit faire la feature]
- Priorité : P0/P1/P2

Démarre le protocole complet en 3 phases selon les agents configurés.
```
