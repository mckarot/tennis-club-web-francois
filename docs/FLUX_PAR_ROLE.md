# 🎾 FLUX PAR RÔLE - Tennis Club du François

## 1. MATRICE DES PERMISSIONS PAR RÔLE

### Légende
- ✅ = Accès complet (CRUD)
- 👁️ = Lecture seule
- ➖ = Aucun accès
- ⚡ = Actions limitées

---

## 2. RÔLE: ADMIN (Super Administrateur)

### 2.1 Pages Accessibles

| Page | Route | Accès | Description |
|------|-------|-------|-------------|
| Dashboard Admin | `/admin/dashboard` | ✅ | Vue d'ensemble complète |
| Gestion des Membres | `/admin/membres` | ✅ | CRUD complet des membres |
| Planning des Courts | `/admin/planning` | ✅ | Gestion toutes réservations |
| Paramètres du Club | `/admin/parametres` | ✅ | Configuration globale |
| Dashboard Moniteur | `/moniteur/dashboard` | ✅ | Vue moniteur (survol) |
| Dashboard Membre | `/membre/dashboard` | ✅ | Vue membre (survol) |

### 2.2 Actions Possibles

#### Dashboard Admin
| Action | Description | Permission |
|--------|-------------|------------|
| Voir statistiques | Total membres, courts, réservations | ✅ |
| Voir état des courts | Temps réel des 6 courts | ✅ |
| Voir dernières réservations | Liste avec actions rapides | ✅ |
| Voir membres récents | Nouveaux inscrits | ✅ |
| Action rapide: Ajouter membre | Redirection vers formulaire | ✅ |
| Action rapide: Nouvelle réservation | Création manuelle | ✅ |
| Action rapide: Bloquer un court | Maintenance/Indisponibilité | ✅ |

#### Gestion des Membres
| Action | Description | Permission |
|--------|-------------|------------|
| Liste complète | Pagination, recherche, filtres | ✅ |
| Ajouter un membre | Formulaire complet | ✅ |
| Modifier un membre | Édition tous champs | ✅ |
| Supprimer un membre | Soft delete | ✅ |
| Changer statut | Actif/Inactif/En attente | ✅ |
| Export données | JSON/CSV | ✅ |
| Envoyer invitation | Email d'inscription | ✅ |

#### Planning des Courts
| Action | Description | Permission |
|--------|-------------|------------|
| Vue hebdomadaire | 6 courts × plages horaires | ✅ |
| Créer réservation | Pour n'importe quel membre | ✅ |
| Modifier réservation | Toutes les réservations | ✅ |
| Annuler réservation | Avec notification | ✅ |
| Bloquer un court | Maintenance programmée | ✅ |
| Filtres | Par court, type, statut | ✅ |

#### Paramètres du Club
| Action | Description | Permission |
|--------|-------------|------------|
| Modifier identité | Nom, description | ✅ |
| Modifier tarifs | Standard, Premium | ✅ |
| Modifier horaires | Par jour de la semaine | ✅ |
| Gérer notifications | Alertes système | ✅ |
| Aperçu public | Voir le site membre | ✅ |

### 2.3 Données CRUD

| Entité | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| `users` | ✅ | ✅ | ✅ | ✅ (soft) |
| `profiles` | ✅ | ✅ | ✅ | ✅ |
| `member_profiles` | ✅ | ✅ | ✅ | ✅ |
| `coach_profiles` | ✅ | ✅ | ✅ | ✅ |
| `courts` | ✅ | ✅ | ✅ | ➖ |
| `reservations` | ✅ | ✅ | ✅ | ✅ |
| `cours` | ✅ | ✅ | ✅ | ✅ |
| `club_settings` | ➖ | ✅ | ✅ | ➖ |
| `notifications` | ✅ | ✅ | ✅ | ✅ |

### 2.4 Flux Typique Admin

```
1. Connexion → /connexion
2. Dashboard Admin → Vue d'ensemble
3. [Optionnel] Gestion des membres → Ajouter/Modifier
4. [Optionnel] Planning → Vérifier/conflits
5. [Optionnel] Paramètres → Ajuster tarifs/horaires
6. Déconnexion
```

---

## 3. RÔLE: MONITEUR (Coach/Enseignant)

### 3.1 Pages Accessibles

| Page | Route | Accès | Description |
|------|-------|-------|-------------|
| Dashboard Moniteur | `/moniteur/dashboard` | ✅ | Vue sessions du jour |
| Planning Moniteur | `/moniteur/planning` | ✅ | Emploi du temps personnel |
| Gestion des Élèves | `/moniteur/eleves` | 👁️ | Liste élèves (lecture) |
| Paramètres Moniteur | `/moniteur/parametres` | ⚡ | Profil + disponibilités |
| Planning des Courts | `/moniteur/courts` | 👁️ | Consultation uniquement |

### 3.2 Actions Possibles

#### Dashboard Moniteur
| Action | Description | Permission |
|--------|-------------|------------|
| Voir sessions du jour | 4 sessions typiquement | ✅ |
| Voir état des courts | Temps réel | ✅ |
| Voir élèves récents | Derniers élèves coachés | ✅ |
| Action rapide: Ajouter un cours | Création cours | ✅ |
| Action rapide: Noter un élève | Évaluation/feedback | ✅ |
| Action rapide: Bloquer un court | Pour cours | ✅ |

#### Planning Moniteur
| Action | Description | Permission |
|--------|-------------|------------|
| Vue hebdomadaire | Cours personnels | ✅ |
| Ajouter cours | Formulaire complet | ✅ |
| Modifier cours | Ses cours uniquement | ✅ |
| Annuler cours | Avec notification élèves | ✅ |
| Voir disponibilités | Ses dispos personnelles | ✅ |

#### Gestion des Élèves
| Action | Description | Permission |
|--------|-------------|------------|
| Liste complète | Tous ses élèves | 👁️ |
| Recherche | Par nom, niveau | 👁️ |
| Voir profil élève | Détails + historique | 👁️ |
| Contacter élève | Email/SMS | ✅ |
| Modifier niveau | Évaluation | ➖ (suggéré) |

#### Paramètres Moniteur
| Action | Description | Permission |
|--------|-------------|------------|
| Modifier profil | Photo, bio, certification | ✅ |
| Modifier disponibilités | Heures hebdo récurrentes | ✅ |
| Changer mot de passe | Sécurité | ✅ |
| Gérer notifications | Alertes cours | ✅ |

### 3.3 Données CRUD

| Entité | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| `users` (soi) | ➖ | 👁️ | ⚡ (profil) | ➖ |
| `coach_profiles` (soi) | ➖ | ✅ | ✅ | ➖ |
| `profiles` (élèves) | ➖ | 👁️ | ➖ | ➖ |
| `member_profiles` (élèves) | ➖ | 👁️ | ➖ | ➖ |
| `courts` | ➖ | 👁️ | ➖ | ➖ |
| `reservations` (ses) | ✅ | ✅ | ✅ | ✅ |
| `cours` (ses) | ✅ | ✅ | ✅ | ✅ |
| `cours_inscriptions` | ➖ | 👁️ | ➖ | ➖ |

### 3.4 Flux Typique Moniteur

```
1. Connexion → /connexion
2. Dashboard Moniteur → Sessions du jour
3. Planning → Vérifier semaine
4. [Optionnel] Élèves → Contacter/évaluer
5. [Optionnel] Paramètres → Ajuster disponibilités
6. Déconnexion
```

---

## 4. RÔLE: ÉLÈVE/MEMBRE (Joueur licencié)

### 4.1 Pages Accessibles

| Page | Route | Accès | Description |
|------|-------|-------|-------------|
| Dashboard Membre | `/membre/dashboard` | ✅ | Vue personnelle |
| Planning Membre | `/membre/planning` | ✅ | Consultation disponibilités |
| Mes Réservations | `/membre/reservations` | ✅ | Historique + à venir |
| Paramètres Membre | `/membre/parametres` | ⚡ | Profil + préférences |
| Landing Page | `/` | ✅ | Page publique |

### 4.2 Actions Possibles

#### Dashboard Membre
| Action | Description | Permission |
|--------|-------------|------------|
| Voir prochaine réservation | Détail complet | ✅ |
| Voir courts disponibles | Temps réel | ✅ |
| Voir moniteur assigné | Si coaching | ✅ |
| Voir activités/équipements | Club house, spa | ✅ |
| Réserver un court | FAB/CTA | ✅ |
| Modifier réservation | La sienne | ✅ |

#### Planning Membre
| Action | Description | Permission |
|--------|-------------|------------|
| Vue hebdomadaire | Disponibilités courts | 👁️ |
| Réserver | Clic sur créneau libre | ✅ |
| Voir statut courts | Libre/Occupé/Maintenance | 👁️ |
| Filtrer | Par court, date | ✅ |

#### Mes Réservations
| Action | Description | Permission |
|--------|-------------|------------|
| Voir réservations à venir | 7 prochains jours | ✅ |
| Voir historique | Toutes passées | ✅ |
| Annuler réservation | > 24h avant | ✅ |
| Voir statistiques | Heures jouées/mois | ✅ |
| Télécharger rapport | PDF/CSV | ✅ |

#### Paramètres Membre
| Action | Description | Permission |
|--------|-------------|------------|
| Modifier profil | Nom, email, téléphone | ✅ |
| Modifier photo | Upload/URL | ✅ |
| Gérer notifications | Email/Push/SMS | ✅ |
| Changer mot de passe | Sécurité | ✅ |
| Voir abonnement | Type, statut | ✅ |
| Déconnexion | Logout | ✅ |

### 4.3 Données CRUD

| Entité | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| `users` (soi) | ➖ | 👁️ | ⚡ (email/mdp) | ➖ |
| `profiles` (soi) | ➖ | ✅ | ✅ | ➖ |
| `member_profiles` (soi) | ➖ | ✅ | ➖ | ➖ |
| `courts` | ➖ | 👁️ | ➖ | ➖ |
| `reservations` (siennes) | ✅ | ✅ | ✅ | ✅ (annuler) |
| `reservation_participants` | ✅ | ✅ | ➖ | ✅ |
| `cours` | ➖ | 👁️ | ➖ | ➖ |
| `cours_inscriptions` (soi) | ✅ | ✅ | ➖ | ✅ |

### 4.4 Flux Typique Membre

```
1. Connexion → /connexion
2. Dashboard → Voir prochaine réservation
3. [Optionnel] Planning → Réserver nouveau court
4. [Optionnel] Mes Réservations → Gérer/annuler
5. [Optionnel] Paramètres → Modifier profil
6. Déconnexion
```

---

## 5. RÔLE: GUEST (Non authentifié)

### 5.1 Pages Accessibles

| Page | Route | Accès | Description |
|------|-------|-------|-------------|
| Landing Page | `/` | ✅ | Page d'accueil publique |
| Connexion | `/connexion` | ✅ | Formulaire login |
| Inscription | `/inscription` | ✅ | Création compte |
| Mentions légales | `/mentions-legales` | ✅ | Informations légales |
| Confidentialité | `/confidentialite` | ✅ | Politique RGPD |

### 5.2 Actions Possibles

#### Landing Page
| Action | Description | Permission |
|--------|-------------|------------|
| Voir présentation club | Philosophie, équipements | ✅ |
| Voir prestations | Courts, coaching, lounge | ✅ |
| Voir galerie | Photos/vidéos | ✅ |
| Voir tarifs | Prix publics | ✅ |
| Réserver un court | → Redirection login | ➡️ |
| Découvrir le club | Scroll sections | ✅ |
| Contacter | Formulaire/infos | ✅ |

#### Connexion
| Action | Description | Permission |
|--------|-------------|------------|
| Saisir email | Champ email | ✅ |
| Saisir mot de passe | Champ password | ✅ |
| Se connecter | Submit formulaire | ✅ |
| Mot de passe oublié | Reset flow | ✅ |
| Créer un compte | → Inscription | ✅ |

### 5.3 Données Accessibles

| Entité | Accès |
|--------|-------|
| `club_settings` | Lecture publique (nom, description) |
| `courts` | Lecture (nom, type, statut uniquement) |
| Aucune autre entité | ➖ |

### 5.4 Flux Typique Guest

```
1. Arrivée → Landing Page
2. [Optionnel] Découvrir le club → Scroll sections
3. [Optionnel] Voir tarifs/presentation
4. [Intention] Réserver un court → Click CTA
5. Redirection → /connexion
6. [Nouveau] Créer un compte → /inscription
7. [Existant] Se connecter → Dashboard selon rôle
```

---

## 6. ROUTES PROTÉGÉES PAR RÔLE

### 6.1 Middleware d'Authentification

```typescript
// Exemple de protection des routes
const routeProtection = {
  // Routes publiques
  public: [
    '/',
    '/connexion',
    '/inscription',
    '/mentions-legales',
    '/confidentialite',
  ],
  
  // Routes membres (eleve, moniteur, admin)
  membre: [
    '/membre/dashboard',
    '/membre/planning',
    '/membre/reservations',
    '/membre/parametres',
  ],
  
  // Routes moniteur (moniteur, admin)
  moniteur: [
    '/moniteur/dashboard',
    '/moniteur/planning',
    '/moniteur/eleves',
    '/moniteur/parametres',
  ],
  
  // Routes admin (admin uniquement)
  admin: [
    '/admin/dashboard',
    '/admin/membres',
    '/admin/planning',
    '/admin/parametres',
  ],
};
```

### 6.2 Matrice d'Accès aux Routes

| Route | Guest | Eleve | Moniteur | Admin |
|-------|-------|-------|----------|-------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/connexion` | ✅ | ➡️ | ➡️ | ➡️ |
| `/inscription` | ✅ | ➡️ | ➡️ | ➡️ |
| `/membre/*` | ❌ | ✅ | ✅ | ✅ |
| `/moniteur/*` | ❌ | ❌ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ❌ | ✅ |

**Légende:**
- ✅ = Accès autorisé
- ➡️ = Redirection (déjà connecté)
- ❌ = Redirection vers login

---

## 7. WORKFLOWS MÉTIER

### 7.1 Workflow: Nouvelle Réservation Membre

```
┌─────────────┐
│   Membre    │
└──────┬──────┘
       │ 1. Clique "Réserver un court"
       ▼
┌─────────────┐
│  Planning   │
└──────┬──────┘
       │ 2. Sélectionne créneau libre
       ▼
┌─────────────┐
│  Formulaire │
│  Réservation│
└──────┬──────┘
       │ 3. Remplit: court, date, participants
       ▼
┌─────────────┐
│  Validation │
│  Conflits   │
└──────┬──────┘
       │ 4. Vérifie pas de chevauchement
       ▼
┌─────────────┐
│  Création   │
│  Réservation│
└──────┬──────┘
       │ 5. Enregistre en BDD
       ▼
┌─────────────┐
│ Notification│
│  (Email)    │
└─────────────┘
```

### 7.2 Workflow: Ajout Cours par Moniteur

```
┌─────────────┐
│  Moniteur   │
└──────┬──────┘
       │ 1. Clique "Ajouter un cours"
       ▼
┌─────────────┐
│  Formulaire │
│    Cours    │
└──────┬──────┘
       │ 2. Remplit: titre, court, date, capacité
       ▼
┌─────────────┐
│  Validation │
│ Disponibilités│
└──────┬──────┘
       │ 3. Vérifie court libre + dispo moniteur
       ▼
┌─────────────┐
│  Création   │
│    Cours    │
└──────┬──────┘
       │ 4. Enregistre en BDD
       ▼
┌─────────────┐
│ Publication │
│  Planning   │
└─────────────┘
```

### 7.3 Workflow: Inscription Membre par Admin

```
┌─────────────┐
│    Admin    │
└──────┬──────┘
       │ 1. Clique "Ajouter un membre"
       ▼
┌─────────────┐
│  Formulaire │
│   Membre    │
└──────┬──────┘
       │ 2. Remplit: infos personnelles + abonnement
       ▼
┌─────────────┐
│  Validation │
│   Email     │
└──────┬──────┘
       │ 3. Vérifie email unique
       ▼
┌─────────────┐
│  Création   │
│  User +     │
│  Profile    │
└──────┬──────┘
       │ 4. Crée user + member_profile
       ▼
┌─────────────┐
│  Envoi      │
│  Invitation │
└──────┬──────┘
       │ 5. Email avec lien activation
       ▼
┌─────────────┐
│   Membre    │
│  Reçoit     │
│  Email      │
└─────────────┘
```

### 7.4 Workflow: Annulation de Cours

```
┌─────────────┐
│  Moniteur   │
└──────┬──────┘
       │ 1. Annule un cours
       ▼
┌─────────────┐
│  Système    │
│  Vérifie    │
└──────┬──────┘
       │ 2. Trouve tous les inscrits
       ▼
┌─────────────┐
│  Boucle     │
│  Inscrits   │
└──────┬──────┘
       │ 3. Pour chaque inscrit:
       ├──► Notification Email
       ├──► Notification Push
       └──► Notification SMS (si activé)
       ▼
┌─────────────┐
│  Cours      │
│  Statut:    │
│  Annulé     │
└─────────────┘
```

---

## 8. ÉTATS ET TRANSITIONS

### 8.1 Cycle de Vie d'une Réservation

```
                    ┌──────────────┐
                    │  Brouillon   │
                    └──────┬───────┘
                           │ Créer
                           ▼
                    ┌──────────────┐
              ┌────│ En attente   │────┐
              │    └──────┬───────┘    │
         Confirmer       │ Annuler     │ Refuser
              │          ▼             │
              │    ┌──────────────┐    │
              └───►│  Confirmée   │◄───┘
                   └──────┬───────┘
                          │
                   ┌──────┴──────┐
                   │             │
              Complétée     Annulée (24h avant)
```

### 8.2 Cycle de Vie d'un Membre

```
                    ┌──────────────┐
                    │  Inscrit     │
                    └──────┬───────┘
                           │ Validation admin
                           ▼
                    ┌──────────────┐
              ┌────│   Actif      │────┐
              │    └──────┬───────┘    │
         Réactiver       │ Suspendre   │ Payer
              │          ▼             │
              │    ┌──────────────┐    │
              └───►│  Inactif     │◄───┘
                   └──────────────┘
```

---

## 9. RÉCAPITULATIF DES ACTIONS PAR RÔLE

### Admin (24 actions)
1. ✅ CRUD complet membres
2. ✅ CRUD complet réservations
3. ✅ CRUD complet cours
4. ✅ Configuration club
5. ✅ Export données
6. ✅ Bloquer courts
7. ✅ Voir toutes les stats
8. ✅ Notifications système

### Moniteur (12 actions)
1. ✅ Créer/modifier ses cours
2. ✅ Voir ses élèves
3. ✅ Contacter élèves
4. ✅ Gérer disponibilités
5. ✅ Réserver courts
6. ✅ Notifications cours

### Élève (10 actions)
1. ✅ Réserver courts
2. ✅ Voir ses réservations
3. ✅ Annuler réservations
4. ✅ S'inscrire aux cours
5. ✅ Gérer profil
6. ✅ Notifications perso

### Guest (4 actions)
1. ✅ Voir landing page
2. ✅ Voir infos publiques
3. ✅ Se connecter
4. ✅ Créer compte

---

**Document généré le:** 2024-10-24  
**Version:** 1.0  
**Auteur:** Data Schema Architect Agent
