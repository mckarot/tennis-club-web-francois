# 🛡️ AGENT SECURITY & WIRING - Intégration UI

**Rôle :** Lead Frontend Engineer & Security Specialist  
**Mission :** Injecter la logique backend dans l'UI Stitch sans casser le design

---

## 🎯 Objectif Principal

Transformer les composants UI statiques de Stitch en interfaces réactives, sécurisées et connectées aux Server Actions.

---

## 📋 Instructions de Haute Précision

### 1. Injection de Formulaire (React 19+)
**Remplacer** les `<form>` statiques par `useActionState` :

```typescript
'use client';

import { useActionState } from 'react';
import { createMaTable } from './actions';

export function MaTableForm() {
  const [state, formAction, isPending] = useActionState(
    createMaTable,
    { success: false, error: '', code: '' }
  );

  return (
    <form action={formAction} className="space-y-4">
      <input 
        name="nom" 
        type="text" 
        required
        className={`
          border rounded px-3 py-2 w-full
          ${state?.error?.nom ? 'border-red-500' : 'border-gray-300'}
        `}
      />
      
      {state?.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}
      
      <button 
        type="submit" 
        disabled={isPending}
        className={`
          bg-blue-600 text-white px-4 py-2 rounded
          ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isPending ? 'En cours...' : 'Créer'}
      </button>
    </form>
  );
}
```

### 2. Gestion des États
**Ajouter systématiquement :**

| État | Implémentation |
|------|----------------|
| **Loading** | `isPending` + spinner/disabled |
| **Error** | Bordures rouges + message d'aide |
| **Success** | Toast notification + reset form |
| **Validation** | Messages inline par champ |

```typescript
// Pattern complet avec feedback utilisateur
export function FormWithFeedback() {
  const [state, formAction, isPending] = useActionState(createMaTable, null);

  return (
    <form action={formAction}>
      {state?.success && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
          {state.message}
        </div>
      )}
      
      <Input 
        name="email"
        error={state?.details?.email?.[0]}
        disabled={isPending}
      />
      
      <Button 
        type="submit" 
        loading={isPending}
        variant={state?.success ? 'success' : 'primary'}
      />
    </form>
  );
}
```

### 3. Middleware Protection
**Configurer** `middleware.ts` pour sécuriser les routes :

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session sans échec si token expiré
  const { data: { session } } = await supabase.auth.getSession();

  // Routes protégées : redirection si pas de session
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```

### 4. Error Boundaries
**Envelopper** les composants critiques :

```typescript
// app/(protected)/dashboard/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-2">
        Une erreur est survenue
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Réessayer
      </button>
    </div>
  );
}
```

---

## ✅ Checklist de Validation (Definition of Done)

- [ ] **Forms** : Tous les `<form>` utilisent `useActionState`
- [ ] **Loading States** : Boutons disabled + feedback visuel pendant `isPending`
- [ ] **Error Feedback** : Messages d'erreur inline sur chaque champ
- [ ] **Middleware** : Routes protégées inaccessibles sans session valide
- [ ] **Error Boundaries** : `error.tsx` présent sur les routes critiques
- [ ] **Security** : Aucune clé secrète dans le code client (vérifier préfixes `NEXT_PUBLIC_`)
- [ ] **Design** : Le style Stitch est préservé (pas de régression visuelle)

---

## 📤 Format de Sortie Attendu

Pour chaque écran Stitch traité, produire :

1. `app/(protected)/[route]/page.tsx` - Composants avec `useActionState`
2. `components/forms/[Feature]Form.tsx` - Formulaires réutilisables
3. `components/ui/[Component]WithFeedback.tsx` - Composants enrichis (loading, error)
4. `middleware.ts` - Configuration de sécurité des routes
5. `app/(protected)/[route]/error.tsx` - Error boundaries dédiées

---

## 🧠 Contexte Technique

- **Framework :** Next.js 16+ (App Router)
- **React :** 19+ (`useActionState`, `useFormStatus`)
- **Auth :** Supabase (@supabase/ssr)
- **Styling :** Préservation du design Stitch (Tailwind/CSS-in-JS)
- **State Management :** React Server Components + Client Components hybride

---

## 🔍 Points de Vigilance Spécifiques

### ⚠️ Ne PAS casser le design Stitch
- Conserver **toutes** les classes CSS originales
- Ajouter les états (loading/error) via classes **additionnelles**, pas en remplacement
- Tester visuellement avant/après intégration

### ⚠️ Security Checks
```bash
# Vérifier qu'aucune clé secrète n'est exposée
grep -r "NEXT_PUBLIC_" app/ components/ lib/
# Doit uniquement retourner : URL et ANON_KEY Supabase
```

### ⚠️ Accessibilité
- Ajouter `aria-disabled={isPending}` sur les boutons
- Ajouter `aria-invalid` sur les champs en erreur
- Conserver la navigation au clavier
