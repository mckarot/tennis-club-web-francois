# 🔍 Audit Complet — Tennis Club du François
**Date :** 2 avril 2026  
**Auteur :** Antigravity (Claude Sonnet)  
**Version projet :** 0.3.0-alpha  
**Stack :** Next.js 16.2 · React 19 · Supabase · Tailwind 4 · Stitch Design System

---

## 🏗️ Architecture Générale

```
tennis-club-francois/
├── src/
│   ├── app/
│   │   ├── (auth)/          ✅ Login · Register
│   │   ├── auth/            ✅ Callbacks Supabase
│   │   └── dashboard/
│   │       ├── actions.ts   ✅ ~1050 lignes — 12 Server Actions
│   │       ├── admin/       ✅ Layout + Page + Membres + Planning (vide) + Paramètres (vide)
│   │       ├── membre/      ⚠️ Page existante mais design non finalisé
│   │       └── moniteur/    ⬜ Vide — À créer
│   ├── components/
│   │   ├── auth/            ✅ LoginForm, RegisterForm
│   │   ├── dashboard/admin/ ✅ 7 composants + modales
│   │   ├── landing/         ✅ HeroSection (Page publique)
│   │   └── ui/              ✅ Composants génériques
│   └── lib/
│       ├── supabase/        ✅ client.ts + server.ts + admin.ts
│       ├── types/           ✅ actions.ts + dashboard.ts + members.ts
│       └── validators/      ✅ dashboard.ts + members.ts
├── supabase/
│   ├── migrations/          ✅ 1 migration complète
│   └── seed.sql             ✅ Script de données de test
└── middleware.ts             ⚠️ Fonctionnel mais côté sécurité à revoir
```

---

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification (Sprint 1 — COMPLET)
| Fonctionnalité | Statut | Fichier |
|---|---|---|
| Login email/password | ✅ | `(auth)/login/page.tsx` |
| Registration avec rôle | ✅ | `(auth)/register/page.tsx` |
| Middleware de protection | ✅ | `middleware.ts` |
| Redirection par rôle | ✅ | `middleware.ts` |
| Trigger auto-création profil | ✅ | `migration` — `handle_new_user` |
| Split Prénom/Nom depuis `full_name` | ✅ | Trigger SQL mis à jour |
| Déconnexion sécurisée | ✅ | `logoutAction()` |

### 🏠 Dashboard Admin (Sprint 2 — EN COURS)
| Fonctionnalité | Statut | Priorité |
|---|---|---|
| Stats temps réel (membres, réservations, courts) | ✅ | P0 |
| État des courts (disponible/occupé/maintenance) | ✅ | P0 |
| Dernières réservations | ✅ | P0 |
| Membres récents | ✅ | P0 |
| Actions rapides (Modales) | ✅ | P1 |
| Navigation dynamique (surbrillance route active) | ✅ | P1 |
| **Page Planning** | ❌ Page vide | P1 |
| **Page Paramètres** | ❌ Page vide | P2 |

### 👥 Gestion des Membres (Sprint 2 — EN COURS)
| Fonctionnalité | Statut | Priorité |
|---|---|---|
| Listing complet avec pagination | ✅ | P0 |
| Recherche par nom/email | ✅ | P0 |
| Filtrage par rôle | ✅ | P0 |
| Statistiques "Total Actifs" | ✅ | P0 |
| Avatar par défaut (icône) | ✅ | P1 |
| **Édition d'un membre** | ❌ Modale à créer | P1 |
| **Suppression d'un membre** | ❌ Backend + confirmation | P1 |
| **Détail profil complet** | ❌ Page dédiée | P2 |

### 🎾 Réservations (Sprint 2 — PARTIEL)
| Fonctionnalité | Statut | Priorité |
|---|---|---|
| Modale de réservation (Admin) | ✅ | P0 |
| Server Action `createReservationForUserAction` | ✅ | P0 |
| Validation Zod stricte | ✅ | P0 |
| **Page Planning visuel** | ❌ À créer | P0 |
| **Système de réservation Membre** | ❌ Frontend à créer | P0 |
| **Annulation de réservation** | ❌ À créer | P1 |

---

## 🎨 Écrans Stitch Disponibles

Les écrans Stitch suivants sont disponibles comme références de design dans `/stitch_connexion_membres_admin/` :

| Dossier Stitch | Écran Correspondant | Statut Impl |
|---|---|---|
| `connexion_membres_admin/` | Login / Register | ✅ Implémenté |
| `dashboard_admin_sans_finances/` | Dashboard Admin | ✅ Implémenté |
| `gestion_des_membres_admin/` | Page Membres Admin | ✅ Implémenté |
| `planning_des_courts_admin/` | Planning Admin | ❌ À implémenter |
| `param_tres_du_club_admin_contraste_optimis/` | Paramètres Admin | ❌ À implémenter |
| `dashboard_membre_vision_des_courts_directe/` | Dashboard Membre | ⚠️ Partiel |
| `mes_r_servations_membre_menu_corrig/` | Réservations Membre | ❌ À implémenter |
| `planning_des_courts_membre_menu_corrig/` | Planning Membre | ❌ À implémenter |
| `param_tres_membre_menu_corrig/` | Paramètres Membre | ❌ À implémenter |
| `dashboard_moniteur_topbar_pur_e/` | Dashboard Moniteur | ❌ À implémenter |
| `gestion_des_l_ves_topbar_pur_e/` | Gestion Élèves | ❌ À implémenter |
| `planning_moniteur_sans_prochain_cours/` | Planning Moniteur | ❌ À implémenter |
| `param_tres_moniteur_version_pur_e_simplifi_e/` | Paramètres Moniteur | ❌ À implémenter |
| `l_habitation_tennis_club/` | Page de présentation | ⚠️ HeroSection partielle |
| `landing_page_club_de_tennis_du_fran_ois/` | Landing page publique | ⚠️ Partielle |

---

## ⚠️ Problèmes & Dettes Techniques

### 🔴 Critique
| Problème | Impact | Solution |
|---|---|---|
| **RLS trop permissives** (`Allow all`) | Toutes les données sont exposées en lecture/écriture sans restriction | Voir `RLS_AUDIT.md` |
| **Middleware utilise `getSession()`** au lieu de `getUser()` | Vulnérable au JWT spoofing côté serveur | Remplacer par `getUser()` |

### 🟠 Important
| Problème | Impact | Solution |
|---|---|---|
| **`drizzle-orm` importé mais non utilisé** | Confusion architecture (Drizzle vs Supabase SDK) | Choisir un seul ORM ou supprimer |
| **Enum de rôle déclarée en SQL** mais pas synchronisée en TypeScript | Type safety partielle | Créer enum TypeScript `UserRole` |
| **Seed SQL utilise `users.id`** mais le trigger insère via `user_id` | Incohérence possible du seed | Corriger le seed |
| **Page membre et moniteur vides** | Bloquant pour les utilisateurs finaux | Prioriser l'implémentation |

### 🟡 Mineur
| Problème | Impact | Solution |
|---|---|---|
| Pas de tests automatisés | Risque de régression | Ajouter Vitest + testing-library |
| Console.log en production | Performance + sécurité (fuite d'infos) | Remplacer par un logger conditionnel |
| Pagination non implémentée | À partir de 50 membres, liste tronquée | Implémenter curseur ou offset |

---

## 📋 Ordre de Priorité pour la Suite

### Phase immédiate (Sprint 2 fin)
1. 🔴 Corriger les RLS (voir `RLS_AUDIT.md`)
2. 🔴 Corriger le middleware (`getUser()` au lieu de `getSession()`)
3. 🎨 Implémenter la page Planning (Admin) — Stitch disponible
4. 👥 Modale d'édition de membre

### Phase suivante (Sprint 3)
5. 🎾 Écran de réservation des courts (Membre)
6. 👤 Dashboard Membre complet
7. 🧑‍🏫 Dashboard Moniteur complet
8. 📅 Calendrier de réservations visuel

### Phase finale (Sprint 4)
9. 🧪 Tests unitaires (Vitest)
10. 🚀 Déploiement (Vercel + Supabase cloud)
11. 📊 Tableau de bord des statistiques avancées

---

## 📊 Score de Maturité Global

| Dimension | Score | Commentaire |
|---|---|---|
| Architecture | 7/10 | Solide mais Drizzle non utilisé crée confusion |
| Sécurité | 5/10 | RLS ouverte = risque majeur |
| Couverture de tests | 1/10 | Aucun test automatisé |
| Conformité Design Stitch | 7/10 | Admin OK, reste des rôles absent |
| Qualité du code | 8/10 | Server Actions bien structurées avec Zod |
| Documentation | 7/10 | Ce document + tracker = bon début |
| **Moyenne** | **5.8/10** | Projet prometteur, fondations solides |
