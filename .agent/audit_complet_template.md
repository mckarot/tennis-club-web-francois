# 🔍 AUDIT & SPECS DU PROJET (Supabase Stack)
> Remplir ce document en Gate 0, avant toute ligne de code.

---

## 📦 STACK & DÉPENDANCES CRITIQUES

| Package | Version exacte | Rôle |
|---------|---------------|------|
| next | ^15.x | Framework web |
| react | ^19.x | UI |
| tailwindcss | ^4.x | Styles |
| @supabase/supabase-js | ^2.x | Client Supabase |
| @supabase/ssr | ^0.x | Cookies/session SSR + middleware |
| drizzle-orm | ^0.x | ORM type-safe |
| drizzle-kit | ^0.x | CLI migrations |
| postgres | ^3.x | Driver PostgreSQL (node-postgres) |
| zod | ^3.x (API zod/v4) | Validation schéma |
| @hookform/resolvers | ^3.x | Bridge Zod ↔ RHF |
| react-hook-form | ^7.x | Gestion formulaires |
| vitest | ^3.x | Tests unitaires & intégration |
| @playwright/test | ^1.x | Tests E2E |
| pino | ^9.x | Logger structuré |
| @upstash/ratelimit | ^2.x | Rate limiting |
| @upstash/redis | ^1.x | Redis backend |
| @faker-js/faker | ^9.x (devDependency) | Seed data réaliste |

**Environnement d'exécution :**
- Node.js : **22.x LTS**
- Package manager : **pnpm** (lockfile versionné)
- OS CI/CD : Ubuntu 24.04
- Supabase CLI : dernière version stable (`supabase --version`)

---

## 📁 STRUCTURE DE DOSSIERS

```
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, register, reset password
│   ├── (app)/                    # Routes protégées (middleware guard)
│   │   ├── dashboard/
│   │   └── admin/
│   └── api/                      # Route Handlers (webhooks uniquement)
├── src/
│   ├── actions/                  # Server Actions (une action = un fichier)
│   ├── components/
│   │   ├── ui/                   # Composants atomiques
│   │   └── features/             # Composants métier
│   ├── db/
│   │   └── schema/               # Fichiers Drizzle (un fichier par table)
│   │       ├── _helpers.ts       # timestamps, softDelete, primaryKeyUUID
│   │       └── index.ts          # Barrel export
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # createBrowserClient
│   │   │   └── server.ts         # createServerClient + createServiceClient
│   │   ├── db/
│   │   │   ├── client.ts         # Drizzle + anon key (RLS actif)
│   │   │   └── service.ts        # Drizzle + service role (RLS bypass)
│   │   ├── errors.ts             # Error masking
│   │   ├── logger.ts             # Pino
│   │   ├── audit.ts              # logAuditEvent
│   │   ├── tokens.ts             # Design tokens
│   │   └── types/
│   │       └── action-result.ts  # ActionResult<T>
│   ├── hooks/                    # React hooks custom
│   └── validations/              # Schémas Zod partagés (client + serveur)
├── drizzle/
│   └── migrations/               # Fichiers SQL générés par drizzle-kit generate
├── supabase/
│   ├── config.toml               # Config Supabase local
│   ├── migrations/               # Migrations SQL Supabase (RLS, triggers, extensions)
│   │   ├── 0001_rls_policies.sql
│   │   ├── 0002_storage_policies.sql
│   │   └── 0003_cron_jobs.sql
│   ├── functions/                # Edge Functions Deno
│   └── tests/                    # Tests RLS (pgTAP)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── adr/
│   └── runbooks/
└── scripts/
    └── seed.ts
```

> **Important :** Les migrations Drizzle (`/drizzle/migrations/`) gèrent le schéma des tables.
> Les migrations Supabase (`/supabase/migrations/`) gèrent RLS, triggers, extensions et Storage.
> Ces deux répertoires sont complémentaires et doivent être synchronisés.

---

## ⚙️ VARIABLES D'ENVIRONNEMENT

### `.env.local` (jamais committer)
```bash
# Supabase — local (supabase start)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé locale générée par supabase start>
SUPABASE_SERVICE_ROLE_KEY=<clé service locale>   # ⚠️ jamais NEXT_PUBLIC_

# Base de données Drizzle — local
# Session Pooler pour Server Actions/SSR
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Transaction Pooler pour Edge Functions (si applicable)
DATABASE_URL_TRANSACTION=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Pool mode : 'session' (Server Actions, SSR) ou 'transaction' (Edge Functions, PgBouncer)
DB_POOL_MODE=session

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VERSION=local
LOG_LEVEL=debug
```

### `.env.production` (injecté par CI/CD — jamais dans le dépôt)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key production>
SUPABASE_SERVICE_ROLE_KEY=<service role production>   # GitHub Secret
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
DATABASE_URL_TRANSACTION=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
NEXT_PUBLIC_APP_URL=https://monapp.com
NEXT_PUBLIC_VERSION=<injecté par CI>
LOG_LEVEL=warn
```

### Stratégie 3 environnements

| Variable | local | staging | production |
|----------|-------|---------|------------|
| Supabase Project | Docker local | Projet Supabase staging | Projet Supabase prod |
| DATABASE_URL port | 54322 | 5432 (Session Pooler) | 5432 (Session Pooler) |
| RLS | Testées (pgTAP) | Identiques à prod | — |
| Rate Limiting | Désactivé | Activé (seuils larges) | Activé (seuils stricts) |
| Log Level | debug | info | warn |
| Seed data | `pnpm db:seed` | Fixtures de test | Jamais |

---

## 🚀 PLAN DE DÉPLOIEMENT

### Supabase local — commandes de référence
```bash
# Démarrer l'environnement local
supabase start

# Appliquer les migrations Drizzle sur local
pnpm db:migrate

# Appliquer les migrations SQL Supabase (RLS, triggers)
supabase db push --local

# Tester les politiques RLS
supabase test db

# Studio local (équivalent dashboard)
supabase studio   # http://localhost:54323

# Arrêter et nettoyer
supabase stop
```

### CI/CD (GitHub Actions)
```yaml
jobs:
  quality:
    steps:
      - run: pnpm lint          # eslint --max-warnings 0
      - run: pnpm type-check    # tsc --noEmit
      - run: supabase start
      - run: pnpm db:migrate    # Migrations Drizzle sur local CI
      - run: supabase db push --local  # RLS + triggers
      - run: pnpm test          # Vitest (unit + intégration contre local)
      - run: pnpm build         # next build
      - run: supabase stop

  deploy-staging:
    needs: quality
    steps:
      - run: supabase db push --project-ref $STAGING_PROJECT_REF  # RLS staging
      - run: pnpm db:migrate    # Migrations Drizzle staging (DATABASE_URL staging)
      - run: vercel deploy --env staging

  deploy-production:
    needs: quality
    if: github.ref == 'refs/heads/main'
    steps:
      - run: supabase db push --project-ref $PROD_PROJECT_REF   # RLS prod
      - run: pnpm db:migrate    # Migrations Drizzle prod
      - run: vercel deploy --prod
```

### Plan de rollback
1. **Vercel :** `vercel rollback` → retour au dernier déploiement stable en < 2 min
2. **Migrations Drizzle :** Chaque migration destructive doit avoir une migration de rollback préparée à l'avance (`0005_rollback_add_column.sql`)
3. **Supabase DB :** Restauration depuis le backup automatique Supabase (Point-in-time recovery — PITR activé sur les projets Pro+)
4. **Procédure complète :** `/docs/runbooks/rollback.md`

### Smoke tests post-déploiement
- [ ] Page d'accueil charge (HTTP 200)
- [ ] Login via Supabase Auth fonctionne
- [ ] Une lecture DB via RLS retourne les bonnes données
- [ ] Une écriture via Server Action réussit
- [ ] Lighthouse LCP < 2.5s en production

---

## 📋 CHECKLIST QA — BINAIRE PASS/FAIL

### Avant staging
- [ ] `lint` : 0 warning
- [ ] `type-check` : 0 erreur TypeScript
- [ ] `test` : coverage > 80% sur les fichiers modifiés
- [ ] `build` : succès
- [ ] `supabase test db` : toutes les politiques RLS validées
- [ ] Migration Drizzle révisée manuellement (pas de DROP sans backup)

### Avant production
- [ ] Tous les checks staging validés
- [ ] Gate 3 Security Review (checklist SECURITY_AGENT) complétée
- [ ] Smoke tests staging validés
- [ ] PITR activé sur le projet Supabase production
- [ ] Plan de rollback documenté et testé

---

## 📊 MÉTRIQUES DE PERFORMANCE CIBLES

| Métrique | Cible | Critique (bloquant) |
|----------|-------|---------------------|
| LCP | < 2.5s | > 4s |
| CLS | < 0.1 | > 0.25 |
| TBT | < 200ms | > 600ms |
| TTFB | < 800ms | > 1800ms |
| Bundle JS initial | < 150KB gzippé | > 300KB (à justifier) |
| Temps de requête DB moyen | < 100ms | > 500ms (index manquant ?) |

---

## 🗺️ MATRICE DE COMPATIBILITÉ

| Navigateur | Version min |
|-----------|-------------|
| Chrome / Edge | 120+ |
| Firefox | 120+ |
| Safari | 17+ |
| Chrome Android | 120+ |
| Safari iOS | 17+ |

**Résolution minimum :** 375px | **Cibles :** 390px mobile, 768px tablette, 1280px desktop
