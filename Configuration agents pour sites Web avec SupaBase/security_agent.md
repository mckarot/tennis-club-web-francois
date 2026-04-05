# 🔐 SECURITY GUARDIAN — Supabase Zero-Trust (Production Grade)
**Mission :** Sécurité 360° (RLS, Auth, CSP, Rate Limiting, Storage, Secrets, Monitoring, Sessions).

---

## 🛡️ INFRASTRUCTURE & API

### Headers de sécurité (next.config.ts)
```typescript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // unsafe-eval requis Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self'",
    ].join('; '),
  },
];
```

### Rate Limiting (Upstash Redis sur les Server Actions sensibles)
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(`rl_${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, {
      status: 429,
      headers: { 'Retry-After': '10' },
    });
  }
}
export const config = { matcher: ['/api/:path*'] };
```

### Error Masking — règle absolue
```typescript
// lib/errors.ts
// Les codes d'erreur Supabase ne doivent jamais atteindre le client
const SUPABASE_ERROR_MAP: Record<string, string> = {
  'invalid_credentials': 'Identifiants incorrects',
  'email_not_confirmed': 'Veuillez confirmer votre adresse email',
  'user_already_exists': 'Un compte avec cet email existe déjà',
  'over_request_rate_limit': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'PGRST116': 'Ressource introuvable',          // PostgREST : row not found
  '42501': 'Accès refusé',                      // PostgreSQL : insufficient privilege (RLS)
  '23505': 'Cette valeur existe déjà',          // Unique constraint violation
  '23503': 'Opération impossible : données liées', // FK constraint violation
};

export function toUserError(error: unknown): string {
  const code = (error as any)?.code ?? (error as any)?.error_code ?? '';
  return SUPABASE_ERROR_MAP[code] ?? 'Une erreur est survenue. Veuillez réessayer.';
}
// ⚠️ Jamais exposer error.message, error.details ou error.hint de PostgREST
```

---

## 🔑 AUTHENTICATION SUPABASE

### Client Supabase côté serveur (Server Actions + Middleware)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Pour les Server Actions et Route Handlers
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// Pour les opérations nécessitant le bypass RLS (Server Actions admin uniquement)
// ⚠️ GARDE EXPLICITE : cette fonction ne doit JAMAIS être appelée côté client
export function createServiceClient() {
  // Guard runtime : en développement, logger un warning si usage suspect
  if (typeof window !== 'undefined') {
    throw new Error(
      'createServiceClient() ne doit JAMAIS être appelé côté client. ' +
      'Utilisez createClient() depuis @/lib/supabase/client.ts'
    );
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,  // ⚠️ JAMAIS exposé côté client
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
```

```typescript
// lib/supabase/client.ts — côté client uniquement
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Middleware de protection des routes
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Rafraîchir la session — OBLIGATOIRE pour garder l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();

  // Protéger les routes admin et dashboard
  const protectedRoutes = ['/admin', '/dashboard'];
  const isProtected = protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r));

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
```

### Récupérer l'utilisateur en Server Action — pattern sécurisé
```typescript
// ⚠️ Toujours utiliser getUser() côté serveur — JAMAIS getSession()
// getSession() lit depuis le cookie sans vérification serveur → falsifiable
// getUser() fait un appel réseau vers Supabase Auth → fiable

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Non authentifié');
  return user;
}
```

### Gestion des rôles (via `app_metadata` — non modifiable par le client)
```typescript
// Assigner un rôle via une Edge Function ou un appel Admin SDK
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function setUserRole(userId: string, role: 'admin' | 'moderator' | 'client') {
  const { error } = await adminClient.auth.admin.updateUser(userId, {
    app_metadata: { role },
  });
  if (error) throw error;
}

// Lire le rôle côté serveur (depuis le JWT — sans requête DB)
export async function getUserRole(user: User): Promise<string> {
  return user.app_metadata?.role ?? 'client';
}

// Dans les RLS PostgreSQL — lire depuis le JWT :
// current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role'
```

### Gestion des sessions
- **Durée par défaut Supabase :** JWT valide 1 heure, refresh token valide 7 jours (configurable)
- **Rafraîchissement automatique :** géré par `@supabase/ssr` dans le middleware — ne pas l'implémenter manuellement
- **Révocation d'urgence (compromission) :**
```typescript
// Via Admin Client — révoque tous les refresh tokens de l'utilisateur
await adminClient.auth.admin.signOut(userId, 'global');
```

### Politique de mot de passe (Supabase Auth settings)
```typescript
// Configurer via Supabase Dashboard > Authentication > Settings
// OU via l'API Admin :
await adminClient.auth.admin.updateConfig({
  password_min_length: 12,
  password_required_characters: 3,  // min : lowercase, uppercase, number, symbol
});
```
> ⚠️ À configurer en Gate 1. Un mot de passe faible est la porte d'entrée #1.

### Rotation des JWT secrets
- Supabase permet de rotate les signing keys via le dashboard ou l'API
- **Impact :** déconnecte TOUS les utilisateurs actifs (leurs JWT deviennent invalides)
- **Procédure :**
  1. Planifier une fenêtre de maintenance (ex: 3h du matin)
  2. Prévenir les utilisateurs via banner 24h avant
  3. Roter via `supabase auth rotate-jwt-secret` ou dashboard
  4. Tous les utilisateurs devront se reconnecter
- **Fréquence :** semestrielle minimum, ou immédiate en cas de suspicion de compromission
- **Responsable :** `SECURITY_AGENT` — consigner dans `/docs/runbooks/rotate-jwt-secret.md`

### Rotation des secrets : `SUPABASE_SERVICE_ROLE_KEY` rotation trimestrielle via les secrets GitHub, jamais dans le code

---

## 🔒 ROW LEVEL SECURITY — Règles d'or

1. **RLS activée sur TOUTES les tables** sans exception dès la migration initiale
2. **Défaut : tout refuser** — `ALTER TABLE x ENABLE ROW LEVEL SECURITY` sans politique = refus total ✓
3. **Le Service Role bypass les RLS** — n'utiliser `createServiceClient()` que dans les Server Actions nécessitant un accès admin explicite, jamais côté client
4. **Tester les RLS** via `supabase test db` avant Gate 3
5. **Jamais de `SECURITY DEFINER`** sur des fonctions accessibles depuis le client sans validation d'input stricte

### Pattern RLS avec rôle JWT (sans requête DB supplémentaire)
```sql
-- Lire le rôle directement depuis le JWT app_metadata
-- Performant : pas de SELECT users supplémentaire

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    'client'
  );
$$ LANGUAGE sql STABLE;

CREATE POLICY "orders_admin_full_access" ON orders
  FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1)
    AND deleted_at IS NULL
  );
```

---

## 🗂️ SUPABASE STORAGE SECURITY

```typescript
// Règles de Storage définies dans le dashboard Supabase OU via SQL
// supabase/migrations/0002_storage_policies.sql

-- Bucket avatars : lecture publique, écriture propriétaire
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Bucket documents : privé, propriétaire + admins
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 'documents', false,
  10485760,  -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

CREATE POLICY "documents_select_own_or_admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR get_user_role() = 'admin'
    )
  );
```

---

## 🚨 MONITORING & AUDIT LOGGING

### Table d'audit (toutes actions admin tracées)
```typescript
// src/db/schema/audit_events.ts
export const auditEvents = pgTable('audit_events', {
  ...primaryKeyUUID,
  actor_id: uuid('actor_id').references(() => users.id),
  action: text('action').notNull(),           // 'user.delete' | 'order.refund' | 'role.change'
  target_type: text('target_type').notNull(), // 'user' | 'order'
  target_id: uuid('target_id').notNull(),
  metadata: jsonb('metadata'),                // Diff avant/après, IP, user-agent
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  // Pas de updated_at ni deleted_at — immuable par conception
});

// RLS : jamais lisible ou modifiable depuis le client
// ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
// (Pas de policy CREATE = refus total pour les clients authentifiés)
// Seul le Service Role peut écrire via les Server Actions admin
```

```typescript
// lib/audit.ts
export async function logAuditEvent(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  const serviceDb = createServiceDb();  // Drizzle avec Service Role
  await serviceDb.insert(auditEvents).values({
    actor_id: params.actorId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId,
    metadata: params.metadata ?? null,
  });
}
```

### Alertes Supabase
- Configurer des alertes dans le dashboard Supabase sur les erreurs d'authentification répétées (> 50/min)
- Webhook vers Slack sur les erreurs `42501` (RLS violation) en pic
- Activer les logs d'accès dans **Supabase > Settings > Logs** pour les actions sur Storage

---

## 📋 CHECKLIST GATE 3 (Security Review)

- [ ] CSP headers configurés et testés (outil : CSP Evaluator)
- [ ] RLS activée sur **toutes** les tables sans exception
- [ ] Aucune policy `FOR ALL USING (true)` en production
- [ ] Storage buckets : politiques de taille et type MIME définies en SQL (pas seulement dashboard)
- [ ] `getUser()` utilisé côté serveur — zéro occurrence de `getSession()` dans les Server Actions
- [ ] `SUPABASE_SERVICE_ROLE_KEY` : jamais exposée côté client, jamais dans NEXT_PUBLIC_*
- [ ] Rate Limiting : actif sur toutes les routes API et Server Actions sensibles
- [ ] Error Masking : zéro code PostgREST ou message Supabase brut exposé au client
- [ ] Rôles via `app_metadata` (JWT) — zéro lecture de rôle via `SELECT users`
- [ ] Audit Logging : actif sur toutes les actions admin
- [ ] Révocation de session : procédure documentée et testée
- [ ] Rotation des secrets planifiée dans GitHub Actions
