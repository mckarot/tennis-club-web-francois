# ⚙️ DEV AGENT — Functional Developer (Supabase Stack)
**Mission :** Idempotence, Tests, Logging, Cache, Edge Functions, Feature Flags et Uploads.

---

## 🛠️ CONTRAT DES SERVER ACTIONS

### ActionResult — type universel
```typescript
// lib/types/action-result.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
```

### Pattern standard d'une Server Action avec Supabase + Drizzle
```typescript
// actions/createOrder.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { createServiceDb } from '@/lib/db/service';  // Drizzle + service role
import { db } from '@/lib/db/client';                // Drizzle + anon (requêtes RLS)
import { orders } from '@/db/schema/orders';
import { CreateOrderInputSchema } from '@/lib/validations/order';
import { toUserError } from '@/lib/errors';
import { logAuditEvent } from '@/lib/audit';
import type { ActionResult } from '@/lib/types/action-result';

export async function createOrder(
  payload: unknown  // unknown : forcer la validation Zod — jamais typer directement
): Promise<ActionResult<{ orderId: string }>> {
  // 1. Authentification — getUser() obligatoire (jamais getSession())
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Non authentifié' };

  // 2. Validation Zod — côté serveur même si déjà validé côté client
  const parsed = CreateOrderInputSchema.safeParse(payload);
  if (!parsed.success) return {
    success: false,
    error: parsed.error.issues[0].message,
    code: 'VALIDATION_ERROR',
  };

  // 3. Récupérer le profil utilisateur (via RLS — safe)
  const [userProfile] = await db
    .select({ id: users.id, display_name: users.display_name })
    .from(users)
    .where(and(eq(users.auth_user_id, user.id), isNull(users.deleted_at)))
    .limit(1);
  if (!userProfile) return { success: false, error: 'Profil utilisateur introuvable' };

  // 4. Idempotence — contrainte unique en DB + vérification applicative
  if (parsed.data.idempotency_key) {
    const [existing] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.idempotency_key, parsed.data.idempotency_key))
      .limit(1);
    if (existing) return { success: true, data: { orderId: existing.id } };
  }

  try {
    // 5. Insertion via Service DB (le Service Role bypass RLS pour les écritures admin)
    //    OU via le client Supabase RLS si la policy INSERT est correcte
    const serviceDb = createServiceDb();
    const [newOrder] = await serviceDb
      .insert(orders)
      .values({
        user_id: userProfile.id,
        user_name_snapshot: userProfile.display_name,
        amount: parsed.data.amount.toString(),
        idempotency_key: parsed.data.idempotency_key ?? null,
      })
      .returning({ id: orders.id });

    // 6. Audit logging
    await logAuditEvent({
      actorId: userProfile.id,
      action: 'order.create',
      targetType: 'order',
      targetId: newOrder.id,
      metadata: { amount: parsed.data.amount },
    });

    return { success: true, data: { orderId: newOrder.id } };
  } catch (e) {
    logger.error({ action: 'createOrder', error: e, userId: userProfile.id }, 'Order creation failed');
    return { success: false, error: toUserError(e) };
  }
}
```

---

## 🔁 RETRY LOGIC — Exponential Backoff
```typescript
// lib/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 300 } = {}
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Codes retryables Supabase / PostgreSQL
      const retryable = ['PGRST500', '57014', 'connection_error'];
      const isRetryable = retryable.some(c => String((error as any)?.code).includes(c));
      if (!isRetryable || attempt === maxAttempts) throw error;
      await new Promise(r => setTimeout(r, baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 💾 STRATÉGIE DE CACHE

### Next.js Server Cache + `unstable_cache`
```typescript
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db/client';

// Cache les données stables (catalogue, config)
export const getCachedProducts = unstable_cache(
  async () => {
    return db.select().from(products).where(isNull(products.deleted_at));
  },
  ['products-list'],
  { revalidate: 3600, tags: ['products'] }  // Cache 1h, invalidable par tag
);

// Invalider après mutation dans la Server Action
import { revalidateTag } from 'next/cache';
revalidateTag('products');
```

### TanStack Query pour le cache client
```typescript
// Durées recommandées par type de données
const queryConfig = {
  userProfile: { staleTime: 5 * 60_000, gcTime: 10 * 60_000 },
  ordersList:  { staleTime: 30_000,     gcTime:  5 * 60_000 },
  realtime:    { staleTime: 0,          refetchInterval: 5000 },
} as const;
```

### Supabase Realtime (pour les données temps-réel)
```typescript
// Uniquement si la fonctionnalité le nécessite vraiment
// Règle : Realtime uniquement si collaboration temps réel requise (chat, live dashboard, booking)
// Pour un site e-commerce, blog, vitrine → NE PAS activer

const channel = supabase
  .channel('orders-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    queryClient.invalidateQueries({ queryKey: ['orders', userId] });
  })
  .subscribe();

// Cleanup obligatoire
return () => { supabase.removeChannel(channel); };
```

---

## ⚡ EDGE FUNCTIONS — Logique asynchrone

### Import map — verrouillage des versions (OBLIGATOIRE)
```json
// supabase/functions/_shared/import_map.json
{
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.49.1",
    "std/http/": "https://deno.land/std@0.208.0/http/",
    "std/encoding/": "https://deno.land/std@0.208.0/encoding/"
  }
}
```

> ⚠️ **Sans import_map.json, les versions ne sont pas lockées et le build peut casser.**
> Chaque Edge Function doit référencer l'import map : `deno run --import-map=../_shared/import_map.json`

Les Edge Functions Supabase couvrent ce que les Server Actions Next.js ne peuvent pas gérer.

```typescript
// supabase/functions/on-order-created/index.ts
import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // Webhook depuis un trigger PostgreSQL ou un appel direct
  const { record, type } = await req.json();

  if (type !== 'INSERT') return new Response('ignored', { status: 200 });

  // Validation de la signature (si appelé via webhook externe)
  const signature = req.headers.get('x-webhook-secret');
  if (signature !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Envoi email transactionnel (Resend, Postmark...)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@monapp.com',
      to: record.user_email,
      subject: 'Confirmation de commande',
      html: `<p>Commande #${record.id} confirmée.</p>`,
    }),
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Trigger PostgreSQL → Edge Function
```sql
-- supabase/migrations/0003_order_webhook_trigger.sql

-- Configuration des URLs (à adapter par environnement)
-- Local :
ALTER DATABASE postgres SET app.edge_function_url = 'http://127.0.0.1:54321/functions/v1';
ALTER DATABASE postgres SET app.webhook_secret = 'dev-secret-change-me';
-- Production (via CI/CD ou dashboard Supabase > SQL Editor) :
-- ALTER DATABASE postgres SET app.edge_function_url = 'https://xxx.functions.supabase.co';
-- ALTER DATABASE postgres SET app.webhook_secret = '<secret depuis GitHub Secrets>';

CREATE OR REPLACE FUNCTION notify_order_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.edge_function_url') || '/on-order-created',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.webhook_secret')
    ),
    body := row_to_json(NEW)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_order_created();
```

### pg_cron — Cron jobs natifs PostgreSQL
```sql
-- supabase/migrations/0004_cron_jobs.sql
-- Extension activée dans Supabase par défaut
SELECT cron.schedule(
  'daily-order-report',
  '0 8 * * *',
  $$
    INSERT INTO daily_reports (date, total_orders, total_revenue)
    SELECT
      CURRENT_DATE - 1,
      COUNT(*),
      SUM(amount)
    FROM orders
    WHERE created_at::date = CURRENT_DATE - 1
      AND deleted_at IS NULL;
  $$
);
```

**Responsabilités Edge Functions :**
- Emails / SMS transactionnels après événement DB (trigger → Edge Function)
- Webhooks entrants (Stripe, GitHub...) : vérification signature + traitement asynchrone
- Intégrations tierces (CRM, ERP) ne pouvant pas être faites en Server Action
- Traitements lourds hors cycle requête HTTP

---

## 🚩 FEATURE FLAGS
```typescript
// lib/feature-flags.ts
import { unstable_cache } from 'next/cache';

// Option 1 : Table Supabase (dynamique, sans redéploiement)
// Cache de 30s pour éviter un appel DB à chaque page load
export const getFeatureFlags = unstable_cache(
  async (): Promise<Record<string, boolean>> => {
    const { data } = await db
      .select({ key: featureFlags.key, enabled: featureFlags.enabled })
      .from(featureFlags)
      .where(isNull(featureFlags.deleted_at));
    return Object.fromEntries((data ?? []).map(f => [f.key, f.enabled]));
  },
  ['feature-flags'],
  { revalidate: 30 }  // TTL court — 30 secondes
);

// Option 2 : Variables d'environnement (statique, zero overhead)
export const FLAGS = {
  NEW_CHECKOUT: process.env.NEXT_PUBLIC_FLAG_NEW_CHECKOUT === 'true',
} as const;
```

---

## 📁 UPLOADS — Supabase Storage

```typescript
// lib/storage/upload.ts
import { createClient } from '@/lib/supabase/client';

export async function uploadFile(
  bucket: 'avatars' | 'documents',
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  // Supabase Storage ne supporte pas nativement le progress côté client
  // Pour les gros fichiers, utiliser XMLHttpRequest ou fetch avec ReadableStream
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,  // Ne jamais écraser un fichier existant
    });

  if (error) throw new Error(toUserError(error));

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

// Validation côté client AVANT upload (ne remplace pas les Storage policies)
export function validateFile(file: File, config: {
  maxSizeMb: number;
  allowedTypes: string[];
}): string | null {
  if (file.size > config.maxSizeMb * 1024 * 1024)
    return `Fichier trop volumineux (max ${config.maxSizeMb} MB)`;
  if (!config.allowedTypes.includes(file.type))
    return `Type de fichier non supporté`;
  return null;
}
```

---

## 🧪 QUALITÉ & TESTS

### Stratégie de test

| Niveau | Outil | Cible | Seuil |
|--------|-------|-------|-------|
| Unitaire | Vitest | Server Actions, utils, validations Zod | > 80% coverage |
| Intégration | Vitest + Supabase local | Flux DB complets (insert → RLS → read) | Scénarios critiques |
| E2E | Playwright | Parcours utilisateur critiques | 100% happy paths |

### Setup Supabase local pour les tests
```typescript
// vitest.setup.ts
import { execSync } from 'child_process';

// Réinitialiser la DB avant chaque suite
beforeAll(async () => {
  execSync('supabase db reset --local', { stdio: 'inherit' });
  execSync('pnpm db:seed', { stdio: 'inherit' });
});
```

### Template de test Server Action
```typescript
// tests/actions/createOrder.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createOrder } from '@/actions/createOrder';

// Mocker Supabase auth pour les tests unitaires
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'auth-user-uuid-1' } },
        error: null,
      }),
    },
  }),
}));

describe('createOrder', () => {
  it('returns error when unauthenticated', async () => {
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any);
    const result = await createOrder({ amount: 100 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Non authentifié');
  });

  it('is idempotent with same idempotency_key', async () => {
    const first = await createOrder({ amount: 100, idempotency_key: 'test-key-1' });
    const second = await createOrder({ amount: 100, idempotency_key: 'test-key-1' });
    expect(first.success && second.success).toBe(true);
    if (first.success && second.success) {
      expect(first.data.orderId).toBe(second.data.orderId);
    }
  });

  it('rejects invalid amount', async () => {
    const result = await createOrder({ amount: -50 });
    expect(result.success).toBe(false);
    expect(result.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## 📝 LOGGING STRUCTURÉ
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_VERSION,
  },
  redact: {
    paths: ['*.password', '*.token', '*.secret', '*.key', '*.authorization'],
    censor: '[REDACTED]',
  },
});

// Usage :
logger.info({ action: 'createOrder', userId, orderId }, 'Order created');
logger.warn({ action: 'createOrder', attempt: 2 }, 'Retrying after timeout');
logger.error({ action: 'createOrder', error: e, userId }, 'Order creation failed');
```
