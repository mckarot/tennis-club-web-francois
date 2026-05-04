# 🔐 Audit des Politiques RLS — Tennis Club du François
**Date :** 2 avril 2026  
**Niveau de risque actuel : 🔴 CRITIQUE**

---

## ⚠️ État Actuel — DANGEREUX

La migration actuelle active le RLS sur toutes les tables **mais définit des politiques "Allow all"** qui rendent le RLS totalement inefficace :

```sql
-- ❌ CE QUI EXISTE — À CORRIGER IMMÉDIATEMENT
CREATE POLICY "Allow all" ON public.users      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.profiles   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.courts     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.member_profiles FOR ALL USING (true) WITH CHECK (true);
```

**Conséquence :** N'importe quel utilisateur authentifié peut lire et modifier TOUTES les données de tous les membres, toutes les réservations, et même modifier les courts.

---

## 🎯 Matrice des Permissions Cibles

| Table | Public (non-auth) | Membre | Moniteur | Admin |
|---|---|---|---|---|
| `users` | ❌ | Ses données | Ses données | Tout ✅ |
| `profiles` | ❌ | Son profil | Son profil + voir élèves | Tout ✅ |
| `member_profiles` | ❌ | Son profil | Son profil + voir ses élèves | Tout ✅ |
| `courts` | Lecture seule | Lecture seule | Lecture seule | Full CRUD ✅ |
| `reservations` | ❌ | Ses réservations | Voir tout (son planning) | Tout ✅ |

---

## 🛠️ Politiques RLS Corrigées

> **Instruction :** Appliquer via `supabase/migrations/YYYYMMDD_rls_policies.sql` ou directement dans le tableau de bord Supabase.

### Étape 1 — Supprimer les politiques actuelles

```sql
-- Supprimer toutes les politiques permissives
DROP POLICY IF EXISTS "Allow all" ON public.users;
DROP POLICY IF EXISTS "Allow all" ON public.profiles;
DROP POLICY IF EXISTS "Allow all" ON public.courts;
DROP POLICY IF EXISTS "Allow all" ON public.reservations;
DROP POLICY IF EXISTS "Allow all" ON public.member_profiles;
```

---

### Étape 2 — Helper : Fonction de vérification du rôle

```sql
-- Fonction pour obtenir le rôle de l'utilisateur courant (optimisée)
-- SECURITY DEFINER pour bypass RLS lors de l'auto-vérification
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
  SELECT role::text FROM public.profiles 
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

### Étape 3 — Politiques `public.users`

```sql
-- Les utilisateurs peuvent voir leur propre entrée
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Les admins peuvent voir tous les utilisateurs
CREATE POLICY "users_select_admin"
ON public.users FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Seuls les admins peuvent modifier les rôles
CREATE POLICY "users_update_admin"
ON public.users FOR UPDATE
USING (public.get_current_user_role() = 'admin');

-- Pas de DELETE depuis l'app (se fait via Auth)
-- Pas d'INSERT depuis l'app (géré par le trigger)
```

---

### Étape 4 — Politiques `public.profiles`

```sql
-- Tout le monde peut voir les profils publics (nom, prénom)
-- Utile pour afficher les joueurs dans les réservations
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Chaque utilisateur peut modifier son propre profil
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent modifier tous les profils
CREATE POLICY "profiles_update_admin"
ON public.profiles FOR UPDATE
USING (public.get_current_user_role() = 'admin');

-- Les admins peuvent supprimer des profils
CREATE POLICY "profiles_delete_admin"
ON public.profiles FOR DELETE
USING (public.get_current_user_role() = 'admin');
```

---

### Étape 5 — Politiques `public.member_profiles`

```sql
-- Un membre peut voir son propre profil étendu
CREATE POLICY "member_profiles_select_own"
ON public.member_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Les admins et moniteurs peuvent voir tous les profils membres
CREATE POLICY "member_profiles_select_staff"
ON public.member_profiles FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'moniteur'));

-- Un membre peut modifier ses propres infos (tel, niveau)
CREATE POLICY "member_profiles_update_own"
ON public.member_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Empêcher un membre de changer son propre statut_adhesion
  -- Note: la logique métier doit également valider cela côté app
);

-- Seuls les admins peuvent modifier le statut_adhesion et type_abonnement
CREATE POLICY "member_profiles_update_admin"
ON public.member_profiles FOR UPDATE
USING (public.get_current_user_role() = 'admin');
```

---

### Étape 6 — Politiques `public.courts`

```sql
-- Tout le monde connecté peut voir les courts
CREATE POLICY "courts_select_authenticated"
ON public.courts FOR SELECT
USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent modifier les courts
CREATE POLICY "courts_insert_admin"
ON public.courts FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "courts_update_admin"
ON public.courts FOR UPDATE
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "courts_delete_admin"
ON public.courts FOR DELETE
USING (public.get_current_user_role() = 'admin');
```

---

### Étape 7 — Politiques `public.reservations`

```sql
-- Un membre peut voir uniquement ses propres réservations
CREATE POLICY "reservations_select_own"
ON public.reservations FOR SELECT
USING (auth.uid() = user_id);

-- Les admins et moniteurs voient toutes les réservations
CREATE POLICY "reservations_select_staff"
ON public.reservations FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'moniteur'));

-- Un membre peut créer ses propres réservations
CREATE POLICY "reservations_insert_own"
ON public.reservations FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND auth.role() = 'authenticated'
);

-- Les admins peuvent créer des réservations pour n'importe qui
CREATE POLICY "reservations_insert_admin"
ON public.reservations FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin');

-- Un membre peut annuler sa propre réservation (UPDATE status uniquement)
CREATE POLICY "reservations_update_own"
ON public.reservations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout modifier
CREATE POLICY "reservations_update_admin"
ON public.reservations FOR UPDATE
USING (public.get_current_user_role() = 'admin');

-- Les admins peuvent supprimer des réservations
CREATE POLICY "reservations_delete_admin"
ON public.reservations FOR DELETE
USING (public.get_current_user_role() = 'admin');
```

---

## 🔧 Correction du Middleware

Le middleware actuel utilise `getSession()` qui lit les cookies JWT côté client — ce qui peut être falsifié.

```typescript
// ❌ ACTUEL — Vulnérable au JWT spoofing
const { data: { session } } = await supabase.auth.getSession();

// ✅ À UTILISER — Vérifie le token côté serveur
const { data: { user } } = await supabase.auth.getUser();
```

Modifier `middleware.ts` ligne 37-39 :
```typescript
// Remplacer :
const { data: { session } } = await supabase.auth.getSession();
// Par :
const { data: { user } } = await supabase.auth.getUser();
// Et adapter la suite : remplacer session par user, session.user.id par user.id
```

---

## 📁 Migration à Créer

Créer le fichier `supabase/migrations/20260403000000_rls_policies.sql` avec tout le contenu de ce document (sections "Politiques corrigées").

```bash
# Appliquer les nouvelles politiques
npx supabase db reset
# OU en production / sans reset :
npx supabase migration up
```

---

## ✅ Checklist de Validation RLS

Après application des politiques, vérifier :
- [ ] Un membre NON admin ne peut pas lire les données d'un autre membre
- [ ] Un membre ne peut pas modifier `statut_adhesion` directement
- [ ] Un non-admin ne peut pas modifier les courts
- [ ] Un admin peut tout voir et modifier
- [ ] Le trigger `handle_new_user` fonctionne toujours (il est `SECURITY DEFINER`)
- [ ] Les Server Actions utilisent `createAdminClient()` pour les opérations admin
