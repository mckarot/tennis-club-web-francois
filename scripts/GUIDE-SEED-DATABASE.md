# 📚 Guide Générique de Remplissage de Database - Supabase Local

**Date :** 2026-04-01  
**Projet :** Tennis Club du François  
**Objectif :** Méthodologie générique pour remplir une database Supabase

---

## 🎯 Principes Fondamentaux

### 1. Structure en 3 Couches

```
┌─────────────────────────────────────────┐
│  Couche 3 : Données de Test (SEED)      │ ← Ce guide
├─────────────────────────────────────────┤
│  Couche 2 : Schéma (TABLES, RLS, etc.)  │ ← create-tables.sql
├─────────────────────────────────────────┤
│  Couche 1 : Auth (auth.users)           │ ← Déjà géré par Supabase
└─────────────────────────────────────────┘
```

**Règle d'Or :** Toujours respecter l'ordre **1 → 2 → 3**

---

## 📝 Méthodologie en 5 Étapes

### Étape 1 : Analyser le Besoin

**Questions à se poser :**

| Question | Réflexion | Exemple |
|----------|-----------|---------|
| **Quel est l'objectif ?** | Tester une feature spécifique | "Tester le Dashboard Admin" |
| **Quelles tables sont nécessaires ?** | Lister les tables minimales | `courts`, `reservations` |
| **Combien de données ?** | Juste assez pour tester | 6 courts, 10 réservations |
| **Quelles relations ?** | Clés étrangères à respecter | `reservations.user_id` → `users.id` |

**Livrable :** Liste des tables + quantités

```markdown
- courts : 6 lignes
- reservations : 10 lignes
- member_profiles : 5 lignes (optionnel)
```

---

### Étape 2 : Identifier les Dépendances

**Arbre de Dépendances :**

```
auth.users (déjà existant)
    ↓
public.users (FK vers auth.users)
    ↓
public.profiles (FK vers users.id)
    ↓
public.member_profiles (FK vers users.id)
    ↓
public.reservations (FK vers users.id, courts.id)
    ↓
public.courts (pas de dépendance)
```

**Ordre d'Insertion :**

1. `courts` (pas de dépendances)
2. `users` (dépend de `auth.users`)
3. `profiles` (dépend de `users`)
4. `reservations` (dépend de `users` et `courts`)

---

### Étape 3 : Choisir la Stratégie d'Insertion

#### Option A : Insertion Simple (Recommandé pour débuter)

**Quand l'utiliser :**
- Tables sans dépendances complexes
- Données statiques
- Premier remplissage

**Pattern :**
```sql
INSERT INTO public.courts (nom, type, disponible) VALUES
  ('Court 1', 'Terre battue', true),
  ('Court 2', 'Terre battue', true),
  ('Court 3', 'Dur', true)
ON CONFLICT (nom) DO UPDATE SET
  type = EXCLUDED.type,
  disponible = EXCLUDED.disponible;
```

**Avantages :**
- ✅ Simple et rapide
- ✅ Lisible
- ✅ Idempotent (peut être exécuté plusieurs fois)

**Inconvénients :**
- ❌ Ne gère pas les relations complexes
- ❌ Nécessite des données statiques

---

#### Option B : Insertion avec Boucle (Pour données dynamiques)

**Quand l'utiliser :**
- Générer beaucoup de lignes similaires
- Données avec variations (dates, statuts)
- Besoin de réalisme

**Pattern :**
```sql
DO $$
DECLARE
  v_court_ids uuid[];
  v_user_id uuid;
  i integer;
BEGIN
  -- Récupérer les références
  SELECT array_agg(id) INTO v_court_ids FROM public.courts;
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'membre@test.com';
  
  -- Boucler pour créer N lignes
  FOR i IN 1..10 LOOP
    INSERT INTO public.reservations (court_id, user_id, start_time, status)
    VALUES (
      v_court_ids[1 + (i % array_length(v_court_ids, 1))],
      v_user_id,
      NOW() + (i || ' days')::interval,
      CASE WHEN i <= 7 THEN 'confirmée' ELSE 'annulée' END
    );
  END LOOP;
END $$;
```

**Avantages :**
- ✅ Génère automatiquement N lignes
- ✅ Variations réalistes
- ✅ Utilise les données existantes

**Inconvénients :**
- ❌ Plus complexe
- ❌ Nécessite PL/pgSQL

---

#### Option C : Insertion avec Utilisateurs Existant

**Quand l'utiliser :**
- Besoin de vrais utilisateurs
- Tests d'authentification
- Données liées à des users

**Pattern :**
```sql
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Utiliser un user existant
  SELECT id INTO v_user_id FROM auth.users 
  WHERE email = 'membre@tennis-club.fr';
  
  -- Insérer les données liées
  INSERT INTO public.reservations (user_id, start_time)
  VALUES (v_user_id, NOW() + INTERVAL '1 day');
END $$;
```

**Avantages :**
- ✅ Utilise les vrais users
- ✅ Pas de duplication dans auth.users
- ✅ Simple

**Inconvénients :**
- ❌ Nécessite des users existants
- ❌ Moins flexible

---

#### Option D : Création Complète d'Utilisateurs

**Quand l'utiliser :**
- Besoin de nouveaux utilisateurs
- Tests complets (auth + données)
- Environnement isolé

**Pattern :**
```sql
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Créer dans auth.users
  INSERT INTO auth.users (email, encrypted_password, ...)
  VALUES (
    'nouveau.membre@email.com',
    crypt('Password123!', gen_salt('bf')),
    ...
  )
  RETURNING id INTO v_user_id;
  
  -- Créer dans public.users
  INSERT INTO public.users (id, email, role)
  VALUES (v_user_id, 'nouveau.membre@email.com', 'membre');
  
  -- Créer dans public.profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (v_user_id, 'Membre', 'Test');
END $$;
```

**Avantages :**
- ✅ Crée des users complets
- ✅ Contrôle total

**Inconvénients :**
- ❌ Complexe
- ❌ Risque de conflits avec auth.users
- ❌ Nécessite de gérer les 3 couches

---

### Étape 4 : Gérer les Conflits et l'Idempotence

#### Pourquoi l'Idempotence est Cruciale

**Problème :** Exécuter le script 2 fois ne doit pas créer de doublons

**Solution : `ON CONFLICT`**

```sql
-- Avec contrainte UNIQUE
INSERT INTO public.courts (nom, type)
VALUES ('Court 1', 'Terre battue')
ON CONFLICT (nom) DO UPDATE SET
  type = EXCLUDED.type,
  updated_at = NOW();

-- Sans contrainte UNIQUE (DO NOTHING)
INSERT INTO public.reservations (court_id, user_id, start_time)
VALUES (...)
ON CONFLICT DO NOTHING;
```

**Règles :**

| Cas | Solution |
|-----|----------|
| Colonne UNIQUE existe | `ON CONFLICT (colonne) DO UPDATE` |
| Pas de UNIQUE | `ON CONFLICT DO NOTHING` |
| Table avec FK | Vérifier que la FK existe avant |

---

### Étape 5 : Vérifier et Valider

#### Commandes de Vérification

```sql
-- 1. Compter les lignes
SELECT 'courts' as table, COUNT(*) as count FROM public.courts
UNION ALL
SELECT 'reservations', COUNT(*) FROM public.reservations;

-- 2. Vérifier les relations
SELECT 
  c.nom as court,
  COUNT(r.id) as reservations
FROM public.courts c
LEFT JOIN public.reservations r ON c.id = r.court_id
GROUP BY c.id, c.nom;

-- 3. Vérifier l'intégrité
SELECT 
  r.id,
  CASE WHEN c.id IS NULL THEN '❌ Court manquant' ELSE '✓ OK' END as court_check,
  CASE WHEN u.id IS NULL THEN '❌ User manquant' ELSE '✓ OK' END as user_check
FROM public.reservations r
LEFT JOIN public.courts c ON r.court_id = c.id
LEFT JOIN public.users u ON r.user_id = u.id;
```

---

## 🛠️ Patterns Réutilisables

### Pattern 1 : Insertion Simple avec Rollback

```sql
BEGIN;

-- Test d'insertion
INSERT INTO public.courts (nom, type, disponible)
VALUES ('Court Test', 'Terre battue', true);

-- Vérification
SELECT * FROM public.courts WHERE nom = 'Court Test';

-- Si OK : COMMIT
-- Si KO : ROLLBACK

COMMIT;
-- ou
ROLLBACK;
```

---

### Pattern 2 : Insertion en Cascade

```sql
DO $$
DECLARE
  v_parent_id uuid;
  v_child_ids uuid[];
BEGIN
  -- 1. Créer le parent
  INSERT INTO public.courts (nom, type)
  VALUES ('Court Parent', 'Dur')
  RETURNING id INTO v_parent_id;
  
  -- 2. Créer les enfants
  INSERT INTO public.reservations (court_id, start_time)
  VALUES 
    (v_parent_id, NOW() + INTERVAL '1 day'),
    (v_parent_id, NOW() + INTERVAL '2 days')
  RETURNING array_agg(id) INTO v_child_ids;
  
  -- 3. Logging
  RAISE NOTICE 'Parent créé: %', v_parent_id;
  RAISE NOTICE 'Enfants créés: %', v_child_ids;
END $$;
```

---

### Pattern 3 : Données Réalistes avec Dates

```sql
DO $$
DECLARE
  v_base_date timestamptz := NOW();
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO public.reservations (start_time, end_time)
    VALUES (
      v_base_date + (i * INTERVAL '1 day') + (i * INTERVAL '2 hour'),
      v_base_date + (i * INTERVAL '1 day') + (i * INTERVAL '2 hour') + INTERVAL '1h30'
    );
  END LOOP;
END $$;
```

---

### Pattern 4 : Nettoyage Complet (Reset)

```sql
-- Attention: Supprime TOUTES les données
BEGIN;

-- 1. Supprimer dans l'ordre inverse des dépendances
DELETE FROM public.reservations;
DELETE FROM public.member_profiles;
DELETE FROM public.profiles;
DELETE FROM public.users;
DELETE FROM public.courts;

-- 2. Optionnel: Reset des sequences
TRUNCATE public.courts, public.reservations RESTART IDENTITY CASCADE;

COMMIT;
```

---

## 📊 Checklist de Validation

### Avant d'Exécuter

- [ ] Schéma de database créé (tables, FK, index)
- [ ] Contraintes UNIQUE en place (pour ON CONFLICT)
- [ ] Utilisateurs de test existants (si besoin)
- [ ] Backup effectué (optionnel mais recommandé)

### Après Exécution

- [ ] Nombre de lignes correct
- [ ] Relations intactes (pas de FK orphelines)
- [ ] Données réalistes (dates, statuts cohérents)
- [ ] Script réexécutable sans erreur

---

## 🎯 Exemple Complet : Dashboard Admin

### Contexte
- **Objectif :** Tester le Dashboard Admin
- **Tables nécessaires :** `courts`, `reservations`
- **Données :** 6 courts, 10 réservations

### Script Final

```sql
-- =====================================================
-- 1. COURTS (pas de dépendances)
-- =====================================================
INSERT INTO public.courts (nom, type, disponible, eclairage) VALUES
  ('Court 01', 'Terre battue', true, true),
  ('Court 02', 'Terre battue', true, true),
  ('Court 03', 'Dur', true, true),
  ('Court 04', 'Dur', true, false),
  ('Court 05', 'Synthétique', true, true),
  ('Court 06', 'Synthétique', true, false)
ON CONFLICT (nom) DO UPDATE SET
  type = EXCLUDED.type,
  updated_at = NOW();

-- =====================================================
-- 2. RESERVATIONS (dépend de courts et users)
-- =====================================================
DO $$
DECLARE
  v_court_ids uuid[];
  v_user_id uuid;
BEGIN
  -- Récupérer les références
  SELECT array_agg(id) INTO v_court_ids FROM public.courts;
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'membre@test.com';
  
  -- Créer 10 réservations
  FOR i IN 1..10 LOOP
    INSERT INTO public.reservations (court_id, user_id, start_time, status)
    VALUES (
      v_court_ids[1 + (i % array_length(v_court_ids, 1))],
      v_user_id,
      NOW() + (i || ' days')::interval,
      CASE WHEN i <= 7 THEN 'confirmée' ELSE 'annulée' END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 3. VÉRIFICATION
-- =====================================================
SELECT 'COURTS: ' || COUNT(*) FROM public.courts;
SELECT 'RÉSERVATIONS: ' || COUNT(*) FROM public.reservations;
```

---

## 🚀 Commandes d'Exécution

### Via Docker (Recommandé)

```bash
# Exécuter un script SQL
cat scripts/mon-seed.sql | docker exec -i supabase_db_<project_id> psql -U postgres -d postgres

# Vérifier les données
docker exec -it supabase_db_<project_id> psql -U postgres -d postgres -c "SELECT COUNT(*) FROM public.courts;"
```

### Via Supabase SQL Editor

1. Ouvrir http://localhost:54323
2. SQL Editor
3. Copier-coller le script
4. Run

---

## 📚 Références

| Fichier | Rôle |
|---------|------|
| `create-tables-*.sql` | Création du schéma |
| `seed-*.sql` | Remplissage des données |
| `GUIDE-SEED-DATABASE.md` | Ce guide méthodologique |

---

**Document généré automatiquement.**  
**Méthode applicable à n'importe quel projet Supabase.**
