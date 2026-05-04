# API Contracts - Server Actions

Documentation complète de toutes les Server Actions implémentées pour le Tennis Club du François.

**Dernière mise à jour** : 30 Mars 2026

---

## Sommaire

1. [Authentification](#authentification)
2. [Admin - Dashboard](#admin---dashboard)
3. [Admin - Gestion des Membres](#admin---gestion-des-membres)
4. [Admin - Planning des Courts](#admin---planning-des-courts)
5. [Admin - Paramètres](#admin---paramètres)
6. [Moniteur - Dashboard](#moniteur---dashboard)
7. [Moniteur - Cours](#moniteur---cours)
8. [Moniteur - Paramètres](#moniteur---paramètres)
9. [Membre - Dashboard](#membre---dashboard)
10. [Membre - Réservations](#membre---réservations)
11. [Membre - Cours](#membre---cours)
12. [Membre - Paramètres](#membre---paramètres)

---

## Format de réponse standardisé

Toutes les Server Actions retournent un type `ActionResult<T>` :

```typescript
type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code: ErrorCode; details?: Record<string, string[]> };

type ErrorCode =
  | 'UNAUTHORIZED'        // Session invalide ou absente
  | 'FORBIDDEN'          // Rôle insuffisant (RLS)
  | 'VALIDATION_ERROR'   // Échec validation Zod
  | 'DATABASE_ERROR'     // Erreur Supabase/PostgreSQL
  | 'NOT_FOUND'          // Ressource inexistante
  | 'CONFLICT'           // Doublon (unique constraint)
  | 'BAD_REQUEST'        // Requête mal formée
  | 'INTERNAL_ERROR';    // Erreur serveur inattendue
```

---

## Authentification

**Fichier** : `src/app/(auth)/actions.ts`

### `loginAction(formData: FormData)`

Connexion d'un utilisateur.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `email` | string | Email valide, requis |
| `password` | string | Min 8 caractères, requis |

**Retour** : `{ success: true; data: { user, session } }`

**Codes d'erreur** : `UNAUTHORIZED`, `VALIDATION_ERROR`

---

### `registerAction(formData: FormData)`

Inscription d'un nouveau membre.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `email` | string | Email valide, requis |
| `password` | string | Min 8 caractères, requis |
| `confirmPassword` | string | Doit correspondre à password |
| `fullName` | string | Max 200 caractères, requis |
| `role` | 'membre' \| 'moniteur' \| 'admin' | Optionnel, défaut: 'membre' |

**Retour** : `{ success: true; data: { userId, profileId } }`

**Codes d'erreur** : `VALIDATION_ERROR`, `CONFLICT` (email déjà utilisé)

---

### `logoutAction()`

Déconnexion de l'utilisateur.

**Retour** : `{ success: true }`

---

### `forgotPasswordAction(formData: FormData)`

Demande de réinitialisation de mot de passe.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `email` | string | Email valide, requis |

**Retour** : `{ success: true }` (toujours succès pour éviter le user enumeration)

---

### `checkSession()`

Vérifie la session de l'utilisateur.

**Retour** : `{ success: true; data: { user, session } }` ou `{ success: false; code: 'UNAUTHORIZED' }`

---

## Admin - Dashboard

**Fichier** : `src/app/(dashboard)/admin/actions.ts`

### `getAdminDashboardData()`

Récupère les données du dashboard admin.

**Retour** :
```typescript
{
  stats: {
    totalMembers: number;
    totalCoaches: number;
    totalReservations: number;
    totalLessons: number;
    revenueThisMonth: number;
  };
  courts: Array<{ id, name, status, type, currentReservation? }>;
  recentMembers: Array<{ id, fullName, email, registeredAt }>;
  recentReservations: Array<{ id, court, user, startTime, endTime, status }>;
}
```

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`

---

### `getStatsAction()`

Récupère les statistiques générales.

**Retour** : `{ totalMembers, totalCoaches, totalReservations, totalLessons }`

---

### `createMemberAction(formData: FormData)` ⭐

Crée un nouveau membre (user + profile).

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `email` | string | Email valide, requis |
| `password` | string | Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre |
| `fullName` | string | Max 200 caractères, requis |
| `role` | 'membre' \| 'moniteur' \| 'admin' | Défaut: 'membre' |
| `statutAdhesion` | 'actif' \| 'inactif' \| 'en_attente' \| 'suspendu' | Défaut: 'en_attente' |
| `typeAbonnement` | 'mensuel' \| 'annuel' \| 'premium' \| 'vip' \| 'occasionnel' | Défaut: 'mensuel' |
| `telephone` | string | Optionnel |
| `niveau` | 'débutant' \| 'intermédiaire' \| 'avancé' \| 'expert' \| 'compétition' | Défaut: 'débutant' |

**Retour** : `{ success: true; data: { userId, profileId, email } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `DATABASE_ERROR`, `CONFLICT`

---

### `createReservationForUserAction(formData: FormData)` ⭐

Crée une réservation pour un utilisateur.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `courtId` | string (UUID) | Requis |
| `userId` | string (UUID) | Requis |
| `startTime` | string (ISO) | Date future, requise |
| `endTime` | string (ISO) | Après startTime, requise |
| `type` | 'membre' \| 'entrainement' \| 'tournoi' \| 'libre' | Défaut: 'membre' |
| `notes` | string | Max 500 caractères |

**Retour** : `{ success: true; data: { reservationId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `DATABASE_ERROR`

---

### `blockCourtAction(formData: FormData)` ⭐

Bloque un court pour maintenance.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `courtId` | string (UUID) | Requis |
| `startTime` | string (ISO) | Date future, requise |
| `endTime` | string (ISO) | Après startTime, requise |
| `reason` | string | Max 200 caractères, requis |

**Retour** : `{ success: true; data: { blockId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `DATABASE_ERROR`

---

### `getAllReservationsAction(filters?)` ⭐

Récupère toutes les réservations avec filtres et pagination.

**Params** :
| Paramètre | Type | Défaut |
|-----------|------|--------|
| `page` | number | 1 |
| `limit` | number | 50 |
| `startDate` | string (ISO) | - |
| `endDate` | string (ISO) | - |
| `courtId` | string (UUID) | - |
| `userId` | string (UUID) | - |
| `status` | 'confirmée' \| 'en_attente' \| 'annulée' | - |
| `type` | 'membre' \| 'entrainement' \| 'tournoi' \| 'libre' \| 'maintenance' | - |

**Retour** : `{ success: true; data: { reservations: Reservation[], totalCount: number } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `DATABASE_ERROR`

---

### `getAllMembersAction(filters?)` ⭐

Récupère tous les membres avec filtres et pagination.

**Params** :
| Paramètre | Type | Défaut |
|-----------|------|--------|
| `page` | number | 1 |
| `limit` | number | 20 |
| `search` | string | - |
| `statut` | 'actif' \| 'inactif' \| 'en_attente' \| 'suspendu' | - |
| `typeAbonnement` | 'mensuel' \| 'annuel' \| 'premium' \| 'vip' \| 'occasionnel' | - |
| `role` | 'membre' \| 'moniteur' \| 'admin' | - |

**Retour** : `{ success: true; data: { members: Member[], totalCount: number } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `DATABASE_ERROR`

---

### `getAllCourtsAction()` ⭐

Récupère tous les courts avec leur statut.

**Retour** : `{ success: true; data: { courts: Court[] } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `DATABASE_ERROR`

---

## Admin - Gestion des Membres

**Fichier** : `src/app/(dashboard)/admin/membres/actions.ts`

### `getMembersAction(filters?)`

Liste paginée des membres avec filtres.

**Params** : Identiques à `getAllMembersAction`

**Retour** : `{ success: true; data: { members, totalPages, currentPage } }`

---

### `updateMemberAction(formData: FormData)` ⭐

Met à jour les informations d'un membre.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Requis |
| `fullName` | string | Optionnel |
| `email` | string | Optionnel |
| `telephone` | string | Optionnel |
| `niveau` | NiveauTennis | Optionnel |
| `statutAdhesion` | StatutAdhesion | Optionnel |
| `typeAbonnement` | TypeAbonnement | Optionnel |
| `avatarUrl` | string (URL) | Optionnel |

**Retour** : `{ success: true; data: { profileId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `DATABASE_ERROR`

---

### `deleteMemberAction(formData: FormData)` ⭐

Supprime un membre (soft delete).

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Requis |
| `confirm` | boolean | Doit être `true` |

**Retour** : `{ success: true; data: { deletedId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT` (réservations actives), `DATABASE_ERROR`

---

### `updateMemberStatusAction(formData: FormData)` ⭐

Change le statut d'un membre.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Requis |
| `statutAdhesion` | 'actif' \| 'inactif' \| 'en_attente' \| 'suspendu' | Requis |

**Retour** : `{ success: true; data: { profileId, newStatus } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `DATABASE_ERROR`

---

## Admin - Planning des Courts

**Fichier** : `src/app/(dashboard)/admin/actions.ts`

Voir `createReservationForUserAction`, `blockCourtAction`, `getAllReservationsAction`, `getAllCourtsAction`.

---

## Admin - Paramètres

**Fichier** : `src/app/(dashboard)/admin/parametres/actions.ts`

### `updateClubSettingsAction(formData: FormData)` ⭐

Met à jour les paramètres du club.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `clubName` | string | Max 100 caractères, requis |
| `description` | string | Max 500 caractères |
| `adresse` | string | Max 200 caractères |
| `telephone` | string | Format téléphone valide |
| `email` | string | Email valide |
| `siteWeb` | string | URL valide |
| `tarifStandard` | number | Positif, max 1000 |
| `tarifPremium` | number | Positif, max 1000 |

**Retour** : `{ success: true; data: { settingsId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `DATABASE_ERROR`

---

## Moniteur - Dashboard

**Fichier** : `src/app/(dashboard)/moniteur/actions.ts`

### `getCoachDashboardData()`

Récupère les données du dashboard moniteur.

**Retour** :
```typescript
{
  todaySessions: Array<{ id, title, court, startTime, endTime, type, studentsCount }>;
  recentStudents: Array<{ id, fullName, email, lastLesson? }>;
  stats: { totalLessons, totalStudents, hoursThisWeek };
}
```

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`

---

### `getCoachScheduleAction(startDate, endDate)`

Récupère l'emploi du temps du moniteur.

**Params** :
| Paramètre | Type | Description |
|-----------|------|-------------|
| `startDate` | string (ISO) | Date de début |
| `endDate` | string (ISO) | Date de fin |

**Retour** : `{ success: true; data: cours[] }`

---

### `getCoachStudentsAction()` ⭐

Récupère la liste des élèves coachés.

**Retour** : `{ success: true; data: { students: Student[] } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `DATABASE_ERROR`

---

## Moniteur - Cours

**Fichier** : `src/app/(dashboard)/moniteur/actions.ts`

### `createCoursAction(formData: FormData)` ⭐

Crée un nouveau cours.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `title` | string | Max 100 caractères, requis |
| `description` | string | Max 500 caractères |
| `courtId` | string (UUID) | Requis |
| `startTime` | string (ISO) | Date future, requise |
| `endTime` | string (ISO) | Après startTime, requise |
| `typeCours` | 'individuel' \| 'groupe' \| 'clinique' \| 'stage' \| 'competition' | Défaut: 'individuel' |
| `niveauRequis` | 'tous' \| 'débutant' \| 'intermédiaire' \| 'avancé' \| 'expert' | Défaut: 'tous' |
| `capaciteMax` | number | 1-50, défaut: 1 |
| `tarif` | number | Positif |

**Retour** : `{ success: true; data: { coursId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `DATABASE_ERROR`

---

### `updateCoursAction(formData: FormData)` ⭐

Met à jour un cours.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Requis |
| `title` | string | Optionnel |
| `description` | string | Optionnel |
| `courtId` | string (UUID) | Optionnel |
| `startTime` | string (ISO) | Optionnel |
| `endTime` | string (ISO) | Optionnel |
| `typeCours` | TypeCours | Optionnel |
| `niveauRequis` | NiveauRequis | Optionnel |
| `capaciteMax` | number | Optionnel |
| `tarif` | number | Optionnel |

**Retour** : `{ success: true; data: { coursId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `DATABASE_ERROR`

---

### `cancelCoursAction(formData: FormData)` ⭐

Annule un cours.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Requis |
| `reason` | string | Max 200 caractères |
| `notifyStudents` | boolean | Défaut: true |

**Retour** : `{ success: true }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `DATABASE_ERROR`

---

## Moniteur - Paramètres

**Fichier** : `src/app/(dashboard)/moniteur/parametres/actions.ts`

### `updateProfileSettingsAction(formData: FormData)`

Met à jour le profil du moniteur.

**FormData** : Voir `updateProfileSettingsSchema`

**Retour** : `{ success: true; data: { profileId } }`

---

### `changePasswordAction(formData: FormData)`

Change le mot de passe.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `currentPassword` | string | Requis |
| `newPassword` | string | Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre |
| `confirmPassword` | string | Doit correspondre à newPassword |

**Retour** : `{ success: true }`

**Codes d'erreur** : `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `DATABASE_ERROR`

---

### `updateAvailabilityAction(formData: FormData)`

Met à jour les disponibilités du moniteur.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `dayOfWeek` | 'lundi' \| ... \| 'dimanche' | Requis |
| `isAvailable` | boolean | Requis |
| `startTime` | string (HH:mm) | Si disponible |
| `endTime` | string (HH:mm) | Si disponible |

**Retour** : `{ success: true }`

---

## Membre - Dashboard

**Fichier** : `src/app/(dashboard)/membre/actions.ts`

### `getMemberDashboardData()`

Récupère les données du dashboard membre.

**Retour** :
```typescript
{
  nextReservation: { id, court, startTime, endTime } | null;
  upcomingReservations: Array<{ id, court, startTime, endTime }>;
  availableCourts: Array<{ id, name, type, status }>;
  stats: { totalReservations, hoursPlayedThisMonth };
}
```

**Codes d'erreur** : `UNAUTHORIZED`

---

### `getAvailableCourtsAction(date: string)`

Récupère les courts disponibles à une date.

**Params** :
| Paramètre | Type | Description |
|-----------|------|-------------|
| `date` | string (ISO) | Date à vérifier |

**Retour** : `{ success: true; data: courts[] }`

---

## Membre - Réservations

**Fichier** : `src/app/(dashboard)/membre/reservations/actions.ts`

### `createReservationAction(formData: FormData)`

Crée une réservation pour le membre connecté.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `courtId` | string (UUID) | Requis |
| `startTime` | string (ISO) | Date future, requise |
| `endTime` | string (ISO) | Après startTime, requise |
| `type` | 'membre' \| 'entrainement' \| 'tournoi' \| 'libre' | Défaut: 'membre' |
| `notes` | string | Max 500 caractères |

**Retour** : `{ success: true; data: { reservationId } }`

---

### `updateReservationAction(formData: FormData)`

Met à jour une réservation.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Requis |
| `courtId` | string (UUID) | Optionnel |
| `startTime` | string (ISO) | Optionnel |
| `endTime` | string (ISO) | Optionnel |
| `type` | ReservationType | Optionnel |
| `status` | ReservationStatus | Optionnel |

**Retour** : `{ success: true; data: { reservationId } }`

---

### `cancelReservationAction(formData: FormData)`

Annule une réservation.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Requis |

**Retour** : `{ success: true }`

---

### `getUserReservationsAction()`

Récupère les réservations du membre connecté.

**Retour** : `{ success: true; data: reservations[] }`

---

## Membre - Cours

**Fichier** : `src/app/(dashboard)/membre/actions.ts`

### `registerForCoursAction(formData: FormData)` ⭐

Inscrit un membre à un cours.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `coursId` | string (UUID) | Requis |
| `notes` | string | Max 200 caractères |

**Retour** : `{ success: true; data: { inscriptionId } }`

**Codes d'erreur** : `UNAUTHORIZED`, `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN` (cours annulé), `CONFLICT` (complet ou déjà inscrit), `DATABASE_ERROR`

---

### `cancelCoursInscriptionAction(formData: FormData)` ⭐

Annule une inscription à un cours.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `inscriptionId` | string (UUID) | Requis |

**Retour** : `{ success: true }`

**Codes d'erreur** : `UNAUTHORIZED`, `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN` (trop tard < 1h), `DATABASE_ERROR`

---

## Membre - Paramètres

**Fichier** : `src/app/(dashboard)/membre/parametres/actions.ts`

### `updateProfileSettingsAction(formData: FormData)`

Met à jour le profil du membre.

**FormData** : Voir `updateProfileSettingsSchema`

**Retour** : `{ success: true; data: { profileId } }`

---

### `updateNotificationPreferencesAction(formData: FormData)`

Met à jour les préférences de notification.

**FormData** :
| Champ | Type | Validation |
|-------|------|------------|
| `emailNotifications` | boolean | Défaut: true |
| `pushNotifications` | boolean | Défaut: true |
| `smsNotifications` | boolean | Défaut: false |
| `newsletter` | boolean | Défaut: false |
| `rappelReservation` | boolean | Défaut: true |
| `annulationCours` | boolean | Défaut: true |
| `promoEvenements` | boolean | Défaut: false |

**Retour** : `{ success: true; data: { preferencesId } }`

---

### `changePasswordAction(formData: FormData)`

Change le mot de passe.

**FormData** : Voir `changePasswordSchema`

**Retour** : `{ success: true }`

**Codes d'erreur** : `UNAUTHORIZED`, `VALIDATION_ERROR`, `DATABASE_ERROR`

---

## Validators Zod

### Fichiers de schémas

| Fichier | Description |
|---------|-------------|
| `src/lib/validators/auth.ts` | Authentification (login, register, etc.) |
| `src/lib/validators/reservations.ts` | Réservations (membre) |
| `src/lib/validators/members.ts` | Gestion des membres (admin) |
| `src/lib/validators/admin-reservations.ts` | Réservations (admin) |
| `src/lib/validators/cours.ts` | Cours et inscriptions |
| `src/lib/validators/settings.ts` | Paramètres (club, profil, notifications) |

---

## Notes de sécurité

### Zero-Trust Pattern

Toutes les Server Actions suivent le pattern Zero-Trust :

```typescript
// 1. Vérification session (TOUJOURS en premier)
const user = await getCurrentUser();
if (!user) {
  return error('Non authentifié', 'UNAUTHORIZED');
}

// 2. Vérification rôle (si nécessaire)
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  return error('Rôle insuffisant', 'FORBIDDEN');
}

// 3. Validation des données (JAMAIS trust client)
const validatedData = mySchema.safeParse(Object.fromEntries(formData));
if (!validatedData.success) {
  // ... gestion erreurs
}

// 4. Opération database avec user.id (JAMAIS user_id du client)
```

### Règles d'or

1. **NE JAMAIS** utiliser `user_id` depuis FormData ou le client
2. **TOUJOURS** récupérer la session via `@supabase/ssr`
3. **TOUJOURS** valider avec Zod avant toute opération
4. **TOUJOURS** vérifier le rôle avant les actions sensibles
5. **TOUJOURS** utiliser `revalidatePath()` après les mutations

---

## Exemples d'utilisation

### Exemple 1 : Création de membre (Admin)

```typescript
// Dans un composant React
'use client';

import { useFormStatus } from 'react-dom';
import { createMemberAction } from '@/app/(dashboard)/admin/actions';

export function CreateMemberForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createMemberAction(formData);
    
    if (result.success) {
      // Succès
      console.log('Membre créé:', result.data);
    } else {
      // Erreur
      console.error('Erreur:', result.error, result.details);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" minLength={8} required />
      <input name="fullName" required />
      <button type="submit">Créer le membre</button>
    </form>
  );
}
```

### Exemple 2 : Récupération des membres (Server Component)

```typescript
// Dans une Server Component
import { getMembersAction } from '@/app/(dashboard)/admin/membres/actions';

export default async function MembersPage() {
  const result = await getMembersAction({ page: 1, limit: 20, search: 'Jean' });
  
  if (!result.success) {
    return <div>Erreur: {result.error}</div>;
  }
  
  return (
    <ul>
      {result.data.members.map(member => (
        <li key={member.id}>{member.fullName}</li>
      ))}
    </ul>
  );
}
```

---

**Fin de la documentation**
