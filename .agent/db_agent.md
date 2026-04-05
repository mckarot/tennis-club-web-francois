# 🗄️ DB AGENT — Supabase + Drizzle ORM (Production Grade)
**Mission :** Schéma relationnel, Migrations, RLS, Indexes, Seed et Cycle de vie des données.

---

## 🛠️ SETUP DRIZZLE — Configuration de référence

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',   // Barrel export de tous les fichiers de schéma
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,     // Pointe sur local en dev, prod en CI
  },
  verbose: true,
  strict: true,                         // Refuse les migrations destructives sans confirmation
});
```

```typescript
// src/db/client.ts — UN SEUL client par environnement
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Supabase local  : postgresql://postgres:postgres@127.0.0.1:54322/postgres
// Supabase cloud  : Session Pooler (port 5432) pour Server Actions / SSR
//                   Transaction Pooler (port 6543) pour les Edge Functions

const connectionString = process.env.DATABASE_URL!;

// Mode pooling explicite via variable d'environnement (pas de détection fragile par le port)
const poolMode = process.env.DB_POOL_MODE ?? 'session';  // 'session' | 'transaction'
const isPgBouncer = poolMode === 'transaction';

const sql = postgres(connectionString, {
  prepare: !isPgBouncer,     // Désactiver prepare pour le Transaction Pooler (PgBouncer)
  max: isPgBouncer ? 1 : 10, // Max 1 connexion en mode transaction (Edge Functions)
});

export const db = drizzle(sql, { schema, logger: process.env.NODE_ENV === 'development' });
```

### Scripts npm obligatoires
```json
{
  "scripts": {
    "db:generate":  "drizzle-kit generate",
    "db:migrate":   "drizzle-kit migrate",
    "db:push":      "drizzle-kit push",
    "db:studio":    "drizzle-kit studio",
    "db:seed":      "tsx src/db/seed.ts",
    "db:reset":     "supabase db reset && pnpm db:seed"
  }
}
```

> ⚠️ `db:push` = local uniquement (développement rapide, pas de fichier de migration généré).
> `db:generate` + `db:migrate` = obligatoires pour staging et production.

---

## 📋 SCHÉMA DRIZZLE — Conventions et patterns

### Helpers partagés (à réutiliser dans tous les schémas)
```typescript
// src/db/schema/_helpers.ts
import { timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Timestamps automatiques gérés par PostgreSQL (pas par l'application)
export const timestamps = {
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

// Soft delete systématique — jamais de DELETE physique sur les données métier
export const softDelete = {
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
};

// Clé primaire UUID v4 générée par PostgreSQL
export const primaryKeyUUID = {
  id: uuid('id').primaryKey().defaultRandom(),
};
```

### Trigger `updated_at` automatique — migration SQL versionnée (PAS de script TS)
```sql
-- supabase/migrations/0000_add_updated_at_trigger.sql
-- Appliqué automatiquement par supabase db push / CI/CD

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer à chaque table métier avec updated_at :
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_courses_updated_at
  BEFORE UPDATE ON user_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

> ⚠️ **Jamais de script TypeScript pour appliquer les triggers.** Le SQL versionné dans `/supabase/migrations/` est la seule source de vérité. Chaque nouvelle table avec `updated_at` doit avoir son `CREATE TRIGGER` ajouté ici.

---

## 🗃️ SCHÉMAS DE RÉFÉRENCE

### Relation 1:N — `users` / `orders`
```typescript
// src/db/schema/users.ts
import { pgTable, text, pgEnum } from 'drizzle-orm/pg-core';
import { primaryKeyUUID, timestamps, softDelete } from './_helpers';

export const userRoleEnum = pgEnum('user_role', ['client', 'admin', 'moderator']);

export const users = pgTable('users', {
  ...primaryKeyUUID,
  auth_user_id: uuid('auth_user_id')          // FK vers auth.users — gérée via SQL custom ci-dessous
    .notNull()
    .unique(),
  display_name: text('display_name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('client'),
  avatar_url: text('avatar_url'),
  ...timestamps,
  ...softDelete,
});
```

#### FK vers `auth.users` — SQL custom obligatoire (Drizzle ne peut pas référencer les tables système)
```sql
-- supabase/migrations/0000_fk_auth_users.sql
-- À appliquer APRÈS la création de la table users par Drizzle
-- Garantit la cohérence : un user sans entrée auth.users ne peut pas exister

ALTER TABLE users
  ADD CONSTRAINT fk_users_auth_user
  FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Index pour accélérer les jointures auth → profile
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
```

> ⚠️ **Ordre d'application :** `pnpm db:migrate` (Drizzle crée la table) **avant** `supabase db push` (SQL custom ajoute la FK). Dans la CI/CD, respecter cet ordre.

```typescript
// src/db/schema/orders.ts
import { pgTable, text, integer, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { primaryKeyUUID, timestamps, softDelete } from './_helpers';
import { users } from './users';

export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'refunded', 'cancelled']);

export const orders = pgTable('orders', {
  ...primaryKeyUUID,
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),  // restrict : jamais orphelin
  user_name_snapshot: text('user_name_snapshot').notNull(), // Dénormalisé — immuable après création
  amount_cents: integer('amount_cents').notNull(),           // Stocker en centimes — pas de numeric
  status: orderStatusEnum('status').notNull().default('pending'),
  idempotency_key: text('idempotency_key').unique(),        // Constraint DB pour l'idempotence
  ...timestamps,
  ...softDelete,
});

// Relations Drizzle (pour les requêtes avec .with())
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.user_id], references: [users.id] }),
}));
```

### Relation M:N — `users` / `courses`
```typescript
// src/db/schema/courses.ts
export const courses = pgTable('courses', {
  ...primaryKeyUUID,
  title: text('title').notNull(),
  instructor_id: uuid('instructor_id').notNull().references(() => users.id),
  published_at: timestamp('published_at', { withTimezone: true }),
  ...timestamps,
  ...softDelete,
});

// Table de jointure explicite — pas de many() implicite Drizzle pour les M:N avec attributs
export const userCourses = pgTable('user_courses', {
  ...primaryKeyUUID,
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  course_id: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  progress: numeric('progress', { precision: 5, scale: 2 }).notNull().default('0'),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  // Contrainte d'unicité composite — un seul enregistrement par paire user/course
  uniq_user_course: unique().on(table.user_id, table.course_id),
}));
```

---

## 📊 INDEXES — Stratégie obligatoire

Tout index doit être justifié par une requête réelle. Documenter dans le fichier de schéma.

```typescript
import { index, uniqueIndex } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  // ... champs
}, (table) => ({
  // Index pour la requête principale : orders par user, triés par date desc
  idx_orders_user_created: index('idx_orders_user_id_created_at')
    .on(table.user_id, table.created_at.desc()),

  // Index partiel : uniquement les commandes non supprimées (filtre soft delete fréquent)
  idx_orders_active: index('idx_orders_active')
    .on(table.user_id)
    .where(sql`deleted_at IS NULL`),

  // Index pour l'idempotence
  idx_orders_idempotency: uniqueIndex('idx_orders_idempotency_key')
    .on(table.idempotency_key)
    .where(sql`idempotency_key IS NOT NULL`),
}));
```

**Règle :** Chaque requête avec `WHERE` + `ORDER BY` sur des colonnes différentes = index composite. Valider avec `EXPLAIN ANALYZE` sur l'émulateur local avant Gate 1.

---

## 🔒 ROW LEVEL SECURITY (RLS) — Patterns PostgreSQL

Les politiques RLS sont définies dans des fichiers SQL versionnés, **pas** dans le dashboard Supabase.

```sql
-- supabase/migrations/0001_rls_orders.sql
-- Activer RLS sur toutes les tables métier
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Helper réutilisable : vérifie que l'utilisateur est admin
-- (le rôle est stocké dans user_metadata après connexion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Politique orders : SELECT
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
    OR is_admin()
  );

-- Politique orders : INSERT (via Server Action uniquement — jamais direct)
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Politique orders : UPDATE (admins uniquement)
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE
  USING (is_admin());

-- Politique orders : DELETE — interdite (soft delete uniquement)
-- Pas de politique DELETE = refus total par défaut ✓
```

### Tester les RLS sur l'émulateur local
```bash
# Lancer Supabase local
supabase start

# Lancer les tests de politiques RLS
supabase test db

# Fichier de test : supabase/tests/rls_orders.test.sql
BEGIN;
SELECT plan(4);

-- Test 1 : un client ne voit que ses propres commandes
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid-1", "role": "authenticated"}';
SELECT is(
  (SELECT count(*)::int FROM orders WHERE deleted_at IS NULL),
  2,  -- Nombre de commandes attendues pour user-uuid-1
  'Client voit uniquement ses commandes'
);

ROLLBACK;
```

---

## 🔄 STRATÉGIE DE MIGRATION

### Workflow standard
```bash
# 1. Modifier le schéma Drizzle
# 2. Générer la migration
pnpm db:generate

# 3. Réviser le fichier généré dans /drizzle/migrations/
#    Vérifier : pas de DROP TABLE, pas de DROP COLUMN sans backup

# 4. Appliquer sur local
pnpm db:migrate

# 5. Tester RLS et intégration sur local
pnpm test:integration

# 6. Commiter migration + schéma ensemble
git add drizzle/migrations/ src/db/schema/
git commit -m "feat(db): add order status enum and index"

# 7. CI/CD applique la migration sur production (voir audit_complet)
```

### Migrations destructives — procédure obligatoire
```typescript
// Pattern : expand-contract pour les colonnes critiques
// Étape 1 (migration A) : ajouter la nouvelle colonne nullable
// Étape 2 (code) : écrire dans les deux colonnes
// Étape 3 (migration B, sprint suivant) : supprimer l'ancienne colonne

// JAMAIS : renommer une colonne en une seule migration
// TOUJOURS : nullable d'abord, contrainte NOT NULL après backfill

// Backfill pattern :
await db.execute(sql`
  UPDATE orders
  SET new_column = derive_value(old_column)
  WHERE new_column IS NULL
    AND deleted_at IS NULL
`);
// Puis ALTER TABLE orders ALTER COLUMN new_column SET NOT NULL;
```

---

## 🌱 SEED DATA

```typescript
// src/db/seed.ts — Idempotent, effaçable, réaliste
import { db } from './client';
import { users, orders } from './schema';
import { faker } from '@faker-js/faker';

async function seed() {
  console.log('🌱 Seeding database...');

  // Truncate dans l'ordre inverse des FK
  await db.delete(orders);
  await db.delete(users);

  // Créer des utilisateurs de test
  const [adminUser] = await db.insert(users).values({
    auth_user_id: '00000000-0000-0000-0000-000000000001',  // UUID fixe pour les tests
    display_name: 'Admin Test',
    email: 'admin@test.local',
    role: 'admin',
  }).returning();

  const [clientUser] = await db.insert(users).values({
    auth_user_id: '00000000-0000-0000-0000-000000000002',
    display_name: 'Client Test',
    email: 'client@test.local',
    role: 'client',
  }).returning();

  // Créer des commandes réalistes
  await db.insert(orders).values(
    Array.from({ length: 10 }).map(() => ({
      user_id: clientUser.id,
      user_name_snapshot: clientUser.display_name,
      amount: faker.commerce.price({ min: 10, max: 500 }),
      status: faker.helpers.arrayElement(['pending', 'paid'] as const),
    }))
  );

  console.log('✅ Seed complete');
}

seed().catch(console.error).finally(() => process.exit());
```

---

## 🧹 CYCLE DE VIE DES DONNÉES

- **Soft Delete :** Champ `deleted_at` sur toutes les tables métier. Les politiques RLS filtrent automatiquement via `WHERE deleted_at IS NULL` dans les helpers.
- **Hard Delete autorisé :** Uniquement sur les données non-métier (logs, sessions, audit_events > 2 ans), avec validation Orchestrateur.
- **Cascade :** `ON DELETE RESTRICT` sur les FK critiques (évite les suppressions accidentelles). `ON DELETE CASCADE` uniquement sur les tables de jointure.
- **pg_cron pour le nettoyage TTL :**
```sql
-- Activer pg_cron dans Supabase (extension)
SELECT cron.schedule(
  'cleanup-soft-deleted',
  '0 3 * * *',  -- Chaque nuit à 3h
  $$
    DELETE FROM audit_events
    WHERE created_at < now() - interval '2 years';
  $$
);
```

---

## 📋 CHECKLIST GATE 1 (DB Review)
- [ ] Schéma Drizzle : helpers `timestamps`, `softDelete`, `primaryKeyUUID` utilisés partout
- [ ] Trigger `update_updated_at_column` appliqué sur toutes les tables avec `updated_at`
- [ ] Migration générée (`drizzle-kit generate`) et révisée manuellement
- [ ] Migration testée sur émulateur local (`pnpm db:migrate`)
- [ ] Indexes justifiés et définis dans le schéma (pas dans le dashboard)
- [ ] Politiques RLS créées pour chaque table + testées via `supabase test db`
- [ ] Contraintes FK avec `onDelete` explicite (`restrict` ou `cascade` — jamais par défaut)
- [ ] Seed data idempotente et réaliste
- [ ] `EXPLAIN ANALYZE` validé sur les requêtes critiques
- [ ] Pas de `drizzle-kit push` prévu en production — uniquement `migrate`
