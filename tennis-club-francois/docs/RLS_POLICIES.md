# 🔐 Politiques RLS (Row Level Security)

**Document de référence pour la sécurité des données**

---

## 📜 Principes Généraux

### Règles Absolues

1. **RLS activé par défaut** sur toutes les tables
2. **Aucune lecture/écriture sans authentification** sauf explicitement documenté
3. **user_id obligatoire** sur toutes les tables métier
4. **Politiques documentées** avant chaque mise en production

---

## 🏗️ Structure des Politiques

### Template de Politique

```sql
-- Activation RLS
ALTER TABLE "ma_table" ENABLE ROW LEVEL SECURITY;

-- Politique de lecture
CREATE POLICY "Lecture par propriétaire"
  ON "ma_table" FOR SELECT
  USING (auth.uid() = user_id);

-- Politique d'écriture
CREATE POLICY "Écriture par propriétaire"
  ON "ma_table" FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 📊 Tables et Politiques

### `users`

| Politique | Type | Condition | Description |
|-----------|------|-----------|-------------|
| `users_read_own` | SELECT | `auth.uid() = id` | Lecture de son propre profil |
| `users_update_own` | UPDATE | `auth.uid() = id` | Modification de son propre profil |
| `users_admin_all` | ALL | `is_admin = true` | Accès complet pour admins |

```sql
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own"
  ON "users" FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON "users" FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

### `courts`

| Politique | Type | Condition | Description |
|-----------|------|-----------|-------------|
| `courts_read_all` | SELECT | `true` | Lecture publique des courts |
| `courts_write_admin` | ALL | `is_admin = true` | Gestion par admins |

```sql
ALTER TABLE "courts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courts_read_all"
  ON "courts" FOR SELECT
  USING (true); -- Lecture publique

CREATE POLICY "courts_write_admin"
  ON "courts" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
```

---

### `reservations`

| Politique | Type | Condition | Description |
|-----------|------|-----------|-------------|
| `reservations_read_own` | SELECT | `user_id = auth.uid()` | Voir ses réservations |
| `reservations_write_own` | ALL | `user_id = auth.uid()` | Gérer ses réservations |
| `reservations_admin_all` | ALL | `is_admin = true` | Accès complet admins |

```sql
ALTER TABLE "reservations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_read_own"
  ON "reservations" FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "reservations_write_own"
  ON "reservations" FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reservations_admin_all"
  ON "reservations" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
```

---

### `memberships`

| Politique | Type | Condition | Description |
|-----------|------|-----------|-------------|
| `memberships_read_own` | SELECT | `user_id = auth.uid()` | Voir son adhésion |
| `memberships_write_own` | UPDATE | `user_id = auth.uid()` | Modifier son adhésion |
| `memberships_admin_all` | ALL | `is_admin = true` | Gestion admins |

```sql
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memberships_read_own"
  ON "memberships" FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "memberships_write_own"
  ON "memberships" FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

### `payments`

| Politique | Type | Condition | Description |
|-----------|------|-----------|-------------|
| `payments_read_own` | SELECT | `user_id = auth.uid()` | Voir ses paiements |
| `payments_write_admin` | ALL | `is_admin = true` | Gestion par admins |

```sql
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_read_own"
  ON "payments" FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "payments_write_admin"
  ON "payments" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
```

---

### `competitions`

| Politique | Type | Condition | Description |
|-----------|------|-----------|-------------|
| `competitions_read_all` | SELECT | `true` | Lecture publique |
| `competitions_write_admin` | ALL | `is_admin = true` | Gestion admins |
| `competitions_inscribe` | INSERT | `user_id = auth.uid()` | Inscription par utilisateur |

```sql
ALTER TABLE "competitions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitions_read_all"
  ON "competitions" FOR SELECT
  USING (true);

CREATE POLICY "competitions_inscribe"
  ON "competitions" FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "competitions_write_admin"
  ON "competitions" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
```

---

## 🔍 Audit et Vérification

### Commandes de Vérification

```sql
-- Lister toutes les tables avec RLS activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Lister les politiques par table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier qu'aucune table n'a RLS désactivé (sauf exception)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

### Checklist de Validation

- [ ] Toutes les tables ont `ENABLE ROW LEVEL SECURITY`
- [ ] Chaque table a au moins 1 politique SELECT
- [ ] Chaque table a au moins 1 politique INSERT/UPDATE/DELETE
- [ ] Les politiques admin sont documentées
- [ ] Les politiques user sont testées

---

## 🚨 Exceptions et Cas Particuliers

### Tables Publiques (RLS avec SELECT ouvert)

| Table | Justification |
|-------|---------------|
| `courts` | Consultation publique des disponibilités |
| `competitions` | Affichage publique des compétitions |
| `config` | Configuration publique de l'app |

### Tables Admin-Only

| Table | Justification |
|-------|---------------|
| `payments` | Données financières sensibles |
| `users` (champs sensibles) | Protection des données personnelles |

---

## 📝 Historique des Modifications

| Date | Table | Modification | Auteur |
|------|-------|--------------|--------|
| - | - | - | - |

---

## 🔗 Références

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Agent Architecte](../agents/agent-architecte.md)
