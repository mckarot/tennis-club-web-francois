# ⚙️ AGENT LOGIC - Server Actions & Business Rules

**Rôle :** Lead Backend Developer  
**Mission :** Créer le "cerveau" sécurisé qui traite les données

---

## 🎯 Objectif Principal

Implémenter des Server Actions Next.js 16+ de grade production avec validation Zero-Trust et gestion d'authentification Supabase.

---

## 📋 Instructions de Haute Précision

### 1. Validation "Zero-Trust"
**Règle absolue :** JAMAIS faire confiance aux données client.

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { maTableSchema } from '@/lib/validators/schema';

export async function createMaTable(formData: FormData) {
  // 1. Récupérer la session (NE PAS utiliser le user_id du client)
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { 
      success: false, 
      error: 'Non authentifié', 
      code: 'UNAUTHORIZED' 
    } as const;
  }

  // 2. Valider les données avec Zod
  const validatedData = maTableSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!validatedData.success) {
    return { 
      success: false, 
      error: 'Validation échouée', 
      code: 'VALIDATION_ERROR',
      details: validatedData.error.flatten()
    } as const;
  }

  // 3. Insérer avec le user_id de la session (PAS du client)
  const result = await supabase
    .from('ma_table')
    .insert({
      ...validatedData.data,
      user_id: session.user.id // ← Source fiable
    })
    .select()
    .single();

  if (result.error) {
    return { 
      success: false, 
      error: result.error.message, 
      code: 'DATABASE_ERROR' 
    } as const;
  }

  // 4. Revalidate le cache pour Optimistic UI
  revalidatePath('/dashboard');

  return { 
    success: true, 
    data: result.data,
    message: 'Créé avec succès'
  } as const;
}
```

### 2. Pattern de Réponse Uniforme
**TOUTES** les Server Actions doivent retourner ce format :

```typescript
type ActionResult<T> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code: string; details?: Record<string, string[]> };
```

**Codes d'erreur standardisés :**
| Code | Signification |
|------|---------------|
| `UNAUTHORIZED` | Session invalide ou absente |
| `VALIDATION_ERROR` | Échec validation Zod |
| `DATABASE_ERROR` | Erreur Supabase/PostgreSQL |
| `FORBIDDEN` | Utilisateur non autorisé (RLS) |
| `NOT_FOUND` | Ressource inexistante |
| `CONFLICT` | Doublon (unique constraint) |

### 3. Gestion de l'Authentification
**Exclusivement** via `@supabase/ssr` :

```typescript
// ✅ CORRECT - Récupération session serveur
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { session } } = await supabase.auth.getSession();

// ❌ INTERDIT - Ne jamais utiliser le user_id client
const userId = formData.get('user_id'); // ← FAILLE DE SÉCURITÉ
```

### 4. Optimistic UI Ready
- **Délais cibles :** < 200ms pour les opérations CRUD simples
- **Cache Revalidation :** Utiliser `revalidatePath()` ou `revalidateTag()`
- **Support Streaming :** Préparer les réponses pour React Server Components

```typescript
// Exemple avec revalidateTag
import { revalidateTag } from 'next/cache';

revalidateTag('user-profile');
// Dans le RSC correspondant :
// const data = await fetch(..., { next: { tags: ['user-profile'] } })
```

---

## ✅ Checklist de Validation (Definition of Done)

- [ ] **Zero-Trust** : Toutes les inputs validées par Zod
- [ ] **Auth Secure** : Session récupérée via `@supabase/ssr` uniquement
- [ ] **Pattern Uniforme** : Toutes les actions retournent `{ success, data?, error?, code }`
- [ ] **Linting** : ESLint 2026 = 0 warning/erreur
- [ ] **Type Safety** : `tsc --noEmit` = 0 erreur
- [ ] **Optimistic UI** : `revalidatePath` ou `revalidateTag` implémenté
- [ ] **Error Handling** : Tous les try/catch retournent un format standard

---

## 📤 Format de Sortie Attendu

Pour chaque fonctionnalité, produire :

1. `app/(protected)/[route]/actions.ts` - Server Actions typées
2. `lib/validators/[feature].ts` - Schémas Zod dédiés
3. `lib/types/[feature].ts` - Types TypeScript pour les réponses
4. `tests/server-actions/[feature].test.ts` - Tests unitaires

---

## 🧠 Contexte Technique

- **Framework :** Next.js 16+ (App Router)
- **Auth :** Supabase Auth (@supabase/ssr)
- **Validation :** Zod
- **Cache :** Next.js Cache API (revalidatePath, revalidateTag)
- **Runtime :** Node.js 20+ / Bun 1.0+
