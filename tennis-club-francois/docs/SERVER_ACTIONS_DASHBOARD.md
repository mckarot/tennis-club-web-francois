# Server Actions - Dashboard Admin

**Tennis Club du François**  
**Date :** 2026-04-01  
**Version :** 1.0.0

## Vue d'ensemble

Ce module implémente les Server Actions Zero-Trust pour le Dashboard Admin du Tennis Club du François. Toutes les actions nécessitent une session valide avec le rôle `admin`.

## Architecture

```
src/
├── app/
│   └── dashboard/
│       └── actions.ts              # Server Actions principales
├── lib/
│   ├── types/
│   │   └── dashboard.ts            # Types TypeScript
│   └── validators/
│       └── dashboard.ts            # Schémas Zod
```

## Server Actions Disponibles

### 1. `getAdminDashboardData()`

Récupère toutes les données pour le Dashboard Admin.

**Signature :**
```typescript
export async function getAdminDashboardData(): Promise<ActionResult<DashboardData>>
```

**Données retournées :**
- `stats` : Statistiques globales (membres, réservations, occupation des courts)
- `courts` : Liste des 6 courts avec état d'occupation
- `dernieresReservations` : 10 dernières réservations
- `membresRecents` : 10 membres récemment inscrits

**Exemple d'utilisation :**
```typescript
const result = await getAdminDashboardData();
if (result.success) {
  console.log(result.data.stats.totalMembres);
}
```

---

### 2. `getAllCourtsAction()`

Récupère tous les courts avec leur état d'occupation actuel.

**Signature :**
```typescript
export async function getAllCourtsAction(): Promise<ActionResult<CourtWithOccupation[]>>
```

**Données retournées :**
- Liste complète des courts avec :
  - `id`, `nom`, `type`, `disponible`, `eclairage`
  - `occupation` : Réservation en cours (si applicable)

---

### 3. `getAllReservationsAction(filters?)`

Récupère toutes les réservations avec filtres optionnels.

**Signature :**
```typescript
export async function getAllReservationsAction(filters?: {
  start_date?: string;
  end_date?: string;
  court_id?: string;
  status?: string;
}): Promise<ActionResult<ReservationWithDetails[]>>
```

**Filtres disponibles :**
- `start_date` : Date de début (ISO 8601)
- `end_date` : Date de fin (ISO 8601)
- `court_id` : UUID du court
- `status` : Statut (`confirmée`, `annulée`, `terminée`)

**Exemple :**
```typescript
const result = await getAllReservationsAction({
  start_date: '2026-04-01',
  end_date: '2026-04-30',
  status: 'confirmée'
});
```

---

### 4. `createReservationForUserAction(formData)`

Crée une réservation pour un utilisateur (action admin).

**Signature :**
```typescript
export async function createReservationForUserAction(
  formData: FormData
): Promise<ActionResult<{ reservation: ReservationWithDetails }>>
```

**Champs requis dans FormData :**
```typescript
{
  court_id: string;      // UUID du court
  user_id: string;       // UUID de l'utilisateur
  start_time: string;    // ISO 8601
  end_time: string;      // ISO 8601
  status?: string;       // 'confirmée' (défaut)
  notes?: string;        // Optionnel, max 500 caractères
}
```

**Exemple d'utilisation :**
```typescript
const formData = new FormData();
formData.append('court_id', '00000000-0000-0000-0000-000000000001');
formData.append('user_id', 'user-uuid');
formData.append('start_time', '2026-04-02T10:00:00Z');
formData.append('end_time', '2026-04-02T11:00:00Z');
formData.append('notes', 'Réservation pour cours');

const result = await createReservationForUserAction(formData);
```

**Codes d'erreur possibles :**
- `UNAUTHORIZED` : Session invalide
- `FORBIDDEN` : Rôle insuffisant
- `VALIDATION_ERROR` : Données invalides
- `NOT_FOUND` : Court ou utilisateur inexistant
- `CONFLICT` : Créneau déjà réservé
- `DATABASE_ERROR` : Erreur base de données

---

### 5. `blockCourtAction(formData)`

Bloque un court pour maintenance ou événement.

**Signature :**
```typescript
export async function blockCourtAction(
  formData: FormData
): Promise<ActionResult<void>>
```

**Champs requis dans FormData :**
```typescript
{
  court_id: string;      // UUID du court
  start_time: string;    // ISO 8601
  end_time: string;      // ISO 8601
  reason: string;        // Raison du blocage, max 200 caractères
}
```

**Exemple :**
```typescript
const formData = new FormData();
formData.append('court_id', '00000000-0000-0000-0000-000000000001');
formData.append('start_time', '2026-04-02T08:00:00Z');
formData.append('end_time', '2026-04-02T12:00:00Z');
formData.append('reason', 'Maintenance programmée');

const result = await blockCourtAction(formData);
```

**Effets :**
- Crée une réservation de blocage avec note "BLOCAGE MAINTENANCE: {reason}"
- Marque le court comme indisponible (`disponible: false`)
- Revalide le cache du dashboard

---

### 6. `getMembersAction(filters?)`

Récupère la liste des membres avec filtres et pagination.

**Signature :**
```typescript
export async function getMembersAction(filters?: {
  search?: string;
  role?: 'admin' | 'moniteur' | 'membre';
  limit?: number;
  offset?: number;
}): Promise<ActionResult<{ members: MemberWithProfile[]; total: number }>>
```

**Filtres disponibles :**
- `search` : Recherche sur nom, prénom, email
- `role` : Filtre par rôle
- `limit` : Nombre de résultats (max 100, défaut 50)
- `offset` : Décalage pour pagination (défaut 0)

**Exemple :**
```typescript
const result = await getMembersAction({
  search: 'dupont',
  role: 'membre',
  limit: 20,
  offset: 0
});

// Pagination
const totalPages = Math.ceil(result.data.total / 20);
```

---

## Sécurité Zero-Trust

### Principes appliqués

1. **Session serveur uniquement**
   ```typescript
   // ✅ CORRECT
   const { data: { session } } = await supabase.auth.getSession();
   
   // ❌ INTERDIT
   const userId = formData.get('user_id');
   ```

2. **Validation systématique avec Zod**
   ```typescript
   const validatedData = createReservationForUserSchema.safeParse(rawData);
   if (!validatedData.success) {
     return createErrorResponse('Données invalides', 'VALIDATION_ERROR');
   }
   ```

3. **Vérification du rôle admin**
   ```typescript
   async function requireAdmin() {
     const session = await supabase.auth.getSession();
     if (!session) throw new Error('UNAUTHORIZED');
     
     const profile = await supabase
       .from('profiles')
       .select('role')
       .eq('user_id', session.user.id)
       .single();
     
     if (profile?.role !== 'admin') throw new Error('FORBIDDEN');
   }
   ```

4. **Réponses uniformes**
   ```typescript
   type ActionResult<T> =
     | { success: true; data: T; message?: string }
     | { success: false; error: string; code: ErrorCode; details?: Record<string, string[]> };
   ```

### Codes d'erreur standardisés

| Code | Signification | Exemple |
|------|---------------|---------|
| `UNAUTHORIZED` | Session invalide ou absente | Utilisateur non connecté |
| `FORBIDDEN` | Rôle insuffisant | Membre tente d'accéder à l'admin |
| `VALIDATION_ERROR` | Échec validation Zod | Données de formulaire invalides |
| `DATABASE_ERROR` | Erreur Supabase/PostgreSQL | Échec requête SQL |
| `NOT_FOUND` | Ressource inexistante | Court ou utilisateur introuvable |
| `CONFLICT` | Doublon (unique constraint) | Créneau déjà réservé |
| `BAD_REQUEST` | Requête mal formée | Paramètres manquants |
| `INTERNAL_ERROR` | Erreur serveur inattendue | Exception non gérée |

---

## Gestion du Cache

### Revalidation automatique

Après chaque mutation (création, modification, suppression), le cache est automatiquement revalidé :

```typescript
revalidatePath('/dashboard/admin', 'layout');
```

### Tags de cache (futur)

Pour une granularité plus fine, des tags peuvent être ajoutés lorsque Next.js 16 le permettra sans profil :

```typescript
// Actuellement désactivé car Next.js 16 requiert un profil
// revalidateTag('reservations');
// revalidateTag('courts');
// revalidateTag('members');
```

---

## Types TypeScript

### Types principaux

```typescript
// Données du dashboard
type DashboardData = {
  stats: DashboardStats;
  courts: CourtWithOccupation[];
  dernieresReservations: ReservationWithDetails[];
  membresRecents: MemberWithProfile[];
};

// Statistiques
type DashboardStats = {
  totalMembres: number;
  totalReservations: number;
  courtsOccupes: number;
  courtsDisponibles: number;
  reservationsAujourdhui: number;
};

// Court avec occupation
type CourtWithOccupation = {
  id: string;
  nom: string;
  type: string;
  disponible: boolean;
  eclairage: boolean;
  occupation?: {
    start_time: string;
    end_time: string;
    user?: { id: string; nom?: string | null; ... };
  };
};

// Réservation détaillée
type ReservationWithDetails = {
  id: string;
  court: { nom: string; type: string };
  user: { nom: string | null; prenom: string | null; email: string | null };
  start_time: string;
  end_time: string;
  status: string;
  notes?: string | null;
};

// Membre avec profil
type MemberWithProfile = {
  id: string;
  user_id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone?: string | null;
  niveau_tennis?: string | null;
  created_at: string;
};
```

---

## Validation Zod

### Schémas disponibles

```typescript
// Fichier: src/lib/validators/dashboard.ts

// Filtres réservations
export const reservationsFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  court_id: z.string().uuid().optional(),
  status: z.string().optional(),
});

// Filtres membres
export const membersFilterSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'moniteur', 'membre']).optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

// Création réservation
export const createReservationForUserSchema = z.object({
  court_id: z.string().uuid('Court invalide'),
  user_id: z.string().uuid('Utilisateur invalide'),
  start_time: z.string().min(1, 'L\'heure de début est requise'),
  end_time: z.string().min(1, 'L\'heure de fin est requise'),
  status: reservationStatusSchema.default('confirmée'),
  notes: z.string().max(500, 'Notes trop longues').optional().default(''),
});

// Blocage court
export const blockCourtSchema = z.object({
  court_id: z.string().uuid('Court invalide'),
  start_time: z.string().min(1, 'L\'heure de début est requise'),
  end_time: z.string().min(1, 'L\'heure de fin est requise'),
  reason: z.string().min(1, 'La raison est requise').max(200, 'Raison trop longue'),
});
```

---

## Checklist de Validation

Avant chaque déploiement, vérifier :

- [ ] `tsc --noEmit` = 0 erreur
- [ ] `npm run lint` = 0 warning/error sur les nouveaux fichiers
- [ ] Session via `@supabase/ssr` UNIQUEMENT (PAS de `createBrowserClient`)
- [ ] Toutes les entrées validées par Zod
- [ ] Rôle admin vérifié avant chaque opération
- [ ] Codes d'erreur cohérents (`UNAUTHORIZED`, `FORBIDDEN`, etc.)
- [ ] `revalidatePath` configuré après mutations
- [ ] Messages d'erreur utilisateur-friendly
- [ ] Logs console pour debug (avec préfix `[Dashboard Admin]`)

---

## Exemple Complet d'Utilisation

```typescript
// Dans un Server Component ou Server Action
import {
  getAdminDashboardData,
  createReservationForUserAction,
  getAllReservationsAction,
} from '@/app/dashboard/actions';

// 1. Récupérer les données du dashboard
const dashboard = await getAdminDashboardData();
if (!dashboard.success) {
  // Gérer l'erreur
  return <div>Erreur: {dashboard.error}</div>;
}

// 2. Créer une réservation
const formData = new FormData();
formData.append('court_id', courtId);
formData.append('user_id', userId);
formData.append('start_time', startTime);
formData.append('end_time', endTime);

const result = await createReservationForUserAction(formData);
if (result.success) {
  console.log('Réservation créée:', result.data.reservation);
} else {
  console.error('Erreur:', result.error, result.code);
}

// 3. Filtrer les réservations
const reservations = await getAllReservationsAction({
  start_date: '2026-04-01',
  end_date: '2026-04-30',
  status: 'confirmée',
});
```

---

## Support et Dépannage

### Erreurs courantes

**`UNAUTHORIZED`**
- Vérifier que l'utilisateur est connecté
- Vérifier que les cookies de session sont valides

**`FORBIDDEN`**
- Vérifier que le profil utilisateur a `role = 'admin'` dans la table `profiles`

**`VALIDATION_ERROR`**
- Inspecter `details` dans la réponse pour voir les champs invalides
- Vérifier le format des UUID et dates ISO 8601

**`CONFLICT`**
- Le créneau horaire est déjà réservé
- Vérifier les réservations existantes avant de créer

### Logs de débogage

Toutes les erreurs sont loguées dans la console serveur avec le préfix `[Dashboard Admin]` :

```bash
[Dashboard Admin] createReservationForUserAction error: Error: ...
```

---

## Références

- **Documentation Next.js** : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Documentation Supabase** : https://supabase.com/docs/guides/auth/server-side
- **Documentation Zod** : https://zod.dev/
