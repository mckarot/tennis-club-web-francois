# 📊 Projet Tracker - Tennis Club François

> 📚 **Documentation technique complète :** [`docs/tech/README.md`](./tech/README.md)  
> 🔐 **Audit RLS (URGENT) :** [`docs/tech/RLS_AUDIT.md`](./tech/RLS_AUDIT.md)  
> 🤖 **Pipeline d'agents :** [`docs/tech/AGENT_PIPELINE.md`](./tech/AGENT_PIPELINE.md)

**Date de création :** 27 mars 2026
**Dernière mise à jour :** 2 avril 2026 (Session Antigravity)
**Statut :** 🟢 En cours

---

## 🎯 Objectifs du Projet

Créer une application de gestion de club de tennis avec :
- Réservation de courts (En cours)
- Gestion des adhérents (En cours - Listing Admin OK)
- Suivi des paiements (À venir)
- Compétitions et classements (À venir)

---

## 📁 Écrans à Traiter

| Écran | Priorité | Architecte | Logic | Wiring | Statut |
|-------|----------|------------|-------|--------|--------|
| Login / Register | P0 | ✅ | ✅ | ✅ | 🟢 Done |
| Dashboard Admin | P0 | ✅ | ✅ | ✅ | 🟢 Done |
| Gestion membres | P1 | ✅ | ✅ | ✅ | 🔄 In Progress |
| Réservation courts | P0 | ✅ | ✅ | 🔄 | 🔄 In Progress |
| Tableau Planning | P1 | ⬜ | ⬜ | ⬜ | 📋 Pending |
| Profil utilisateur | P1 | ⬜ | ⬜ | ⬜ | 📋 Pending |

**Légende :** ⬜ Pending | 🔄 In Progress | ✅ Done | 🐛 Bug

---

## 🗄️ Schéma de Données (Status)

| Table | RLS | Migrations | Zod | Statut |
|-------|-----|------------|-----|--------|
| profiles | 🔄 | ✅ | ✅ | 🟢 Done |
| member_profiles | 🔄 | ✅ | ✅ | 🟢 Done |
| courts | 🔄 | ✅ | ✅ | 🟢 Done |
| reservations | 🔄 | ✅ | ✅ | 🟢 Done |
| users (auth) | ✅ | ✅ | ✅ | 🟢 Done |

---

## 📅 Sprints

### Sprint 1 - Fondation (Terminé ✅)
- Auth Supabase configurée
- Middleware de protection
- Schéma de base (profiles, member_profiles, courts, reservations)

### Sprint 2 - Management & Dashboard (En cours 🔄)
- [x] Dashboard Admin avec statistiques temps réel
- [x] Trigger SQL pour séparation automatique Prénom/Nom
- [x] Page de gestion des membres (Listing, Recherche, Filtres)
- [x] Navigation Sidebar dynamique (Surbrillance active)
- [ ] Système de réservation visuel (Frontend)
- [ ] Blocage de courts par l'admin

---

## 🔧 Dette Technique & Notes

| Issue | Sévérité | Statut | Description |
|-------|----------|--------|-------------|
| Split Nom/Prénom | Basse | ✅ | Trigger SQL implémenté pour handles_new_user |
| Sync Sidebar | Basse | ✅ | Composant SidebarNav client-side pour détection URL |

---

## 📈 Métriques

| Métrique | Cible | Actuel | Statut |
|----------|-------|--------|--------|
| Écrans produits | 2/semaine | 3 | 🟢 |
| Tests coverage | 80% | 0% | 🔴 |
| Bugs ouverts | 0 | 0 | 🟢 |
| Build passing | 100% | ✅ | 🟢 |

---

## 🔗 Liens Utiles
- **Repo :** `/Users/mathieu/StudioProjects/tennis_web/tennis-club-francois`
- **Actions :** `src/app/dashboard/actions.ts` (Standardized)
- **Design :** Google Material Symbols + Stitch UI
