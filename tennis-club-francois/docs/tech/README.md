# 📚 Documentation Technique — Tennis Club du François

Ce répertoire contient la documentation technique centralisée du projet.  
**À lire en priorité** au début de chaque session de développement.

---

## 📄 Documents

| Document | Description | Importance |
|---|---|---|
| [AUDIT_COMPLET.md](./AUDIT_COMPLET.md) | État d'avancement, problèmes détectés, prochaines étapes | 🔴 Critique |
| [DATABASE.md](./DATABASE.md) | Schéma complet, relations, améliorations recommandées | 🔴 Critique |
| [RLS_AUDIT.md](./RLS_AUDIT.md) | Audit sécurité RLS + politiques SQL prêtes à appliquer | 🔴 Critique |
| [AGENT_PIPELINE.md](./AGENT_PIPELINE.md) | Pipeline d'agents, workflows, feuille de route | 🟠 Important |

---

## 🚨 Actions Immédiates (avant prochaine session)

1. **Appliquer les RLS corrigées** → `RLS_AUDIT.md` contient le SQL prêt à l'emploi
2. **Corriger le middleware** → Remplacer `getSession()` par `getUser()` dans `middleware.ts`
3. **Démarrer la page Planning** → Stitch disponible dans `planning_des_courts_admin/`

---

## 🤖 Utilisation des Agents

Pour une session efficace, préfixe ta demande :
```
[ORCHESTRATOR] → tâche globale ou planification
[DESIGN_AGENT] → implémentation d'un écran Stitch
[DB_AGENT]     → migration ou modification schéma
[SECURITY_AGENT] → RLS, middleware, sécurité
[DEV_AGENT]    → Server Actions, logique métier
[TEST_AGENT]   → écriture de tests
```
