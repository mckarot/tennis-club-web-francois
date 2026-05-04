# Global Rules — Standards Non-Négociables Production 2026

## 🔒 Sécurité Zero-Trust

1. **Authentification** : Toujours utiliser `getUser()` au lieu de `getSession()` dans le middleware et les Server Actions
2. **Zero-Trust** : Chaque Server Action doit vérifier `user` ET `role` avant tout accès DB
3. **RLS obligatoire** : Aucune table Supabase sans politiques de sécurité SQL versionnées
4. **Validation Zod v4** : Toutes les entrées utilisateur validées côté serveur (même si déjà validées côté client)
5. **Error Masking** : Jamais de codes PostgREST ou messages Supabase bruts exposés au client
6. **Rate Limiting** : Actif sur toutes les routes API et Server Actions sensibles (Upstash Redis)
7. **Pas de données sensibles dans les logs** : Pino avec redaction automatique de password, token, secret, key
8. **Service Role Key** : Jamais exposée côté client, jamais dans les variables NEXT_PUBLIC_*
9. **Rôles via JWT app_metadata** : Pas de requête DB supplémentaire pour lire le rôle

## 📝 Typage & Code Quality

10. **Interdiction du type `any`** — typage strict obligatoire dans tout le codebase
11. **Drizzle ORM obligatoire** — jamais de requêtes SQL brutes pour les opérations CRUD normales
12. **Zod v4 schemas 1:1** : Les schemas Zod doivent correspondre exactement aux types Drizzle
13. **ActionResult<T>** : Toutes les Server Actions retournent ce type universel

## 🏗️ Architecture

14. **Migrations Drizzle versionnées** : `/drizzle/migrations/` est la source de vérité unique
15. **Jamais de `drizzle-kit push` en production** — uniquement `drizzle-kit generate` + `migrate`
16. **Soft delete systématique** : Champ `deleted_at` sur toutes les tables métier
17. **Idempotence sur les mutations** : Clé d'idempotence + contrainte unique DB
18. **FK explicites** : `onDelete` toujours défini (`restrict` ou `cascade` — jamais par défaut)
19. **Trigger updated_at automatique** : Appliqué sur toutes les tables avec `updated_at`

## 🎨 Design & UI

20. **4 états UI obligatoires** : Skeleton, Empty, Error Boundary, Optimistic UI
21. **Design tokens OKLCH** : Aucune couleur codée en dur — tout passe par `var(--color-*)`
22. **Tailwind v4** : Styling exclusivement via Tailwind + CSS custom properties
23. **Mobile-first** : Approche `min-width` systématique
24. **Accessibilité AA** : Contraste 4.5:1, navigation clavier, aria-labels
25. **next/image obligatoire** : WebP/Avif, placeholder="blur", sizes défini

## 🧪 Tests

26. **Coverage > 80%** sur les fichiers modifiés (Vitest)
27. **Tests E2E critiques** (Playwright) pour les parcours utilisateur
28. **Tests RLS** (pgTAP) via `supabase test db`
29. **Toute feature sans test est refusée** — pas de dérogation

## 📊 Logging & Monitoring

30. **Pino structuré** : Logger avec niveaux (info/warn/error) et redaction automatique
31. **Audit logging** : Toutes les actions admin tracées dans la table `audit_events`
32. **Pas de console.log** : Utiliser `logger.info/warn/error` exclusivement

## 📋 Definition of Done (6 critères)

Une feature n'est terminée que si ET SEULEMENT SI :
1. ✅ `lint` et `type-check` passent (`eslint --max-warnings 0` + `tsc --noEmit`)
2. ✅ Tests unitaires verts (coverage > 80% sur le fichier concerné)
3. ✅ Migration Drizzle générée, testée sur local, et commitée dans `/drizzle/migrations/`
4. ✅ Politiques RLS validées par `SECURITY_AGENT` sur l'émulateur Supabase local
5. ✅ Build de production réussi (`next build` sans erreur)
6. ✅ Consignée dans l'ADR si décision d'architecture

## 🌐 SEO (sites publics)

33. **Metadata Next.js** : title unique + description sur chaque page publique
34. **Open Graph** : image 1200×630px + locale fr_FR
35. **Sitemap + robots.txt** : générés dynamiquement
36. **Données structurées JSON-LD** si applicable (produits, FAQ, articles)

## 📦 Performance

37. **Lighthouse non négociable** : LCP < 2.5s, CLS < 0.1, TBT < 200ms
38. **Cache stratégique** : `unstable_cache` pour les données stables, TanStack Query pour le client
39. **Bundle JS initial < 150KB gzippé** — à justifier si > 300KB
