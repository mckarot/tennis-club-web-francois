# 🗄️ SCHÉMA DRIZZLE — Templates de Référence (Supabase Stack)

---

## Barrel export — `src/db/schema/index.ts`
```typescript
// Toujours exporter depuis l'index pour que Drizzle trouve tous les schémas
export * from './_helpers';
export * from './users';
export * from './orders';
export * from './courses';
export * from './user_courses';
export * from './audit_events';
export * from './feature_flags';
```

---

## Relation 1:N — `users` / `orders`

```typescript
// src/db/schema/users.ts
import { pgTable, text, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { primaryKeyUUID, timestamps, softDelete } from './_helpers';

export const userRoleEnum = pgEnum('user_role', ['client', 'admin', 'moderator']);

export const users = pgTable('users', {
  ...primaryKeyUUID,
  auth_user_id: uuid('auth_user_id').notNull().unique(),  // Référence auth.users.id (Supabase Auth)
  display_name: text('display_name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('client'),
  avatar_url: text('avatar_url'),
  ...timestamps,
  ...softDelete,
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  userCourses: many(userCourses),
}));
```

```typescript
// src/db/schema/orders.ts
import { pgTable, text, integer, pgEnum, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { primaryKeyUUID, timestamps, softDelete } from './_helpers';
import { users } from './users';

export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'refunded', 'cancelled']);

export const orders = pgTable('orders', {
  ...primaryKeyUUID,
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  user_name_snapshot: text('user_name_snapshot').notNull(),
  amount_cents: integer('amount_cents').notNull(),  // Centimes — pas de numeric pour la monnaie
  status: orderStatusEnum('status').notNull().default('pending'),
  idempotency_key: text('idempotency_key'),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  // Requête principale : commandes d'un user, triées par date
  idx_orders_user_created: index('idx_orders_user_id_created_at')
    .on(table.user_id, table.created_at.desc()),
  // Index partiel : commandes actives uniquement
  idx_orders_active: index('idx_orders_active')
    .on(table.user_id)
    .where(sql`deleted_at IS NULL`),
  // Idempotence : contrainte unique DB
  idx_orders_idempotency: uniqueIndex('idx_orders_idempotency_key')
    .on(table.idempotency_key)
    .where(sql`idempotency_key IS NOT NULL`),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.user_id], references: [users.id] }),
}));
```

**Politique RLS associée (fichier SQL versionné) :**
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own_or_admin" ON orders FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() AND deleted_at IS NULL LIMIT 1)
    OR get_user_role() = 'admin'
  );

CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() AND deleted_at IS NULL LIMIT 1)
  );

CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  USING (get_user_role() = 'admin');

-- Pas de policy DELETE → refus total par défaut (soft delete uniquement)
```

---

## Relation M:N — `users` / `courses`

```typescript
// src/db/schema/courses.ts
export const courses = pgTable('courses', {
  ...primaryKeyUUID,
  title: text('title').notNull(),
  instructor_id: uuid('instructor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  published_at: timestamp('published_at', { withTimezone: true }),
  ...timestamps,
  ...softDelete,
});

// src/db/schema/user_courses.ts
export const userCourses = pgTable('user_courses', {
  ...primaryKeyUUID,
  user_id:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  course_id:  uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  progress:   numeric('progress', { precision: 5, scale: 2 }).notNull().default('0'),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  uniq_user_course: unique().on(table.user_id, table.course_id),
  idx_by_user:   index('idx_user_courses_user_id').on(table.user_id),
  idx_by_course: index('idx_user_courses_course_id').on(table.course_id),
}));
```

---

## Exemple de requête Drizzle avec join et filtre soft delete

```typescript
// Récupérer les commandes actives d'un utilisateur, avec son profil
const result = await db
  .select({
    orderId: orders.id,
    amountCents: orders.amount_cents,
    status: orders.status,
    createdAt: orders.created_at,
    userName: users.display_name,
  })
  .from(orders)
  .innerJoin(users, eq(orders.user_id, users.id))
  .where(
    and(
      eq(orders.user_id, userId),
      isNull(orders.deleted_at),   // Filtre soft delete systématique
      isNull(users.deleted_at),
    )
  )
  .orderBy(desc(orders.created_at))
  .limit(20);
```

---

## Validation Zod — schémas partagés client/serveur

```typescript
// lib/validations/order.ts
import { z } from 'zod/v4';

export const CreateOrderInputSchema = z.object({
  amount: z.number({ message: 'Le montant est requis' })
    .positive('Le montant doit être positif')
    .max(10_000, 'Montant maximum : 10 000'),
  idempotency_key: z.string().uuid().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

// Type de retour DB → application (transformation)
// ⚠️ Drizzle retourne numeric en string. Pour la monnaie, convertir en centimes (integer)
// pour éviter les pertes de précision de parseFloat.
export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_name_snapshot: z.string(),
  // Option 1 : Stocker en integer (centimes) — recommandé pour la monnaie
  amount_cents: z.number().int().positive(),  // 99.99€ → 9999 cents
  // Option 2 : Si numeric est obligatoire, utiliser Decimal.js
  // amount: z.string().transform(v => new Decimal(v)),
  status: z.enum(['pending', 'paid', 'refunded', 'cancelled']),
  created_at: z.date(),
  deleted_at: z.date().nullable(),
});

export type Order = z.infer<typeof OrderSchema>;
```

---

## Audit Events — table de traçabilité

```typescript
// src/db/schema/audit_events.ts
import { pgTable, text, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  actor_id: uuid('actor_id'),                      // Nullable : actions système
  action: text('action').notNull(),                // 'user.delete' | 'order.refund'
  target_type: text('target_type').notNull(),
  target_id: uuid('target_id').notNull(),
  metadata: jsonb('metadata'),
  ip_address: text('ip_address'),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  // Pas de updated_at, deleted_at — immuable par conception
});
```

```sql
-- RLS : inaccessible depuis le client — Service Role uniquement
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
-- Pas de policy = refus total. Le Service Role ignore les RLS. ✓
```

---

## Feature Flags — table de configuration dynamique

```typescript
// src/db/schema/feature_flags.ts
export const featureFlags = pgTable('feature_flags', {
  ...primaryKeyUUID,
  key: text('key').notNull().unique(),
  enabled: boolean('enabled').notNull().default(false),
  description: text('description'),
  ...timestamps,
  ...softDelete,
});
```

```sql
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Lecture publique (toute l'app peut lire les flags)
CREATE POLICY "feature_flags_select_all" ON feature_flags
  FOR SELECT USING (deleted_at IS NULL);

-- Modification admin uniquement
CREATE POLICY "feature_flags_admin_write" ON feature_flags
  FOR ALL USING (get_user_role() = 'admin');
```
