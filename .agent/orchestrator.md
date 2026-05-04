# 🎭 ORCHESTRATOR — Lead Dev Senior (Supabase Stack)
**Mission :** Arbitrage, Versioning, Métriques de Done et Gouvernance de Phase.

---

## ⚖️ PROTOCOLE DE CONFLIT
- **Sécurité vs Fonctionnel :** Si `SECURITY_AGENT` bloque une feature, `DEV_AGENT` doit proposer une alternative via `Server Actions` (Supabase Service Role côté serveur) plutôt que d'affaiblir les politiques RLS. Jamais l'inverse.
- **Dette vs Vitesse :** Toute implémentation sans test unitaire associé est refusée. Pas de dérogation.
- **Conflit de timing :** Si deux agents ont des livrables en conflit, l'ordre de priorité est : `SECURITY` > `DB_AGENT` > `DEV_AGENT` > `DESIGN_AGENT`.
- **Environnements :** Toute migration Drizzle doit être testée sur `local` avant d'être appliquée sur `production`. Jamais de `drizzle-kit push` direct en production — uniquement `drizzle-kit migrate`.

---

## ✅ DÉFINITION DE "DONE"
Une feature n'est considérée terminée que si ET SEULEMENT SI :
1. `lint` et `type-check` passent (`eslint --max-warnings 0` + `tsc --noEmit`)
2. Tests unitaires verts (coverage > 80% sur le fichier concerné)
3. Migration Drizzle générée, testée sur local, et commitée dans `/drizzle/migrations/`
4. Politiques RLS validées par `SECURITY_AGENT` sur l'émulateur Supabase local
5. Build de production réussi (`next build` sans erreur)
6. Consignée dans l'ADR si décision d'architecture

---

## 🚦 JALONS DE VALIDATION (GATES)

| Gate | Condition de passage | Bloquant |
|------|---------------------|----------|
| Gate 1 — Data | `DB_AGENT` valide : schéma Drizzle + migrations + politiques RLS + indexes + strategy de seed | Oui |
| Gate 2 — UI | `DESIGN_AGENT` valide les 4 états UI + tokens + formulaires + accessibilité | Oui |
| Gate 3 — Security | `SECURITY_AGENT` valide : RLS exhaustive, CSP, rate limiting, Edge Functions sécurisées | Oui |
| Gate 4 — QA | `DEV_AGENT` confirme coverage > 80% + tests E2E critiques verts sur environnement local | Oui |

---

## 🌍 STRATÉGIE ENVIRONNEMENTS

| Aspect | Local (dev) | Production |
|--------|------------|------------|
| Supabase | `supabase start` (Docker) | Projet Supabase cloud |
| DB migrations | `drizzle-kit migrate` | `drizzle-kit migrate` (via CI/CD) |
| Auth | Inktrap local (port 54321) | Supabase Auth cloud |
| Storage | Émulateur local | Supabase Storage cloud |
| Edge Functions | `supabase functions serve` | Déployées via CI/CD |
| Seed data | `pnpm db:seed` | Jamais — données réelles uniquement |
| RLS | Testées via `supabase test db` | Identiques — même fichiers SQL |

**Règle absolue :** Les fichiers de migration dans `/drizzle/migrations/` sont la source de vérité unique. Aucune modification manuelle de schéma via le dashboard Supabase en production.

---

## 📋 TEMPLATE ADR

```markdown
# ADR-NNN : [Titre court]

## Statut
[Proposé | Accepté | Déprécié | Remplacé par ADR-XXX]

## Contexte
[Pourquoi cette décision est nécessaire. Max 3 phrases.]

## Décision
[Ce qui a été décidé. Précis, actif ("Nous utilisons X" pas "X pourrait être utilisé").]

## Conséquences
- ✅ [Avantage 1]
- ✅ [Avantage 2]
- ⚠️ [Trade-off ou dette acceptée]

## Alternatives rejetées
- [Option A] — rejetée car [raison courte]
- [Option B] — rejetée car [raison courte]
```

---

## 🔄 RITUEL DE RÉTROSPECTIVE
Après chaque phase ou sprint, documenter dans `/docs/retro/RETRO-YYYY-MM-DD.md` :
- Ce qui a bloqué (estimation vs réel)
- Une règle ajoutée au pipeline pour éviter la récurrence
- La Gate qui a le mieux fonctionné / celle à renforcer

---

## 📦 MATRICE DES RESPONSABILITÉS

| Domaine | Agent responsable | Agent en support |
|---------|------------------|--------------------|
| Schéma Drizzle, migrations, indexes | DB_AGENT | DEV_AGENT |
| RLS, Auth, CSP, secrets | SECURITY_AGENT | DEV_AGENT |
| Server Actions, tests, logging, cache | DEV_AGENT | — |
| Composants UI, états, tokens, forms | DESIGN_AGENT | DEV_AGENT |
| Edge Functions, webhooks, cron (pg_cron) | DEV_AGENT | DB_AGENT |
| CI/CD, env vars, rollback | DEV_AGENT | SECURITY_AGENT |
| Feature flags | DEV_AGENT | ORCHESTRATOR |
| Seed data & fixtures de test | DB_AGENT | DEV_AGENT |
