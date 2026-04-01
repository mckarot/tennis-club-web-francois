# 🗺️ Project Roadmap - Tennis Club du François

**Date de création :** 2026-03-30
**Dernière mise à jour :** 2026-03-30
**Version :** 2.0 - Phase 3 Wiring UI

---

## 1. VUE D'ENSEMBLE

Ce document définit l'ordre de traitement des écrans pour la **Phase 3 (Wiring UI)** du système de gestion du **Tennis Club du François**.

**État des phases :**
- ✅ **Phase 1 (Data)** : Schémas Drizzle, Zod validators, RLS policies - **TERMINÉE**
- ✅ **Phase 2 (Logic)** : 35+ Server Actions - **TERMINÉE**
- 🔄 **Phase 3 (Wiring UI)** : Intégration des écrans Stitch - **EN COURS**

---

## 2. ORDRE DE TRAITEMENT PHASE 3

### 2.1 Priorisation des Écrans

| Priorité | Écran | Route | Dossier Stitch | Server Actions à connecter | Complexité UI |
|----------|-------|-------|----------------|---------------------------|---------------|
| **P0** | Landing Page | `/` | `landing_page_club_de_tennis_du_fran_ois` | Aucune (page publique) | Medium |
| **P0** | Login | `/login` | `connexion_membres_admin` | `loginAction` | Low |
| **P0** | Register | `/register` | (implicite) | `registerAction` | Low |
| **P0** | Dashboard Admin | `/admin` | `dashboard_admin_sans_finances` | `getAdminDashboardData`, `createMemberAction`, `createReservationForUserAction`, `blockCourtAction` | Medium |
| **P0** | Dashboard Membre | `/membre` | `dashboard_membre_vision_des_courts_directe` | `getMemberDashboardData`, `getAvailableCourtsAction` | Medium |
| **P0** | Dashboard Moniteur | `/moniteur` | `dashboard_moniteur_topbar_pur_e` | `getCoachDashboardData` | Medium |
| **P1** | Gestion des Membres | `/admin/membres` | `gestion_des_membres_admin` | `getMembersAction`, `updateMemberAction`, `deleteMemberAction` | High |
| **P1** | Planning des Courts Admin | `/admin/planning` | `planning_des_courts_admin` | `getAllReservationsAction` | Medium |
| **P1** | Planning Membre | `/membre/planning` | `planning_des_courts_membre_menu_corrig` | `getAvailableCourtsAction`, `createReservationAction` | Medium |
| **P1** | Mes Réservations | `/membre/reservations` | `mes_r_servations_membre_menu_corrig` | `getMemberReservationsAction`, `cancelReservationAction` | Low |
| **P1** | Gestion des Élèves | `/moniteur/eleves` | `gestion_des_l_ves_topbar_pur_e` | `getCoachStudentsAction` | Low |
| **P1** | Planning Moniteur | `/moniteur/planning` | `planning_moniteur_sans_prochain_cours` | `getCoachScheduleAction` | Medium |
| **P2** | Paramètres Admin | `/admin/parametres` | `param_tres_du_club_admin_contraste_optimis` | `updateClubSettingsAction` | Low |
| **P2** | Paramètres Membre | `/membre/parametres` | `param_tres_membre_menu_corrig` | `updateProfileAction`, `updateNotificationPrefsAction` | Low |
| **P2** | Paramètres Moniteur | `/moniteur/parametres` | `param_tres_moniteur_version_pur_e_simplifi_e` | `updateProfileAction` | Low |

---

## 3. DÉPENDANCES ENTRE ÉCRANS

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE (P0-1)                       │
│                    Page publique statique                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONNEXION (P0-2)                           │
│                    /login                                    │
│                    loginAction                               │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ DASHBOARD ADMIN │ │ DASHBOARD MEMBRE│ │DASHBOARD MONITEUR│
    │    (P0-4)       │ │     (P0-5)      │ │     (P0-6)      │
    │    /admin       │ │    /membre      │ │   /moniteur     │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │                       │
              │               ├───────────┐           │
              ▼               ▼           ▼           ▼
    ┌─────────────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐
    │GESTION MEMBRES  │ │PLANNING │ │MES RÉSA │ │GESTION ÉLÈVES│
    │   (P1-7)        │ │(P1-9)   │ │(P1-10)  │ │  (P1-11)    │
    └─────────────────┘ └─────────┘ └─────────┘ └─────────────┘
              │
              ▼
    ┌─────────────────┐
    │PLANNING ADMIN   │
    │   (P1-8)        │
    └─────────────────┘
```

---

## 4. SÉQUENCE D'EXÉCUTION DÉTAILLÉE

### Sprint 3.1 : Pages Publiques & Auth (Jours 1-2)

| Ordre | Écran | Fichiers à créer | Composants | Validation |
|-------|-------|------------------|------------|------------|
| 1 | **Landing Page** | `src/app/page.tsx` | `LandingPage`, `HeroSection`, `FeaturesSection`, `PricingSection` | Build ✅, Design Stitch ✅ |
| 2 | **Login** | `src/app/(auth)/login/page.tsx` | `LoginForm` | loginAction ✅, Redirection ✅ |
| 3 | **Register** | `src/app/(auth)/register/page.tsx` | `RegisterForm` | registerAction ✅, Redirection ✅ |

### Sprint 3.2 : Dashboards Principaux (Jours 3-5)

| Ordre | Écran | Fichiers à créer | Composants | Validation |
|-------|-------|------------------|------------|------------|
| 4 | **Dashboard Admin** | `src/app/(dashboard)/admin/page.tsx` | `AdminDashboard`, `StatsCards`, `QuickActions`, `RecentMembersList` | getAdminDashboardData ✅ |
| 5 | **Dashboard Membre** | `src/app/(dashboard)/membre/page.tsx` | `MemberDashboard`, `NextReservationCard`, `AvailableCourtsList` | getMemberDashboardData ✅ |
| 6 | **Dashboard Moniteur** | `src/app/(dashboard)/moniteur/page.tsx` | `CoachDashboard`, `TodaySessionsList`, `QuickActions` | getCoachDashboardData ✅ |

### Sprint 3.3 : Features Admin (Jours 6-8)

| Ordre | Écran | Fichiers à créer | Composants | Validation |
|-------|-------|------------------|------------|------------|
| 7 | **Gestion des Membres** | `src/app/(dashboard)/admin/membres/page.tsx` | `MembersTable`, `MemberForm`, `DeleteConfirmModal` | CRUD complet ✅ |
| 8 | **Planning Admin** | `src/app/(dashboard)/admin/planning/page.tsx` | `AdminPlanningView`, `CourtSelector`, `ReservationModal` | getAllReservationsAction ✅ |
| 9 | **Paramètres Club** | `src/app/(dashboard)/admin/parametres/page.tsx` | `ClubSettingsForm`, `TariffsForm`, `HoursForm` | updateClubSettingsAction ✅ |

### Sprint 3.4 : Features Membre (Jours 9-11)

| Ordre | Écran | Fichiers à créer | Composants | Validation |
|-------|-------|------------------|------------|------------|
| 10 | **Planning Membre** | `src/app/(dashboard)/membre/planning/page.tsx` | `PlanningView`, `CourtSelector`, `ReservationModal` | createReservationAction ✅ |
| 11 | **Mes Réservations** | `src/app/(dashboard)/membre/reservations/page.tsx` | `ReservationsList`, `ReservationCard`, `CancelModal` | cancelReservationAction ✅ |
| 12 | **Paramètres Membre** | `src/app/(dashboard)/membre/parametres/page.tsx` | `ProfileForm`, `NotificationPrefsForm` | updateProfileAction ✅ |

### Sprint 3.5 : Features Moniteur (Jours 12-14)

| Ordre | Écran | Fichiers à créer | Composants | Validation |
|-------|-------|------------------|------------|------------|
| 13 | **Gestion des Élèves** | `src/app/(dashboard)/moniteur/eleves/page.tsx` | `StudentsTable`, `StudentCard`, `ContactModal` | getCoachStudentsAction ✅ |
| 14 | **Planning Moniteur** | `src/app/(dashboard)/moniteur/planning/page.tsx` | `CoachPlanningView`, `AddCoursModal` | getCoachScheduleAction ✅ |
| 15 | **Paramètres Moniteur** | `src/app/(dashboard)/moniteur/parametres/page.tsx` | `CoachProfileForm`, `AvailabilityForm` | updateProfileAction ✅ |

---

## 5. CHECKLIST DE VALIDATION PAR ÉCRAN

### Pour chaque écran livré, vérifier :

- [ ] **Build réussi** : `npm run build` = 0 erreur
- [ ] **TypeScript** : `tsc --noEmit` = 0 erreur
- [ ] **Lint** : `npm run lint` = 0 warning
- [ ] **Design préservé** : Pas de régression visuelle vs Stitch
- [ ] **Accessibilité** : Boutons et liens ont des labels appropriés
- [ ] **Fonctionnel** : Les actions (submit, navigation) fonctionnent
- [ ] **États UI** : Loading, Error, Success gérés
- [ ] **Responsive** : Mobile, Tablet, Desktop testés

---

## 6. STRUCTURE DE PROJET CIBLE

```
tennis-club-francois/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── membres/
│   │   │   │   ├── planning/
│   │   │   │   └── parametres/
│   │   │   ├── membre/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── planning/
│   │   │   │   ├── reservations/
│   │   │   │   └── parametres/
│   │   │   └── moniteur/
│   │   │       ├── page.tsx
│   │   │       ├── eleves/
│   │   │       ├── planning/
│   │   │       └── parametres/
│   │   ├── layout.tsx
│   │   └── page.tsx (Landing Page)
│   └── components/
│       ├── forms/
│       ├── dashboard/
│       └── ui/
├── lib/
│   └── validators/
└── docs/
    ├── PROJECT_TRACKER.md
    ├── PROJECT_ROADMAP.md
    ├── RLS_POLICIES.md
    └── API_CONTRACTS.md
```

---

## 7. JALONS & CRITÈRES D'ACCEPTATION

### Jalon 3.1 : MVP Public + Auth
**Date cible :** Jour 2
**Critères d'acceptation :**
- [ ] Landing Page fidèle au design Stitch
- [ ] Formulaire de connexion fonctionnel
- [ ] Formulaire d'inscription fonctionnel
- [ ] Redirection post-auth selon le rôle
- [ ] Build sans erreur

### Jalon 3.2 : Dashboards Opérationnels
**Date cible :** Jour 5
**Critères d'acceptation :**
- [ ] Dashboard Admin affiche les stats
- [ ] Dashboard Membre affiche les réservations
- [ ] Dashboard Moniteur affiche les cours
- [ ] Navigation entre dashboards fonctionnelle
- [ ] Logout fonctionnel

### Jalon 3.3 : Features Complètes
**Date cible :** Jour 14
**Critères d'acceptation :**
- [ ] Tous les écrans Stitch intégrés
- [ ] Toutes les Server Actions connectées
- [ ] Tests E2E des formulaires passants
- [ ] Audit accessibilité validé
- [ ] Documentation complète

---

## 8. MÉTRIQUES DE SUIVI

### Avancement par Sprint

| Sprint | Écrans prévus | Écrans livrés | Écart | Statut |
|--------|---------------|---------------|-------|--------|
| 3.1 (Auth) | 3 | - | - | 🔄 En cours |
| 3.2 (Dashboards) | 3 | - | - | ⬜ À venir |
| 3.3 (Admin) | 3 | - | - | ⬜ À venir |
| 3.4 (Membre) | 3 | - | - | ⬜ À venir |
| 3.5 (Moniteur) | 3 | - | - | ⬜ À venir |

### Qualité

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Tests coverage | ≥80% | 0% |
| Build errors | 0 | 0 |
| Lint warnings | 0 | 0 |
| Bugs P0/P1 | 0 | 0 |
| Régression UI | 0 | 0 |

---

## 9. RISQUES IDENTIFIÉS

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Régression design Stitch | Medium | Medium | Audit visuel systématique |
| États loading/error oubliés | Medium | Medium | Checklist de validation |
| Accessibilité non traitée | Low | Low | Vérification ARIA obligatoire |
| Performance rendering | Low | Low | React.memo si nécessaire |

---

**Document généré automatiquement par l'Orchestrateur**
