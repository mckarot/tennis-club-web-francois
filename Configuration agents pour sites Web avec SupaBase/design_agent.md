# 🎨 UI INTEGRATOR — Performance & UX (Supabase Stack)
**Mission :** Mobile-First, Performance, États UI, Formulaires, Navigation, Dark Mode et Design Tokens.

---

## 📱 RESPONSIVE & PERF
- **Mobile-First :** Tailwind v4 avec approche systématique `min-width`. Aucune classe responsive sans comportement mobile défini d'abord.
- **Lighthouse :** Cibles non négociables : LCP < 2.5s, CLS < 0.1, FID < 100ms, TBT < 200ms.
- **Images :** `next/image` obligatoire. WebP/Avif. `placeholder="blur"`. `sizes` défini pour éviter le surdimensionnement.
- **Fonts :** `next/font` avec `display: 'swap'`. Précharger uniquement la fonte critique du above-the-fold.

---

## 🌗 DARK MODE
Implémentation via CSS custom properties + Tailwind v4 dark variant. Automatique via `prefers-color-scheme`.

```css
/* app/globals.css */
:root {
  --color-surface:          oklch(100% 0 0);
  --color-surface-raised:   oklch(97% 0 0);
  --color-on-surface:       oklch(10% 0 0);
  --color-on-surface-muted: oklch(45% 0 0);
  --color-brand:            oklch(62% 0.18 250);
  --color-brand-hover:      oklch(55% 0.18 250);
  --color-destructive:      oklch(55% 0.22 25);
  --color-success:          oklch(55% 0.18 145);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-surface:          oklch(12% 0 0);
    --color-surface-raised:   oklch(18% 0 0);
    --color-on-surface:       oklch(95% 0 0);
    --color-on-surface-muted: oklch(65% 0 0);
    --color-brand:            oklch(70% 0.18 250);
    --color-brand-hover:      oklch(75% 0.18 250);
  }
}
```

**Règle :** Aucune couleur codée en dur dans les composants. Le toggle manuel (clair/sombre) n'est ajouté que si l'utilisateur le demande explicitement via un `data-theme` sur le `<html>`.

---

## 🎨 DESIGN TOKENS CENTRALISÉS
```typescript
// lib/tokens.ts — Source de vérité unique
export const tokens = {
  colors: {
    brand:       'var(--color-brand)',
    surface:     'var(--color-surface)',
    raised:      'var(--color-surface-raised)',
    text:        'var(--color-on-surface)',
    muted:       'var(--color-on-surface-muted)',
    destructive: 'var(--color-destructive)',
    success:     'var(--color-success)',
  },
  spacing: {
    xs: '0.25rem', sm: '0.5rem', md: '1rem',
    lg: '1.5rem', xl: '2rem', '2xl': '3rem',
  },
  typography: {
    'body-sm':    'text-sm leading-relaxed',
    'body-md':    'text-base leading-relaxed',
    'heading-lg': 'text-2xl font-semibold tracking-tight',
    'heading-xl': 'text-4xl font-bold tracking-tighter',
  },
  radii: {
    sm: '0.375rem', md: '0.5rem', lg: '0.75rem', full: '9999px',
  },
} as const;
```

---

## 🌀 ÉTATS UI OBLIGATOIRES (4 états par écran)

### 1. Skeleton Screens
```tsx
export function OrderListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Chargement en cours">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg h-16"
          style={{ background: 'var(--color-surface-raised)' }}
        />
      ))}
    </div>
  );
}
```

### 2. Empty States
```tsx
// Chaque empty state : icône + titre + description + action principale
export function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <ShoppingBagIcon className="size-12" style={{ color: 'var(--color-on-surface-muted)' }} />
      <h3 className="text-lg font-semibold">Aucune commande</h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--color-on-surface-muted)' }}>
        Vos commandes apparaîtront ici une fois passées.
      </p>
      <Button asChild><Link href="/shop">Parcourir le catalogue</Link></Button>
    </div>
  );
}
```

### 3. Error Boundaries
```tsx
'use client';
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { reportError(error); }, [error]);

  return (
    <div role="alert" className="rounded-lg border p-6 text-center"
      style={{ borderColor: 'var(--color-destructive)', opacity: 0.2 }}>
      <p className="font-medium" style={{ color: 'var(--color-destructive)' }}>
        Quelque chose s'est mal passé.
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-muted)' }}>
        Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
      </p>
      <Button variant="outline" className="mt-4" onClick={reset}>Réessayer</Button>
    </div>
  );
}
```

### 4. Optimistic UI
```tsx
import { useOptimistic } from 'react';

function OrdersList({ orders }: { orders: Order[] }) {
  const [optimisticOrders, addOptimistic] = useOptimistic(
    orders,
    (state, newOrder: Order) => [...state, { ...newOrder, _pending: true }]
  );

  async function handleAdd(formData: FormData) {
    const tempOrder = { id: crypto.randomUUID(), _pending: true, ...parseForm(formData) };
    addOptimistic(tempOrder);
    const result = await createOrder(parseForm(formData));
    if (!result.success) toast.error(result.error);
  }

  return optimisticOrders.map(order => (
    <OrderCard key={order.id} order={order} pending={order._pending} />
  ));
}
```

---

## 📝 GESTION DES FORMULAIRES

```tsx
// Pattern : Zod v4 + React Hook Form + Server Action
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrderInputSchema, type CreateOrderInput } from '@/lib/validations/order';

export function CreateOrderForm() {
  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(CreateOrderInputSchema),
    defaultValues: { amount: 0 },
  });

  async function onSubmit(data: CreateOrderInput) {
    const result = await createOrder(data);
    if (!result.success) {
      form.setError('root', { message: result.error });
    } else {
      toast.success('Commande créée');
      form.reset();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <fieldset disabled={form.formState.isSubmitting}>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-sm font-medium">Montant</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...form.register('amount', { valueAsNumber: true })}
            aria-invalid={!!form.formState.errors.amount}
            aria-describedby="amount-error"
          />
          {form.formState.errors.amount && (
            <p id="amount-error" role="alert" className="text-sm"
              style={{ color: 'var(--color-destructive)' }}>
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        {/* Erreur globale (ex : erreur serveur) */}
        {form.formState.errors.root && (
          <p role="alert" className="text-sm mt-2"
            style={{ color: 'var(--color-destructive)' }}>
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting} className="mt-4">
          {form.formState.isSubmitting ? 'Envoi en cours...' : 'Créer la commande'}
        </Button>

      </fieldset>
    </form>
  );
}
```

**Règles formulaires :**
- Même schéma Zod partagé entre client et serveur (`@/lib/validations/`)
- Messages d'erreur inline sur chaque champ — pas uniquement en toast
- `fieldset disabled` pendant la soumission — évite les doubles soumissions
- `aria-invalid` + `aria-describedby` + `role="alert"` pour l'accessibilité
- `noValidate` sur le `<form>` — déléguer entièrement à Zod/RHF

---

## 🧭 NAVIGATION & ROUTING

### Guards de routes (middleware.ts — délégué au SECURITY_AGENT)
```tsx
// Redirection après login
const searchParams = useSearchParams();
const redirect = searchParams.get('redirect') ?? '/dashboard';
router.push(redirect);
```

### Breadcrumbs — composant générique
```tsx
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isCurrent: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        <li><Link href="/" style={{ color: 'var(--color-on-surface-muted)' }}>Accueil</Link></li>
        {crumbs.map(crumb => (
          <li key={crumb.href} className="flex items-center gap-2">
            <span style={{ color: 'var(--color-on-surface-muted)' }}>/</span>
            {crumb.isCurrent ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} style={{ color: 'var(--color-on-surface-muted)' }}>
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## ♿ ACCESSIBILITÉ — STANDARD MINIMUM
- Tous les éléments interactifs : focusables au clavier, `aria-label` si pas de texte visible
- Ratio de contraste : AA minimum (4.5:1 texte, 3:1 éléments UI)
- `<img>` : attribut `alt` toujours renseigné (vide si décoratif)
- Formulaires : chaque `<input>` associé à un `<label>` via `htmlFor`
- Erreurs : `role="alert"` pour les erreurs, `role="status"` pour les succès
- **Test minimum avant Gate 2 :** navigation complète au clavier + axe DevTools sans violation critique

---

## 📋 CHECKLIST GATE 2 (Design Review)
- [ ] 4 états UI sur chaque écran clé (Skeleton, Empty, Error Boundary, Optimistic)
- [ ] Formulaires : validation inline + aria-invalid + role=alert + fieldset disabled
- [ ] Dark mode : aucune couleur codée en dur, tout passe par les CSS tokens
- [ ] Design tokens centralisés (`lib/tokens.ts`) utilisés — zéro valeur brute dans les composants
- [ ] Navigation : redirect post-login, breadcrumbs sur les pages profondes
- [ ] Lighthouse en build production : LCP < 2.5s, CLS < 0.1
- [ ] Test clavier + axe DevTools sans violation critique
- [ ] `next/image` utilisé sur toutes les images avec `sizes` défini

---

## 🔍 SEO — Métadonnées et Indexation (OBLIGATOIRE pour tout site public)

### Metadata Next.js — chaque page doit définir
```typescript
// app/(app)/orders/page.ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes commandes — MonApp',
  description: 'Consultez l\'historique de vos commandes et leur statut.',
  robots: { index: false },  // Pages protégées : ne pas indexer
};
```

### Open Graph — pour le partage sur réseaux sociaux
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: 'MonApp — Votre solution de gestion', template: '%s | MonApp' },
  description: 'Gérez vos commandes, clients et factures en toute simplicité.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://monapp.com',
    siteName: 'MonApp',
    title: 'MonApp — Votre solution de gestion',
    description: 'Gérez vos commandes, clients et factures en toute simplicité.',
    images: [{
      url: '/og-image.png',       // 1200×630px, PNG optimisé
      width: 1200,
      height: 630,
      alt: 'MonApp — Dashboard',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MonApp — Votre solution de gestion',
    description: 'Gérez vos commandes, clients et factures en toute simplicité.',
    images: ['/og-image.png'],
  },
};
```

### Sitemap et robots.txt
```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://monapp.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://monapp.com/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://monapp.com/pricing', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/api/'],  // Pages protégées
    },
    sitemap: 'https://monapp.com/sitemap.xml',
  };
}
```

### Checklist SEO avant Gate 2
- [ ] Chaque page publique a un `<title>` unique et descriptif (max 60 caractères)
- [ ] Chaque page publique a une `meta description` (max 160 caractères)
- [ ] Image Open Graph générée (1200×630px) et référencée dans le layout racine
- [ ] `sitemap.ts` généré et à jour
- [ ] `robots.ts` configuré — pages protégées en `disallow`
- [ ] URLs canoniques définies (pas de contenu dupliqué)
- [ ] Données structurées (JSON-LD) si applicable (produits, articles, FAQ)
