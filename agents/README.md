# 🤖 Système d'Agents - Mode d'Emploi

**Projet :** Tennis Club François
**Lead Dev Agentique :** Système multi-agents pour transformation Stitch → Production

---

## 📁 Structure des Agents

```
agents/
├── agent-orchestrateur.md    # 🎯 Lead Dev - Coordination globale
├── agent-architecte.md       # 🏗️ Data & Schema - SQL, Drizzle, Zod, RLS
├── agent-logic.md            # ⚙️ Backend - Server Actions, Validation, Auth
└── agent-security-wiring.md  # 🛡️ Frontend - UI, useActionState, Middleware

docs/
├── PROJECT_TRACKER.md        # Suivi de projet
├── RLS_POLICIES.md           # Politiques de sécurité
└── PROJECT_ROADMAP.md        # Roadmap produit
```

---

## 🚀 Comment Utiliser les Agents

### Méthode 1 : Agent Unique (Tâche Spécifique)

**Pour l'Agent Architecte :**
```
Voici un export Stitch. Agis en tant qu'Agent Architecte selon ton protocole 
(.obsidian/agents/agent-architecte.md).

Écran à traiter : [Nom de l'écran]
Fichiers Stitch : [Joindre les composants React]

Livre-moi :
1. Le schéma Drizzle
2. Les migrations SQL
3. Les schémas Zod
4. Les politiques RLS
```

**Pour l'Agent Logic :**
```
Voici les schémas Zod de l'Agent Architecte. Agis en tant qu'Agent Logic 
selon ton protocole (.obsidian/agents/agent-logic.md).

Fonctionnalités à implémenter : [CRUD, Auth, etc.]
Schémas : [Joindre schema.ts]

Livre-moi :
1. Les Server Actions typées
2. La gestion d'erreur standardisée
3. La revalidation de cache
```

**Pour l'Agent Security & Wiring :**
```
Voici les Server Actions de l'Agent Logic et les composants Stitch. 
Agis en tant qu'Agent Security & Wiring selon ton protocole 
(.obsidian/agents/agent-security-wiring.md).

Composants Stitch : [Joindre les fichiers]
Server Actions : [Joindre actions.ts]

Livre-moi :
1. Les formulaires avec useActionState
2. Les états de loading/error
3. La protection middleware
```

---

### Méthode 2 : Orchestration Complète (Recommandé)

```
🎯 PROTOCOLE COMPLET - Transformation Export Stitch

Je vais te fournir un export Stitch. Applique le protocole d'orchestration 
en 3 phases selon les agents définis dans .obsidian/agents/

📦 EXPORT STITCH : [Joindre le .zip ou les fichiers]

🎯 ÉCRAN(S) À TRAITER : 
- [ ] Login / Inscription
- [ ] Dashboard
- [ ] [Autre écran]

---

## PHASE 1 : AGENT ARCHITECTE
Analyse l'UI et produis :
- [ ] Schéma Drizzle ORM
- [ ] Migrations SQL
- [ ] Schémas Zod
- [ ] Politiques RLS

## PHASE 2 : AGENT LOGIC
Crée le backend sécurisé :
- [ ] Server Actions avec validation Zero-Trust
- [ ] Gestion de session @supabase/ssr
- [ ] Pattern de réponse uniforme { success, data, error, code }
- [ ] Revalidation de cache (revalidatePath/revalidateTag)

## PHASE 3 : AGENT SECURITY & WIRING
Intègre sans casser le design :
- [ ] useActionState sur les formulaires
- [ ] États de loading + feedback erreurs
- [ ] middleware.ts de protection
- [ ] error.tsx boundaries

---

## ✅ VALIDATION FINALE
Avant de livrer, vérifie :
- [ ] tsc --noEmit = 0 erreur
- [ ] ESLint = 0 warning
- [ ] Aucune clé NEXT_PUBLIC_ sensible exposée
- [ ] Design Stitch préservé visuellement
```

---

## 🎯 Exemples de Prompts par Écran

### Écran de Connexion
```
📋 SPÉCIFICITÉS LOGIN - Priorités Agent Architecte :

Tables à créer :
- users (id, email, hashed_password, created_at, updated_at)
- sessions (id, user_id, refresh_token, expires_at)

Politiques RLS critiques :
- users : lecture/écriture uniquement par le propriétaire
- sessions : lecture seule par le propriétaire

Schémas Zod :
- LoginSchema : email + password (min 8 chars, 1 maj, 1 chiffre)
- RegisterSchema : email + password + confirmation

Server Actions requises :
- login(email, password) → { success, session?, error, code }
- register(email, password) → { success, user?, error, code }
- logout() → { success, error, code }
- resetPassword(email) → { success, error, code }

Points de vigilance :
- ⚠️ Hasher le mot de passe (bcrypt/argon2)
- ⚠️ Rate limiting sur les tentatives
- ⚠️ Redirection middleware si déjà authentifié
```

### Écran Dashboard
```
📋 SPÉCIFICITÉS DASHBOARD - Priorités Agent Architecte :

Tables potentielles :
- projects (id, name, description, user_id, created_at, updated_at)
- tasks (id, title, status, priority, due_date, project_id, user_id)

Politiques RLS critiques :
- projects : lecture/écriture propriétaire + collaborateurs (table pivot)
- tasks : même logique que projects + visibilité équipe

Schémas Zod :
- ProjectSchema : name (1-100), description (0-1000), status (enum)
- TaskSchema : title (1-200), status (enum), priority (1-5), due_date (future)

Server Actions requises :
- CRUD complet projects + tasks
- Bulk operations (move multiple tasks)
- Real-time subscriptions (optionnel)

Points de vigilance :
- ⚠️ Pagination des listes (cursor-based)
- ⚠️ Optimistic updates pour UX fluide
- ⚠️ Cache tags pour invalidation précise
```

---

## 🛠️ Workflow de Validation (Definition of Done)

Chaque agent **DOIT** valider sa checklist avant de passer la main :

### Agent Architecte → Agent Logic
- [ ] Schéma Drizzle validé par `drizzle-kit check`
- [ ] Migrations générées et appliquées en local
- [ ] Schémas Zod exportés et typés correctement
- [ ] Politiques RLS documentées dans `docs/RLS_POLICIES.md`

### Agent Logic → Agent Security & Wiring
- [ ] Toutes les Server Actions typées avec `ActionResult<T>`
- [ ] Tests unitaires des validations Zod
- [ ] Session récupérée via `@supabase/ssr` uniquement
- [ ] Codes d'erreur standardisés implémentés

### Agent Security & Wiring → Production
- [ ] Tests E2E des formulaires (loading, success, error)
- [ ] Audit visuel : pas de régression design Stitch
- [ ] Scan de sécurité : pas de fuite de clés secrètes
- [ ] Accessibilité : ARIA labels, navigation clavier

---

## 📊 Tableau de Suivi

| Écran | Architecte | Logic | Wiring | Tests | Prod |
|-------|------------|-------|--------|-------|------|
| Login | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Dashboard | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Settings | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**Légende :** ⬜ Pending | 🔄 In Progress | ✅ Done

---

## 💡 Bonnes Pratiques

1. **Toujours commencer par l'Agent Architecte** : Le schéma de données est la fondation
2. **Ne jamais sauter la validation Zod** : C'est la garantie Zero-Trust
3. **Préserver le design Stitch** : L'Agent Wiring ne doit pas casser l'UI
4. **Tester chaque phase** : Ne pas accumuler les bugs avant validation
5. **Documenter les RLS** : La sécurité doit être auditable

---

## 🔗 Références

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)
- [React 19 useActionState](https://react.dev/reference/react/useActionState)
