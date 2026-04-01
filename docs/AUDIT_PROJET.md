# 🎾 AUDIT COMPLET DU PROJET - Tennis Club du François

## 1. VUE D'ENSEMBLE

Cet audit couvre l'ensemble des écrans Stitch exportés pour le système de gestion du **Tennis Club du François** situé en Martinique. Le projet comprend une application complète de gestion de club de tennis avec 4 rôles utilisateurs distincts.

---

## 2. ÉCRANS/STITCHES ANALYSÉS

### 2.1 Authentification & Onboarding

| # | Écran | Dossier | Description |
|---|-------|---------|-------------|
| 1 | **Connexion** | `connexion_membres_admin` | Page de login avec email/mot de passe |
| 2 | **Landing Page** | `landing_page_club_de_tennis_du_fran_ois` | Page d'accueil publique |

### 2.2 Espace Admin

| # | Écran | Dossier | Description |
|---|-------|---------|-------------|
| 3 | **Dashboard Admin** | `dashboard_admin_sans_finances` | Vue d'ensemble avec stats, courts, membres récents |
| 4 | **Gestion des Membres** | `gestion_des_membres_admin` | CRUD complet des membres |
| 5 | **Planning des Courts** | `planning_des_courts_admin` | Vue hebdomadaire des réservations par court |
| 6 | **Paramètres du Club** | `param_tres_du_club_admin_contraste_optimis` | Configuration club, tarifs, horaires |

### 2.3 Espace Membre/Élève

| # | Écran | Dossier | Description |
|---|-------|---------|-------------|
| 7 | **Dashboard Membre** | `dashboard_membre_vision_des_courts_directe` | Vue personnelle avec prochaines réservations |
| 8 | **Mes Réservations** | `mes_r_servations_membre_menu_corrig` | Historique et réservations à venir |
| 9 | **Planning Membre** | `planning_des_courts_membre_menu_corrig` | Consultation des disponibilités |
| 10 | **Paramètres Membre** | `param_tres_membre_menu_corrig` | Profil, notifications, sécurité |

### 2.4 Espace Moniteur

| # | Écran | Dossier | Description |
|---|-------|---------|-------------|
| 11 | **Dashboard Moniteur** | `dashboard_moniteur_topbar_pur_e` | Vue des sessions du jour, élèves |
| 12 | **Gestion des Élèves** | `gestion_des_l_ves_topbar_pur_e` | Liste et suivi des élèves |
| 13 | **Planning Moniteur** | `planning_moniteur_sans_prochain_cours` | Emploi du temps des cours |
| 14 | **Paramètres Moniteur** | `param_tres_moniteur_version_pur_e_simplifi_e` | Profil coach, disponibilités |

---

## 3. FORMULAIRES ET CHAMPS DÉTECTÉS

### 3.1 Formulaire de Connexion
**Écran:** `connexion_membres_admin`

| Champ | Type | Validation | Required |
|-------|------|------------|----------|
| `email` | email | Format email | Oui |
| `password` | password | Min 8 caractères | Oui |

### 3.2 Formulaire d'Inscription Membre (implicite)
**Écran:** Lien "Créer un compte" depuis la connexion

| Champ | Type | Validation | Required |
|-------|------|------------|----------|
| `nom` | text | Max 100 caractères | Oui |
| `prenom` | text | Max 100 caractères | Oui |
| `email` | email | Format email, unique | Oui |
| `telephone` | tel | Format international | Non |
| `date_naissance` | date | Date valide | Non |
| `niveau_tennis` | select | Débutant/Intermédiaire/Avancé/Pro | Non |
| `password` | password | Min 8 caractères | Oui |

### 3.3 Formulaire d'Ajout/Modification Membre (Admin)
**Écran:** `gestion_des_membres_admin`

| Champ | Type | Validation | Required |
|-------|------|------------|----------|
| `nom` | text | Max 100 caractères | Oui |
| `prenom` | text | Max 100 caractères | Oui |
| `email` | email | Format email, unique | Oui |
| `telephone` | tel | Format international | Non |
| `adresse` | text | Max 500 caractères | Non |
| `code_postal` | text | Format postal | Non |
| `ville` | text | Max 100 caractères | Non |
| `date_naissance` | date | Date valide | Non |
| `niveau_tennis` | select | Débutant/Intermédiaire/Avancé/Pro | Non |
| `statut_adhesion` | select | Actif/Inactif/En attente | Oui |
| `type_abonnement` | select | Standard/Premium/VIP | Non |
| `photo_url` | url | URL valide | Non |
| `date_inscription` | date | Auto-généré | Oui |

### 3.4 Formulaire de Réservation de Court
**Écrans:** Tous les dashboards (FAB "Réserver un court")

| Champ | Type | Validation | Required |
|-------|------|------------|----------|
| `court_id` | uuid | Référence court | Oui |
| `date_heure_debut` | datetime | Future, dans les horaires | Oui |
| `date_heure_fin` | datetime | > date_heure_debut | Oui |
| `type_reservation` | select | Membre/Entraînement/Tournoi/Libre | Oui |
| `participant_ids` | array[uuid] | Liste des participants | Non |
| `moniteur_id` | uuid | Référence moniteur | Non |
| `notes` | text | Max 500 caractères | Non |
| `statut` | select | Confirmée/En attente/Annulée | Oui |

### 3.5 Formulaire d'Ajout de Cours (Moniteur)
**Écran:** `dashboard_moniteur_topbar_pur_e`

| Champ | Type | Validation | Required |
|-------|------|------------|----------|
| `titre` | text | Max 200 caractères | Oui |
| `description` | text | Max 1000 caractères | Non |
| `court_id` | uuid | Référence court | Oui |
| `date_heure_debut` | datetime | Future | Oui |
| `date_heure_fin` | datetime | > date_heure_debut | Oui |
| `type_cours` | select | Particulier/Groupe/Stage/Perfectionnement | Oui |
| `eleve_ids` | array[uuid] | Liste des élèves | Non |
| `niveau_requis` | select | Tous/Débutant/Intermédiaire/Avancé | Non |
| `capacite_max` | integer | 1-20 | Non |

### 3.6 Formulaire de Modification Profil (Membre/Moniteur)
**Écrans:** `param_tres_membre_menu_corrig`, `param_tres_moniteur_version_pur_e_simplifi_e`

| Champ | Type | Validation | Required |
|-------|------|------------|----------|
| `nom` | text | Max 100 caractères | Oui |
| `prenom` | text | Max 100 caractères | Oui |
| `email` | email | Format email | Oui |
| `telephone` | tel | Format international | Non |
| `bio` | text | Max 500 caractères | Non |
| `photo_url` | url | URL valide | Non |
| `notifications_email` | boolean | - | Non |
| `notifications_push` | boolean | - | Non |
| `notifications_sms` | boolean | - | Non |

### 3.7 Formulaire de Paramètres du Club (Admin)
**Écran:** `param_tres_du_club_admin_contraste_optimis`

| Champ | Type | Validation | Required |
|-------|------|------------|----------|
| `nom_club` | text | Max 200 caractères | Oui |
| `description` | text | Max 1000 caractères | Non |
| `tarif_standard` | decimal(10,2) | > 0 | Oui |
| `tarif_premium` | decimal(10,2) | > 0 | Non |
| `horaire_ouverture_lundi` | time | Format HH:MM | Oui |
| `horaire_fermeture_lundi` | time | Format HH:MM | Oui |
| `horaire_ouverture_samedi` | time | Format HH:MM | Non |
| `horaire_fermeture_samedi` | time | Format HH:MM | Non |
| `horaire_ouverture_dimanche` | time | Format HH:MM | Non |
| `horaire_fermeture_dimanche` | time | Format HH:MM | Non |

---

## 4. ENTITÉS MÉTIER IDENTIFIÉES

### 4.1 Entité: `users` (Utilisateurs)
**Description:** Table centrale pour l'authentification et les profils utilisateurs.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK, auto-généré |
| `email` | varchar(255) | Unique, NOT NULL |
| `password_hash` | varchar(255) | NOT NULL |
| `role` | enum | admin/moniteur/eleve/guest |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.2 Entité: `profiles` (Profils détaillés)
**Description:** Informations complémentaires des utilisateurs.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK, FK -> users.id |
| `user_id` | uuid | FK, NOT NULL |
| `nom` | varchar(100) | NOT NULL |
| `prenom` | varchar(100) | NOT NULL |
| `telephone` | varchar(20) | - |
| `adresse` | text | - |
| `code_postal` | varchar(10) | - |
| `ville` | varchar(100) | - |
| `date_naissance` | date | - |
| `photo_url` | text | - |
| `bio` | text | - |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.3 Entité: `member_profiles` (Profils membres/élèves)
**Description:** Spécifique aux membres/élèves du club.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK -> users.id, unique |
| `niveau_tennis` | enum | debutant/intermediaire/avance/pro |
| `statut_adhesion` | enum | actif/inactif/en_attente |
| `type_abonnement` | enum | standard/premium/vip |
| `date_inscription` | date | DEFAULT NOW() |
| `heures_jouees_mois` | integer | DEFAULT 0 |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.4 Entité: `coach_profiles` (Profils moniteurs)
**Description:** Spécifique aux moniteurs/coachs.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK -> users.id, unique |
| `certification` | text | - |
| `specialite` | varchar(100) | - |
| `annees_experience` | integer | - |
| `disponibilites` | jsonb | - |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.5 Entité: `courts` (Courts de tennis)
**Description:** Les courts disponibles à la réservation.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `nom` | varchar(50) | NOT NULL (ex: "Court 01") |
| `type_surface` | enum | quick/terre_battue/dur |
| `statut` | enum | disponible/occupe/maintenance |
| `eclaire` | boolean | DEFAULT false |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.6 Entité: `reservations` (Réservations)
**Description:** Les réservations de courts par les membres.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `court_id` | uuid | FK -> courts.id |
| `user_id` | uuid | FK -> users.id |
| `date_heure_debut` | timestamp | NOT NULL |
| `date_heure_fin` | timestamp | NOT NULL |
| `type_reservation` | enum | membre/entrainement/tournoi/libre |
| `statut` | enum | confirmee/en_attente/annulee |
| `notes` | text | - |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.7 Entité: `reservation_participants` (Participants aux réservations)
**Description:** Table de jointure pour les réservations multi-joueurs.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `reservation_id` | uuid | FK -> reservations.id |
| `user_id` | uuid | FK -> users.id |
| `created_at` | timestamp | DEFAULT NOW() |

### 4.8 Entité: `cours` (Cours/Leçons)
**Description:** Les cours dispensés par les moniteurs.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `moniteur_id` | uuid | FK -> users.id |
| `court_id` | uuid | FK -> courts.id |
| `titre` | varchar(200) | NOT NULL |
| `description` | text | - |
| `date_heure_debut` | timestamp | NOT NULL |
| `date_heure_fin` | timestamp | NOT NULL |
| `type_cours` | enum | particulier/groupe/stage/perfectionnement |
| `niveau_requis` | enum | tous/debutant/intermediaire/avance |
| `capacite_max` | integer | DEFAULT 1 |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.9 Entité: `cours_inscriptions` (Inscriptions aux cours)
**Description:** Inscriptions des élèves aux cours.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `cours_id` | uuid | FK -> cours.id |
| `eleve_id` | uuid | FK -> users.id |
| `statut` | enum | inscrit/en_attente/annule |
| `created_at` | timestamp | DEFAULT NOW() |

### 4.10 Entité: `club_settings` (Paramètres du club)
**Description:** Configuration globale du club.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `nom_club` | varchar(200) | NOT NULL |
| `description` | text | - |
| `tarif_standard` | decimal(10,2) | DEFAULT 45.00 |
| `tarif_premium` | decimal(10,2) | DEFAULT 35.00 |
| `horaire_ouverture_lundi` | time | DEFAULT '07:00' |
| `horaire_fermeture_lundi` | time | DEFAULT '22:00' |
| `horaire_ouverture_samedi` | time | DEFAULT '08:00' |
| `horaire_fermeture_samedi` | time | DEFAULT '20:00' |
| `horaire_ouverture_dimanche` | time | DEFAULT '09:00' |
| `horaire_fermeture_dimanche` | time | DEFAULT '18:00' |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

### 4.11 Entité: `notifications` (Notifications)
**Description:** Préférences et historique des notifications.

| Attribut | Type | Contraintes |
|----------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK -> users.id |
| `type_notification` | enum | reservation/annulation/cours/promo |
| `canal` | enum | email/push/sms |
| `active` | boolean | DEFAULT true |
| `created_at` | timestamp | DEFAULT NOW() |

---

## 5. DIAGRAMME DES RELATIONS

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ email           │
│ password_hash   │
│ role            │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
    ▼         ▼              ▼              ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│profiles│ │member_   │ │coach_    │ │notifications│
│        │ │profiles  │ │profiles  │ │          │
└───┬────┘ └────┬─────┘ └────┬─────┘ └──────────┘
    │           │            │
    │           │            │
    │           ▼            ▼
    │      ┌──────────┐ ┌──────────┐
    │      │cours_    │ │  cours   │
    │      │inscriptions│ │──────────│
    │      └──────────┘ │ id       │
    │                   │ moniteur │
    │                   │ court_id │
    │                   └────┬─────┘
    │                        │
    │                        ▼
    │                   ┌──────────┐
    │                   │  courts  │
    │                   │──────────│
    │                   │ id       │
    │                   │ nom      │
    │                   │ surface  │
    │                   └────┬─────┘
    │                        │
    │           ┌────────────┴────────────┐
    │           │                         │
    │           ▼                         ▼
    │      ┌──────────┐           ┌──────────┐
    │      │reservations│          │reservation_│
    │      │──────────│          │participants│
    │      │ court_id │          │────────────│
    │      │ user_id  │          │reservation │
    │      └────┬─────┘          │ user_id   │
    │           │                └──────────┘
    │           │
    ▼           ▼
┌─────────────────┐
│  club_settings │
│────────────────│
│ nom_club       │
│ tarifs         │
│ horaires       │
└─────────────────┘
```

### Relations détaillées:

| Relation | Type | Description |
|----------|------|-------------|
| `users` → `profiles` | 1:1 | Chaque utilisateur a un profil |
| `users` → `member_profiles` | 1:0..1 | Un utilisateur peut être membre |
| `users` → `coach_profiles` | 1:0..1 | Un utilisateur peut être moniteur |
| `users` → `reservations` | 1:N | Un utilisateur peut faire plusieurs réservations |
| `courts` → `reservations` | 1:N | Un court peut avoir plusieurs réservations |
| `reservations` → `reservation_participants` | 1:N | Une réservation peut avoir plusieurs participants |
| `users` → `cours` | 1:N | Un moniteur peut donner plusieurs cours |
| `courts` → `cours` | 1:N | Un court peut accueillir plusieurs cours |
| `cours` → `cours_inscriptions` | 1:N | Un cours peut avoir plusieurs inscrits |
| `users` → `cours_inscriptions` | 1:N | Un élève peut s'inscrire à plusieurs cours |
| `users` → `notifications` | 1:N | Un utilisateur a plusieurs préférences de notification |

---

## 6. MÉTIERS & RÈGLES DE GESTION

### 6.1 Rôles et Permissions

| Rôle | Accès Dashboard | Réservations | Gestion Membres | Planning | Paramètres |
|------|-----------------|--------------|-----------------|----------|------------|
| **admin** | Complet | Oui | CRUD complet | Vue admin | Club + Perso |
| **moniteur** | Limité | Oui | Lecture élèves | Vue cours | Perso + Dispos |
| **eleve** | Personnel | Oui | Lecture seul | Consultation | Perso |
| **guest** | Landing page | Non | Non | Non | Non |

### 6.2 Règles de Réservation

1. **Durée minimale:** 30 minutes
2. **Durée maximale:** 2 heures par session
3. **Anticipation:** Réservation possible jusqu'à 7 jours à l'avance
4. **Annulation:** Possible jusqu'à 24h avant
5. **Conflit:** Une réservation ne peut chevaucher une autre sur le même court

### 6.3 Règles des Cours

1. **Capacité:** Maximum 20 élèves par cours de groupe
2. **Niveau:** Filtrage par niveau requis
3. **Inscription:** Jusqu'à 1h avant le début du cours
4. **Annulation moniteur:** Notification automatique aux inscrits

### 6.4 Horaires d'Ouverture

| Jour | Ouverture | Fermeture |
|------|-----------|-----------|
| Lundi - Vendredi | 07:00 | 22:00 |
| Samedi | 08:00 | 20:00 |
| Dimanche | 09:00 | 18:00 |

---

## 7. DONNÉES DE RÉFÉRENCE

### 7.1 Niveaux de Tennis
```
- debutant: Première pratique
- intermediaire: Pratique régulière (1-3 ans)
- avance: Compétiteur (3+ ans)
- pro: Niveau professionnel/certifié
```

### 7.2 Types de Surface
```
- quick: Surface rapide (synthétique)
- terre_battue: Terre battue traditionnelle
- dur: Surface dure (béton/résine)
```

### 7.3 Statuts de Réservation
```
- confirmee: Réservation validée
- en_attente: En attente de confirmation admin
- annulee: Annulée (par utilisateur ou admin)
```

### 7.4 Types d'Abonnement
```
- standard: Accès basique aux courts
- premium: Tarif réduit + priorités
- vip: Accès illimité + services premium
```

---

## 8. CONTRAINTES TECHNIQUES IDENTIFIÉES

### 8.1 Contraintes d'Intégrité

- **Email unique:** Un email ne peut être associé qu'à un seul compte
- **Horaires cohérents:** `date_heure_fin` > `date_heure_debut`
- **Pas de chevauchement:** Un court ne peut avoir deux réservations simultanées
- **Rôle requis:** Chaque utilisateur doit avoir un rôle défini

### 8.2 Index Recommandés

```sql
-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_reservations_court_date ON reservations(court_id, date_heure_debut);
CREATE INDEX idx_reservations_user_date ON reservations(user_id, date_heure_debut);
CREATE INDEX idx_cours_moniteur_date ON cours(moniteur_id, date_heure_debut);
CREATE INDEX idx_cours_date ON cours(date_heure_debut);
```

---

## 9. SÉCURITÉ & CONFIDENTIALITÉ

### 9.1 Données Sensibles

| Donnée | Niveau | Protection |
|--------|--------|------------|
| Mot de passe | Critique | Hash bcrypt/argon2 |
| Email | Personnel | RLS + chiffrement |
| Téléphone | Personnel | RLS |
| Adresse | Personnel | RLS |
| Date de naissance | Personnel | RLS |

### 9.2 Conformité RGPD

- Droit à l'oubli: Suppression en cascade des données utilisateur
- Portabilité: Export JSON/CSV des données personnelles
- Consentement: Opt-in pour notifications SMS/email

---

**Document généré le:** 2024-10-24  
**Version:** 1.0  
**Auteur:** Data Schema Architect Agent
