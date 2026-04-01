# 📋 API Contracts - Tennis Club du François

**Date de création :** 2026-03-30  
**Version :** 1.0

---

## 1. VUE D'ENSEMBLE

Ce document décrit les contrats d'API pour toutes les Server Actions du projet. Chaque Server Action suit le pattern de réponse uniforme :

```typescript
type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code: ErrorCode; details?: Record<string, string[]> };
```

### Codes d'erreur standardisés

| Code | Signification | HTTP Equivalent |
|------|---------------|-----------------|
| `UNAUTHORIZED` | Session invalide ou absente | 401 |
| `FORBIDDEN` | Rôle insuffisant (RLS) | 403 |
| `VALIDATION_ERROR` | Échec validation Zod | 400 |
| `DATABASE_ERROR` | Erreur Supabase/PostgreSQL | 500 |
| `NOT_FOUND` | Ressource inexistante | 404 |
| `CONFLICT` | Doublon (unique constraint) | 409 |
| `BAD_REQUEST` | Requête mal formée | 400 |
| `INTERNAL_ERROR` | Erreur serveur inattendue | 500 |

---

## 2. AUTHENTIFICATION

### 2.1 `loginAction`

**Fichier :** `src/app/(auth)/actions.ts`

**Description :** Connecte un utilisateur avec email et mot de passe.

**Input (FormData) :**
| Champ | Type | Validation |
|-------|------|------------|
| `email` | string | Email valide, requis |
| `password` | string | Min 8 caractères, requis |

**Output :**
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      role?: 'admin' | 'moniteur' | 'membre';
    };
  };
  message?: string;
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Email ou mot de passe incorrect
- `VALIDATION_ERROR` - Champs invalides
- `INTERNAL_ERROR` - Erreur serveur

---

### 2.2 `registerAction`

**Fichier :** `src/app/(auth)/actions.ts`

**Description :** Crée un nouveau compte utilisateur.

**Input (FormData) :**
| Champ | Type | Validation |
|-------|------|------------|
| `email` | string | Email valide, requis |
| `password` | string | Min 8 caractères, requis |
| `confirmPassword` | string | Doit correspondre à password |
| `fullName` | string | Max 200 caractères, requis |
| `role` | 'membre' | Optionnel, défaut 'membre' |

**Output :**
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      role: 'admin' | 'moniteur' | 'membre';
    };
  };
  message: string;
}
```

**Codes d'erreur :**
- `CONFLICT` - Email déjà utilisé
- `VALIDATION_ERROR` - Champs invalides
- `DATABASE_ERROR` - Erreur création compte
- `INTERNAL_ERROR` - Erreur serveur

---

### 2.3 `logoutAction`

**Fichier :** `src/app/(auth)/actions.ts`

**Description :** Déconnecte l'utilisateur actuel.

**Input :** Aucun

**Output :**
```typescript
{
  success: true;
  data: undefined;
}
```

**Codes d'erreur :**
- `INTERNAL_ERROR` - Erreur déconnexion

**Note :** Redirige vers `/login` après succès.

---

### 2.4 `forgotPasswordAction`

**Fichier :** `src/app/(auth)/actions.ts`

**Description :** Envoie un email de réinitialisation de mot de passe.

**Input (FormData) :**
| Champ | Type | Validation |
|-------|------|------------|
| `email` | string | Email valide, requis |

**Output :**
```typescript
{
  success: true;
  data: undefined;
  message: string;
}
```

**Codes d'erreur :**
- `DATABASE_ERROR` - Erreur envoi email
- `VALIDATION_ERROR` - Email invalide
- `INTERNAL_ERROR` - Erreur serveur

---

### 2.5 `checkSessionAction`

**Fichier :** `src/app/(auth)/actions.ts`

**Description :** Vérifie si l'utilisateur est connecté.

**Input :** Aucun

**Output :**
```typescript
{
  success: true;
  data: {
    isAuthenticated: boolean;
    user?: {
      id: string;
      email: string;
      role?: 'admin' | 'moniteur' | 'membre';
    };
  };
}
```

**Codes d'erreur :**
- `INTERNAL_ERROR` - Erreur vérification

---

## 3. RÉSERVATIONS

### 3.1 `createReservationAction`

**Fichier :** `src/app/(dashboard)/membre/reservations/actions.ts`

**Description :** Crée une nouvelle réservation de court.

**Input (FormData) :**
| Champ | Type | Validation |
|-------|------|------------|
| `courtId` | string | UUID valide, requis |
| `startTime` | string | Date future, requis |
| `endTime` | string | > startTime, requis |
| `type` | 'membre' | Optionnel, défaut 'membre' |
| `notes` | string | Max 500 caractères |

**Output :**
```typescript
{
  success: true;
  data: {
    id: string;
    courtId: number;
    userId: string;
    startTime: string;
    endTime: string;
    status: 'confirmée' | 'en_attente' | 'annulée';
    type: string;
    notes?: string | null;
  };
  message: string;
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `VALIDATION_ERROR` - Champs invalides
- `CONFLICT` - Créneau déjà réservé
- `DATABASE_ERROR` - Erreur création
- `INTERNAL_ERROR` - Erreur serveur

**Cache Revalidation :**
- `revalidatePath('/(dashboard)/membre')`
- `revalidatePath('/(dashboard)/membre/reservations')`
- `revalidateTag('reservations')`

---

### 3.2 `updateReservationAction`

**Fichier :** `src/app/(dashboard)/membre/reservations/actions.ts`

**Description :** Modifie une réservation existante.

**Input (FormData) :**
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string | UUID valide, requis |
| `courtId` | string | UUID valide |
| `startTime` | string | Date future |
| `endTime` | string | > startTime |
| `type` | 'membre' | - |
| `status` | 'confirmée' | - |
| `notes` | string | Max 500 caractères |

**Output :**
```typescript
{
  success: true;
  data: {
    id: string;
    courtId: number;
    userId: string;
    startTime: string;
    endTime: string;
    status: string;
    type: string;
    notes?: string | null;
  };
  message: string;
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `NOT_FOUND` - Réservation inexistante
- `FORBIDDEN` - Non propriétaire et non admin
- `VALIDATION_ERROR` - Champs invalides
- `DATABASE_ERROR` - Erreur modification
- `INTERNAL_ERROR` - Erreur serveur

**Cache Revalidation :**
- `revalidatePath('/(dashboard)/membre')`
- `revalidatePath('/(dashboard)/membre/reservations')`
- `revalidateTag('reservations')`

---

### 3.3 `cancelReservationAction`

**Fichier :** `src/app/(dashboard)/membre/reservations/actions.ts`

**Description :** Annule une réservation (soft delete via statut).

**Input (FormData) :**
| Champ | Type | Validation |
|-------|------|------------|
| `id` | string | UUID valide, requis |

**Output :**
```typescript
{
  success: true;
  data: undefined;
  message: string;
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `NOT_FOUND` - Réservation inexistante
- `FORBIDDEN` - Non propriétaire et non admin
- `FORBIDDEN` - Annulation < 24h avant (non admin)
- `DATABASE_ERROR` - Erreur annulation
- `INTERNAL_ERROR` - Erreur serveur

**Règle métier :** Annulation possible uniquement 24h avant la réservation (sauf admin).

**Cache Revalidation :**
- `revalidatePath('/(dashboard)/membre')`
- `revalidatePath('/(dashboard)/membre/reservations')`
- `revalidateTag('reservations')`

---

### 3.4 `getUserReservationsAction`

**Fichier :** `src/app/(dashboard)/membre/reservations/actions.ts`

**Description :** Récupère les réservations confirmées d'un utilisateur.

**Input :** Aucun (utilise la session)

**Output :**
```typescript
{
  success: true;
  data: Array<{
    id: string;
    court: {
      id: number;
      name: string;
      type?: string | null;
    };
    startTime: string;
    endTime: string;
    status: string;
    type: string;
  }>;
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `DATABASE_ERROR` - Erreur récupération
- `INTERNAL_ERROR` - Erreur serveur

---

## 4. DASHBOARD MEMBRE

### 4.1 `getMemberDashboardData`

**Fichier :** `src/app/(dashboard)/membre/actions.ts`

**Description :** Récupère toutes les données du dashboard membre.

**Input :** Aucun (utilise la session)

**Output :**
```typescript
{
  success: true;
  data: {
    nextReservation: {
      id: string;
      court: { id: number; name: string };
      startTime: string;
      endTime: string;
    } | null;
    upcomingReservations: Array<{
      id: string;
      court: { id: number; name: string };
      startTime: string;
    }>;
    availableCourts: Array<{
      id: number;
      name: string;
      type?: string | null;
      status: string;
    }>;
    stats: {
      totalReservations: number;
      hoursPlayedThisMonth: number;
    };
  };
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `INTERNAL_ERROR` - Erreur serveur

---

### 4.2 `getAvailableCourtsAction`

**Fichier :** `src/app/(dashboard)/membre/actions.ts`

**Description :** Récupère les courts disponibles pour une date donnée.

**Input :** `date: string` (format ISO)

**Output :**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    name: string;
    type?: string | null;
    isAvailable: boolean;
  }>;
}
```

**Codes d'erreur :**
- `NOT_FOUND` - Aucun court trouvé
- `INTERNAL_ERROR` - Erreur serveur

---

## 5. DASHBOARD MONITEUR

### 5.1 `getCoachDashboardData`

**Fichier :** `src/app/(dashboard)/moniteur/actions.ts`

**Description :** Récupère toutes les données du dashboard moniteur.

**Input :** Aucun (utilise la session)

**Output :**
```typescript
{
  success: true;
  data: {
    todaySessions: Array<{
      id: string;
      title: string;
      court: { id: number; name: string };
      startTime: string;
      endTime: string;
      type: string;
      studentsCount: number;
    }>;
    recentStudents: Array<{
      id: string;
      fullName: string;
      email: string;
      lastLesson?: string;
    }>;
    stats: {
      totalLessons: number;
      totalStudents: number;
      hoursThisWeek: number;
    };
  };
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `INTERNAL_ERROR` - Erreur serveur

---

### 5.2 `getCoachScheduleAction`

**Fichier :** `src/app/(dashboard)/moniteur/actions.ts`

**Description :** Récupère l'emploi du temps du moniteur.

**Input :** `startDate: string, endDate: string` (format ISO)

**Output :**
```typescript
{
  success: true;
  data: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    court: { id: number; name: string };
    studentsCount: number;
  }>;
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `INTERNAL_ERROR` - Erreur serveur

---

## 6. DASHBOARD ADMIN

### 6.1 `getAdminDashboardData`

**Fichier :** `src/app/(dashboard)/admin/actions.ts`

**Description :** Récupère toutes les données du dashboard admin.

**Input :** Aucun (utilise la session)

**Output :**
```typescript
{
  success: true;
  data: {
    stats: {
      totalMembers: number;
      totalCoaches: number;
      totalReservations: number;
      totalLessons: number;
      revenueThisMonth: number;
    };
    courts: Array<{
      id: number;
      name: string;
      status: string;
      type?: string | null;
      currentReservation?: {
        startTime: string;
        endTime: string;
        userName: string;
      };
    }>;
    recentMembers: Array<{
      id: string;
      fullName: string;
      email: string;
      registeredAt: string;
    }>;
    recentReservations: Array<{
      id: string;
      court: { id: number; name: string };
      user: { fullName: string };
      startTime: string;
      endTime: string;
      status: string;
    }>;
  };
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `FORBIDDEN` - Rôle insuffisant (non admin)
- `INTERNAL_ERROR` - Erreur serveur

---

### 6.2 `getStatsAction`

**Fichier :** `src/app/(dashboard)/admin/actions.ts`

**Description :** Récupère les statistiques générales.

**Input :** Aucun (utilise la session)

**Output :**
```typescript
{
  success: true;
  data: {
    totalMembers: number;
    totalCoaches: number;
    totalReservations: number;
    totalLessons: number;
  };
}
```

**Codes d'erreur :**
- `UNAUTHORIZED` - Non authentifié
- `FORBIDDEN` - Rôle insuffisant (non admin)
- `INTERNAL_ERROR` - Erreur serveur

---

## 7. MIDDLEWARE

### 7.1 Protection des routes

**Fichier :** `middleware.ts`

**Routes publiques :**
- `/`
- `/login`
- `/register`
- `/forgot-password`

**Routes protégées :**
| Route | Rôles autorisés |
|-------|-----------------|
| `/(dashboard)/admin` | admin |
| `/(dashboard)/moniteur` | admin, moniteur |
| `/(dashboard)/membre` | admin, moniteur, membre |

**Redirections :**
- Non authentifié → `/login` avec `?redirect=<pathname>`
- Authentifié sur route publique → Dashboard selon rôle
- Rôle insuffisant → Dashboard du rôle

---

## 8. BONNES PRATIQUES

### 8.1 Côté Client

```typescript
'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/(auth)/actions';

function LoginForm() {
  const [state, dispatch, isPending] = useActionState(loginAction, {
    success: false,
    error: '',
    code: undefined,
  });

  return (
    <form action={dispatch}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Connexion...' : 'Se connecter'}
      </button>
      {state.success === false && (
        <p role="alert">{state.error}</p>
      )}
    </form>
  );
}
```

### 8.2 Côté Serveur (RSC)

```typescript
import { getMemberDashboardData } from '@/app/(dashboard)/membre/actions';

async function MemberDashboard() {
  const result = await getMemberDashboardData();

  if (!result.success) {
    return <ErrorDisplay error={result.error} />;
  }

  return (
    <div>
      <h1>Bienvenue</h1>
      <p>Réservations: {result.data.stats.totalReservations}</p>
    </div>
  );
}
```

---

**Document généré automatiquement par l'Agent Logic**
