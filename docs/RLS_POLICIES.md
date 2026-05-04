# 🔐 POLITIQUES ROW LEVEL SECURITY (RLS)

## Tennis Club du François

**Date de création :** 31 mars 2026  
**Statut :** ✅ Implémenté via `scripts/fix-database-issues.sql`

---

## 📋 Vue d'ensemble

Ce document décrit toutes les politiques Row Level Security (RLS) implémentées pour la base de données du Tennis Club du François.

### Principes de sécurité

1. **Zero-Trust** : Par défaut, aucune donnée n'est accessible sans politique explicite
2. **Ownership** : Chaque utilisateur ne peut accéder qu'à SES propres données
3. **Rôle-based** : Les administrateurs ont un accès étendu selon leur rôle
4. **Least Privilege** : Chaque politique accorde uniquement les permissions nécessaires

---

## 📊 Matrice des permissions

| Table | Public | Authenticated | Owner | Moniteur | Admin |
|-------|--------|---------------|-------|----------|-------|
| `users` | ❌ | ❌ | Read+Update | ❌ | All |
| `profiles` | ❌ | ❌ | Read+Update | ❌ | All |
| `member_profiles` | ❌ | ❌ | Read+Update | ❌ | All |
| `coach_profiles` | ❌ | ❌ | Read+Update | ❌ | All |
| `courts` | ❌ | Read | ❌ | ❌ | All |
| `reservations` | ❌ | ❌ | Read+Write | ❌ | All |
| `reservation_participants` | ❌ | ❌ | Read+Write | ❌ | All |
| `cours` | ❌ | Read | ❌ | Read+Write (ses cours) | All |
| `cours_inscriptions` | ❌ | ❌ | Read+Write (ses inscriptions) | ❌ | All |
| `club_settings` | ❌ | Read | ❌ | ❌ | All |
| `notifications` | ❌ | ❌ | Read+Write | ❌ | All |

---

## 📄 Détail des politiques par table

### 1. Table `users`

**Objectif :** Protéger les données d'authentification des utilisateurs

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `users_owner_read` | SELECT | `auth.uid() = id` | L'utilisateur peut lire ses propres données |
| `users_owner_update` | UPDATE | `auth.uid() = id` | L'utilisateur peut modifier ses propres données |
| `users_admin_all` | ALL | `role = 'admin'` | L'admin a un accès complet |

**Exemple d'usage :**
```sql
-- Un utilisateur peut lire son propre rôle
SELECT role FROM public.users WHERE id = auth.uid();

-- Un utilisateur peut modifier son email
UPDATE public.users SET email = 'nouvel@email.com' WHERE id = auth.uid();
```

---

### 2. Table `profiles`

**Objectif :** Protéger les informations personnelles des utilisateurs

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `profiles_owner_read` | SELECT | `auth.uid() = user_id` | Lecture de son propre profil |
| `profiles_owner_update` | UPDATE | `auth.uid() = user_id` | Modification de son propre profil |
| `profiles_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

**Exemple d'usage :**
```typescript
// Server Action pour mettre à jour le profil
await supabase
  .from('profiles')
  .update({ telephone: '0123456789' })
  .eq('user_id', user.id); // RLS vérifie que c'est le bon user
```

---

### 3. Table `member_profiles`

**Objectif :** Protéger les informations spécifiques aux membres/élèves

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `member_profiles_owner_read` | SELECT | `auth.uid() = user_id` | Lecture de son profil membre |
| `member_profiles_owner_update` | UPDATE | `auth.uid() = user_id` | Modification de son profil membre |
| `member_profiles_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

**Données protégées :**
- Niveau de tennis
- Statut d'adhésion
- Type d'abonnement
- Heures jouées dans le mois

---

### 4. Table `coach_profiles`

**Objectif :** Protéger les informations spécifiques aux moniteurs

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `coach_profiles_owner_read` | SELECT | `auth.uid() = user_id` | Lecture de son profil coach |
| `coach_profiles_owner_update` | UPDATE | `auth.uid() = user_id` | Modification de son profil coach |
| `coach_profiles_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

**Données protégées :**
- Certifications
- Spécialités
- Années d'expérience
- Disponibilités

---

### 5. Table `courts`

**Objectif :** Gérer l'accès aux informations des courts

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `courts_public_read` | SELECT | `authenticated` | Tous les utilisateurs authentifiés peuvent voir les courts |
| `courts_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet (création, modification, suppression) |

**Justification :**
- Les courts sont des informations publiques pour tous les membres
- Seuls les admins peuvent modifier la configuration des courts

---

### 6. Table `reservations`

**Objectif :** Protéger les réservations de courts

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `reservations_owner_read` | SELECT | `auth.uid() = user_id` | Lecture de ses propres réservations |
| `reservations_owner_insert` | INSERT | `auth.uid() = user_id` | Création de ses propres réservations |
| `reservations_owner_update` | UPDATE | `auth.uid() = user_id` | Modification de ses propres réservations |
| `reservations_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

**Exemple d'usage :**
```typescript
// Un utilisateur ne peut voir QUE ses réservations
const { data } = await supabase
  .from('reservations')
  .select('*'); // RLS filtre automatiquement par user_id

// Un admin voit TOUTES les réservations
// (car la politique admin bypass le filtre)
```

---

### 7. Table `reservation_participants`

**Objectif :** Gérer les participants aux réservations multi-joueurs

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `reservation_participants_owner_read` | SELECT | `auth.uid() = user_id` | Voir ses propres participations |
| `reservation_participants_owner_insert` | INSERT | `auth.uid() = user_id` | S'ajouter comme participant |
| `reservation_participants_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

---

### 8. Table `cours`

**Objectif :** Gérer l'accès aux cours/leçons

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `cours_public_read` | SELECT | `authenticated` | Tous les authentifiés peuvent voir les cours disponibles |
| `cours_moniteur_insert` | INSERT | `moniteur_id = auth.uid() OR admin` | Moniteurs créent leurs cours |
| `cours_moniteur_update` | UPDATE | `moniteur_id = auth.uid() OR admin` | Moniteurs modifient leurs cours |
| `cours_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

**Justification :**
- Les cours sont visibles par tous (catalogue public)
- Chaque moniteur gère SES propres cours
- Les admins peuvent tout gérer

---

### 9. Table `cours_inscriptions`

**Objectif :** Gérer les inscriptions aux cours

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `cours_inscriptions_owner_read` | SELECT | `auth.uid() = eleve_id` | Voir ses propres inscriptions |
| `cours_inscriptions_owner_insert` | INSERT | `auth.uid() = eleve_id` | S'inscrire à un cours |
| `cours_inscriptions_owner_update` | UPDATE | `auth.uid() = eleve_id` | Modifier/annuler son inscription |
| `cours_inscriptions_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

---

### 10. Table `club_settings`

**Objectif :** Configuration globale du club

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `club_settings_public_read` | SELECT | `authenticated` | Tous les authentifiés peuvent voir les paramètres |
| `club_settings_admin_all` | ALL | `role = 'admin'` | Admin seul peut modifier |

**Données accessibles :**
- Nom du club
- Description
- Tarifs
- Horaires d'ouverture

---

### 11. Table `notifications`

**Objectif :** Gérer les préférences de notifications

#### Politiques

| Nom | Type | Condition | Description |
|-----|------|-----------|-------------|
| `notifications_owner_read` | SELECT | `auth.uid() = user_id` | Voir ses préférences |
| `notifications_owner_insert` | INSERT | `auth.uid() = user_id` | Créer ses préférences |
| `notifications_owner_update` | UPDATE | `auth.uid() = user_id` | Modifier ses préférences |
| `notifications_admin_all` | ALL | `role = 'admin'` | Admin a un accès complet |

---

## 🧪 Tests de vérification

### Tester les politiques RLS

```sql
-- 1. Vérifier que RLS est activé sur toutes les tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Vérifier les politiques existantes
SELECT tablename, policyname, cmd, roles, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Tester en tant qu'utilisateur normal
SET LOCAL ROLE postgres;
SET LOCAL "app.settings.jwt_claims" TO '{"sub": "USER_UUID_HERE"}';

-- Devrait retourner les réservations de l'utilisateur
SELECT * FROM public.reservations;

-- 4. Tester en tant qu'admin
SET LOCAL "app.settings.jwt_claims" TO '{"sub": "ADMIN_UUID_HERE", "role": "admin"}';

-- Devrait retourner TOUTES les réservations
SELECT * FROM public.reservations;
```

---

## 🔧 Maintenance

### Ajouter une nouvelle politique

1. Créer la politique dans `scripts/fix-database-issues.sql`
2. Documenter dans ce fichier
3. Tester avec différents rôles
4. Mettre à jour la matrice des permissions

### Supprimer une politique

```sql
DROP POLICY IF EXISTS "nom_politique" ON public.nom_table;
```

### Désactiver RLS temporairement (DEBUG uniquement)

```sql
-- ⚠️ JAMAIS en production
ALTER TABLE public.nom_table DISABLE ROW LEVEL SECURITY;
```

---

## 🚨 Dépannage

### Problème : "permission denied for table"

**Cause :** RLS est activé mais aucune politique ne correspond à l'utilisateur

**Solution :**
1. Vérifier que l'utilisateur est authentifié
2. Vérifier que la politique existe pour le type d'opération (SELECT, INSERT, UPDATE, DELETE)
3. Vérifier que la condition de la politique est correcte

### Problème : "policy expression is not a boolean"

**Cause :** La condition de la politique contient une erreur

**Solution :** Vérifier la syntaxe SQL de la condition

### Problème : Les admins ne peuvent pas tout voir

**Cause :** La politique admin n'est pas correctement configurée

**Solution :** Vérifier que la politique `admin_all` utilise :
```sql
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

---

## 📚 Références

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Audit Database Complet](./AUDIT_DATABASE_COMPLET.md)

---

**Document créé par :** Data-Schema-Architect  
**Date :** 31 mars 2026  
**Statut :** ✅ Politiques implémentées
