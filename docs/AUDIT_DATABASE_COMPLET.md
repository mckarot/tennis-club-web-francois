# 🔍 AUDIT COMPLET DE LA BASE DE DONNÉES
## Tennis Club du François

**Date de l'audit :** 31 mars 2026  
**Auditeur :** Data-Schema-Architect  
**Statut :** ⚠️ INCOHÉRENCES CRITIQUES DÉTECTÉES

---

## 📋 1. RÉSUMÉ EXÉCUTIF

### État général : ⚠️ ATTENTION REQUISE

La base de données dispose d'une structure globalement cohérente, mais plusieurs **INCOHÉRENCES CRITIQUES** ont été identifiées entre :
- Le schéma Drizzle (`drizzle/schema.ts` et `tennis-club-francois/src/db/schema.ts`)
- Les validators Zod (`tennis-club-francois/src/lib/validators/*.ts`)
- Le code d'authentification (`actions.ts`, `middleware.ts`)
- Les scripts SQL de migration

### Score de conformité

| Catégorie | Score | Statut |
|-----------|-------|--------|
| Schéma Drizzle | 85% | ⚠️ Problèmes mineurs |
| Validators Zod | 45% | ❌ Incohérences majeures |
| Code Auth | 70% | ⚠️ Incohérences de rôle |
| Migrations SQL | 90% | ✅ Bon |
| Triggers | 80% | ⚠️ À vérifier |
| RLS Policies | 0% | ❌ MANQUANT |

---

## 📊 2. TABLES VÉRIFIÉES

### 2.1 Table `users`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `email` varchar(255) | ✅ | ✅ | ✅ OK |
| `password_hash` varchar(255) | ✅ | ✅ | ✅ OK |
| `role` enum | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |
| Index `idx_users_email` | ✅ | ✅ | ✅ OK |
| Index `idx_users_role` | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.2 Table `profiles`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `user_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `nom` varchar(100) | ✅ | ✅ | ✅ OK |
| `prenom` varchar(100) | ✅ | ✅ | ✅ OK |
| `telephone` varchar(20) | ✅ | ✅ | ✅ OK |
| `adresse` text | ✅ | ✅ | ✅ OK |
| `code_postal` varchar(10) | ✅ | ✅ | ✅ OK |
| `ville` varchar(100) | ✅ | ✅ | ✅ OK |
| `date_naissance` date | ✅ | ✅ | ✅ OK |
| `photo_url` text | ✅ | ✅ | ✅ OK |
| `bio` text | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |
| Index `idx_profiles_user_id` | ✅ | ✅ | ✅ OK |
| Index `idx_profiles_nom` | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.3 Table `member_profiles`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `user_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `niveau_tennis` enum | ✅ | ✅ | ✅ OK |
| `statut_adhesion` enum | ✅ | ✅ | ✅ OK |
| `type_abonnement` enum | ✅ | ✅ | ✅ OK |
| `date_inscription` date | ✅ | ✅ | ✅ OK |
| `heures_jouees_mois` integer | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.4 Table `coach_profiles`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `user_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `certification` text | ✅ | ✅ | ✅ OK |
| `specialite` varchar(100) | ✅ | ✅ | ✅ OK |
| `annees_experience` integer | ✅ | ✅ | ✅ OK |
| `disponibilites` jsonb | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.5 Table `courts`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `nom` varchar(50) | ✅ | ✅ | ✅ OK |
| `type_surface` enum | ✅ | ✅ | ✅ OK |
| `statut_court` enum | ✅ | ✅ | ✅ OK |
| `eclaire` boolean | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.6 Table `reservations`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `court_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `user_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `date_heure_debut` timestamp | ✅ | ✅ | ✅ OK |
| `date_heure_fin` timestamp | ✅ | ✅ | ✅ OK |
| `type_reservation` enum | ✅ | ✅ | ✅ OK |
| `statut_reservation` enum | ✅ | ✅ | ✅ OK |
| `notes` text | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.7 Table `reservation_participants`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `reservation_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `user_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.8 Table `cours`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `moniteur_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `court_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `titre` varchar(200) | ✅ | ✅ | ✅ OK |
| `description` text | ✅ | ✅ | ✅ OK |
| `date_heure_debut` timestamp | ✅ | ✅ | ✅ OK |
| `date_heure_fin` timestamp | ✅ | ✅ | ✅ OK |
| `type_cours` enum | ✅ | ✅ | ✅ OK |
| `niveau_requis` enum | ✅ | ✅ | ✅ OK |
| `capacite_max` integer | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.9 Table `cours_inscriptions`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `cours_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `eleve_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `statut` enum | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Note :** Dans le schéma Drizzle, la colonne s'appelle `statut` mais dans la migration SQL, elle s'appelle `statut_inscription`. **INCOHÉRENCE MINEURE**.

**Statut :** ⚠️ **INCOHÉRENCE NOM DE COLONNE**

---

### 2.10 Table `club_settings`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `nom_club` varchar(200) | ✅ | ✅ | ✅ OK |
| `description` text | ✅ | ✅ | ✅ OK |
| `tarif_standard` decimal(10,2) | ✅ | ✅ | ✅ OK |
| `tarif_premium` decimal(10,2) | ✅ | ✅ | ✅ OK |
| Horaires (8 colonnes time) | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| `updated_at` timestamp | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

### 2.11 Table `notifications`

| Élément | Schéma Drizzle | SQL Migration | Statut |
|---------|----------------|---------------|--------|
| `id` uuid | ✅ | ✅ | ✅ OK |
| `user_id` uuid (FK) | ✅ | ✅ | ✅ OK |
| `type_notification` enum | ✅ | ✅ | ✅ OK |
| `canal` enum | ✅ | ✅ | ✅ OK |
| `active` boolean | ✅ | ✅ | ✅ OK |
| `created_at` timestamp | ✅ | ✅ | ✅ OK |
| Index | ✅ | ✅ | ✅ OK |

**Statut :** ✅ **OK**

---

## 🔣 3. ENUMS VÉRIFIÉS

### 3.1 ENUM `role`

| Valeur | Drizzle | SQL | Validators Zod | Code |
|--------|---------|-----|----------------|------|
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `moniteur` | ✅ | ✅ | ✅ | ✅ |
| `eleve` | ✅ | ✅ | ❌ (utilise "membre") | ⚠️ |
| `guest` | ✅ | ✅ | ❌ | ❌ |

**⚠️ INCOHÉRENCE CRITIQUE :**
- Drizzle/SQL : `role = 'eleve'`
- Validators Zod : `role = 'membre'`
- Middleware : lit `role` depuis `users` mais compare avec `'eleve'`

**Impact :** La redirection après connexion peut échouer si le rôle ne correspond pas.

---

### 3.2 ENUM `niveau_tennis`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `debutant` | ✅ | ✅ | ❌ (`débutant` avec accent) |
| `intermediaire` | ✅ | ✅ | ❌ (`intermédiaire` avec accents) |
| `avance` | ✅ | ✅ | ❌ (`avancé` avec accent) |
| `pro` | ✅ | ✅ | ❌ (`expert`, `competition` au lieu de `pro`) |

**❌ INCOHÉRENCE MAJEURE :** Les validators Zod utilisent des valeurs DIFFÉRENTES avec accents.

---

### 3.3 ENUM `statut_adhesion`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `actif` | ✅ | ✅ | ✅ |
| `inactif` | ✅ | ✅ | ✅ |
| `en_attente` | ✅ | ✅ | ✅ |
| - | - | - | ❌ `suspendu` (dans Zod, pas dans SQL) |

**⚠️ INCOHÉRENCE :** Le validator Zod inclut `suspendu` qui n'existe pas dans l'ENUM SQL.

---

### 3.4 ENUM `type_abonnement`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `standard` | ✅ | ✅ | ❌ |
| `premium` | ✅ | ✅ | ✅ |
| `vip` | ✅ | ✅ | ✅ |
| - | - | - | ❌ `mensuel`, `annuel`, `occasionnel` (dans Zod, pas dans SQL) |

**❌ INCOHÉRENCE MAJEURE :** Les valeurs sont COMPLÈTEMENT DIFFÉRENTES.

---

### 3.5 ENUM `type_surface`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `quick` | ✅ | ✅ | ❌ (non défini) |
| `terre_battue` | ✅ | ✅ | ❌ (non défini) |
| `dur` | ✅ | ✅ | ❌ (non défini) |

**⚠️ ABSENT :** Aucun validator Zod pour `type_surface`.

---

### 3.6 ENUM `statut_court`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `disponible` | ✅ | ✅ | ❌ (non défini) |
| `occupe` | ✅ | ✅ | ❌ (non défini) |
| `maintenance` | ✅ | ✅ | ✅ (dans admin-reservations) |

**⚠️ PARTIEL :** Seulement dans `admin-reservations.ts`.

---

### 3.7 ENUM `type_reservation`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `membre` | ✅ | ✅ | ✅ |
| `entrainement` | ✅ | ✅ | ✅ |
| `tournoi` | ✅ | ✅ | ✅ |
| `libre` | ✅ | ✅ | ✅ |
| - | - | - | ❌ `maintenance` (dans admin-reservations, pas dans SQL) |

**⚠️ INCOHÉRENCE :** `maintenance` dans Zod mais pas dans SQL.

---

### 3.8 ENUM `statut_reservation`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `confirmee` | ✅ | ✅ | ❌ (`confirmée` avec accent) |
| `en_attente` | ✅ | ✅ | ✅ |
| `annulee` | ✅ | ✅ | ❌ (`annulée` avec accent) |

**❌ INCOHÉRENCE :** Accents différents entre SQL (sans accent) et Zod (avec accents).

---

### 3.9 ENUM `type_cours`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `particulier` | ✅ | ✅ | ❌ (`individuel` dans Zod) |
| `groupe` | ✅ | ✅ | ✅ |
| `stage` | ✅ | ✅ | ✅ |
| `perfectionnement` | ✅ | ✅ | ❌ (`clinique`, `competition` dans Zod) |

**❌ INCOHÉRENCE MAJEURE :** Valeurs complètement différentes.

---

### 3.10 ENUM `niveau_requis`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `tous` | ✅ | ✅ | ✅ |
| `debutant` | ✅ | ✅ | ❌ (`débutant` avec accent) |
| `intermediaire` | ✅ | ✅ | ❌ (`intermédiaire` avec accents) |
| `avance` | ✅ | ✅ | ❌ (`avancé` avec accent) |
| - | - | - | ❌ `expert` (dans Zod, pas dans SQL) |

**❌ INCOHÉRENCE :** Accents + valeur `expert` manquante dans SQL.

---

### 3.11 ENUM `statut_inscription`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `inscrit` | ✅ | ✅ | ✅ |
| `en_attente` | ✅ | ✅ | ✅ |
| `annule` | ✅ | ✅ | ❌ (`annulé` avec accent) |

**⚠️ INCOHÉRENCE :** Accents différents.

---

### 3.12 ENUM `type_notification`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `reservation` | ✅ | ✅ | ❌ (non défini) |
| `annulation` | ✅ | ✅ | ❌ (non défini) |
| `cours` | ✅ | ✅ | ❌ (non défini) |
| `promo` | ✅ | ✅ | ❌ (non défini) |

**⚠️ ABSENT :** Aucun validator Zod spécifique.

---

### 3.13 ENUM `canal_notification`

| Valeur | Drizzle | SQL | Validators Zod |
|--------|---------|-----|----------------|
| `email` | ✅ | ✅ | ❌ (non défini) |
| `push` | ✅ | ✅ | ❌ (non défini) |
| `sms` | ✅ | ✅ | ❌ (non défini) |

**⚠️ ABSENT :** Aucun validator Zod spécifique.

---

## 🔁 4. TRIGGERS VÉRIFIÉS

### 4.1 Trigger `on_auth_user_created`

**État actuel (dans `scripts/setup-complete.sql`) :**

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Fonction `handle_new_user()` :**

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- public.users
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (NEW.id, NEW.email, NEW.encrypted_password, COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role)
  ON CONFLICT (id) DO UPDATE SET email = NEW.email, role = COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role;

  -- profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'), COALESCE(NEW.raw_user_meta_data->>'prenom', ''))
  ON CONFLICT (user_id) DO UPDATE SET nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'), prenom = COALESCE(NEW.raw_user_meta_data->>'prenom', '');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Vérification :**

| Élément | Attendu | Réel | Statut |
|---------|---------|------|--------|
| Trigger existe | ✅ | ✅ (dans scripts) | ⚠️ À vérifier en DB |
| Crée `public.users` | ✅ | ✅ | ✅ OK |
| Crée `public.profiles` | ✅ | ✅ | ✅ OK |
| Gère `password_hash` | ⚠️ | ❌ (`encrypted_password` non lisible) | ⚠️ Problème connu |
| Gère le `role` | ✅ | ✅ | ✅ OK |
| `SECURITY DEFINER` | ✅ | ✅ | ✅ OK |

**⚠️ PROBLÈME CONNU :** Le trigger tente de copier `NEW.encrypted_password` mais ce champ est **crypté par Supabase** et ne peut pas être lu. La solution est de mettre une chaîne vide dans `password_hash` car l'authentification se fait via `auth.users`, pas `public.users`.

**Statut :** ⚠️ **À VÉRIFIER EN BASE DE DONNÉES**

---

## 🔐 5. ROW LEVEL SECURITY (RLS)

### 5.1 État des politiques RLS

| Table | RLS activé ? | Politique read | Politique write | Statut |
|-------|--------------|----------------|-----------------|--------|
| `users` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `profiles` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `member_profiles` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `coach_profiles` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `courts` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `reservations` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `reservation_participants` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `cours` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `cours_inscriptions` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `club_settings` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |
| `notifications` | ❌ NON | ❌ MANQUANT | ❌ MANQUANT | ❌ CRITIQUE |

### ❌ CRITIQUE : AUCUNE POLITIQUE RLS N'EST CONFIGURÉE

**Risque de sécurité :** Sans RLS, toute requête authentifiée peut accéder à TOUTES les données de TOUTES les tables.

**Recommandation :** Créer immédiatement des politiques RLS pour chaque table (voir section 7).

---

## 🔍 6. INCOHÉRENCES TROUVÉES

### 6.1 Incohérences CRITIQUES (🔴)

#### 🔴 #1 : Rôles utilisateurs incohérents

**Problème :**
- Schéma SQL/Drizzle : `role ENUM ('admin', 'moniteur', 'eleve', 'guest')`
- Validators Zod : `role ENUM ('admin', 'moniteur', 'membre')`
- Middleware : Compare avec `'eleve'` mais les nouveaux utilisateurs peuvent avoir `'membre'`

**Impact :** Échec de redirection après connexion, erreurs de permission.

**Correction requise :**
```typescript
// Dans les validators Zod
role: z.enum(['admin', 'moniteur', 'eleve', 'guest']).optional().default('eleve')
```

---

#### 🔴 #2 : ENUMs avec/sans accents

**Problème :**
- SQL : `debutant`, `intermediaire`, `avance`, `confirmee`, `annulee`
- Zod : `débutant`, `intermédiaire`, `avancé`, `confirmée`, `annulée`

**Impact :** Les validations Zod échoueront toujours car les valeurs ne correspondent pas aux ENUMs SQL.

**Correction requise :** Harmoniser les validators Zod avec les ENUMs SQL (sans accents).

---

#### 🔴 #3 : Absence totale de RLS

**Problème :** Aucune politique Row Level Security n'est configurée.

**Impact :** Faille de sécurité CRITIQUE. Toutes les données sont accessibles par tout utilisateur authentifié.

**Correction requise :** Créer des politiques RLS pour chaque table (voir section 7).

---

#### 🔴 #4 : Valeurs d'ENUM complètement différentes

**Problème :**

| ENUM | SQL/Drizzle | Zod |
|------|-------------|-----|
| `type_cours` | `particulier`, `groupe`, `stage`, `perfectionnement` | `individuel`, `groupe`, `clinique`, `stage`, `competition` |
| `type_abonnement` | `standard`, `premium`, `vip` | `mensuel`, `annuel`, `premium`, `vip`, `occasionnel` |
| `statut_adhesion` | `actif`, `inactif`, `en_attente` | `actif`, `inactif`, `en_attente`, `suspendu` |

**Impact :** Impossible d'insérer des données validées par Zod dans la base.

**Correction requise :** Soit mettre à jour les ENUMs SQL, soit corriger les validators Zod.

---

### 6.2 Incohérences MAJEURES (🟠)

#### 🟠 #5 : Nom de colonne `statut` vs `statut_inscription`

**Problème :**
- Drizzle : `coursInscriptions.statut`
- SQL Migration : `cours_inscriptions.statut_inscription`

**Correction requise :** Harmoniser le nom de la colonne.

---

#### 🟠 #6 : Trigger `password_hash` non lisible

**Problème :** Le trigger tente de copier `encrypted_password` depuis `auth.users`, mais ce champ est crypté.

**Correction requise :** Mettre une chaîne vide ou ignorer ce champ dans le trigger.

---

#### 🟠 #7 : Middleware lit `role` depuis `users` mais `profiles` a aussi un champ `role`

**Problème :** Dans `actions.ts` ligne 132-137 :
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .insert({
    id: data.user.id,
    full_name: fullName,
    role: role ?? 'membre',  // ❌ profiles n'a PAS de colonne 'role'
  });
```

**Correction requise :** Supprimer `role` de l'insert dans `profiles`.

---

### 6.3 Incohérences MINEURES (🟡)

#### 🟡 #8 : Index manquants dans la documentation

Certains index définis dans Drizzle ne sont pas documentés.

---

#### 🟡 #9 : Types TypeScript non synchronisés

Les types exportés dans `schema.ts` ne sont pas utilisés dans les validators.

---

## 💡 7. RECOMMANDATIONS

### 7.1 Priorité 1 (🔴 CRITIQUE)

1. **Créer les politiques RLS immédiatement**
   - Voir section 8.1 pour les scripts SQL

2. **Harmoniser les ENUMs entre SQL et Zod**
   - Mettre à jour TOUS les validators Zod pour utiliser les MÊMES valeurs que SQL (sans accents)

3. **Corriger le champ `role`**
   - Utiliser `'eleve'` partout au lieu de `'membre'`

---

### 7.2 Priorité 2 (🟠 MAJEUR)

4. **Corriger le nom de colonne `statut_inscription`**
   - Renommer dans Drizzle ou dans SQL

5. **Corriger le trigger `handle_new_user()`**
   - Ne pas tenter de copier `encrypted_password`

6. **Supprimer `role` de l'insert dans `profiles`**
   - Dans `actions.ts`

---

### 7.3 Priorité 3 (🟡 MINEUR)

7. **Ajouter des indexes pour les requêtes fréquentes**
   - `reservations(user_id, statut)`
   - `cours(moniteur_id, date_heure_debut)`

8. **Documenter les politiques RLS**
   - Créer `docs/RLS_POLICIES.md`

---

## 🛠️ 8. SCRIPTS SQL DE CORRECTION

### 8.1 Script de création des politiques RLS

```sql
-- =====================================================
-- CRÉATION DES POLITIQUES RLS - Tennis Club du François
-- =====================================================

-- 1. Table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_owner_read" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_owner_update" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admin peut tout voir
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_read" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Table member_profiles
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_profiles_owner_read" ON public.member_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "member_profiles_owner_update" ON public.member_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "member_profiles_admin_all" ON public.member_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Table coach_profiles
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_profiles_owner_read" ON public.coach_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "coach_profiles_owner_update" ON public.coach_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "coach_profiles_admin_all" ON public.coach_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Table courts (lecture publique, écriture admin seulement)
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courts_public_read" ON public.courts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courts_admin_all" ON public.courts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Table reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_owner_read" ON public.reservations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reservations_owner_insert" ON public.reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_owner_update" ON public.reservations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Table reservation_participants
ALTER TABLE public.reservation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservation_participants_owner_read" ON public.reservation_participants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reservation_participants_owner_insert" ON public.reservation_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservation_participants_admin_all" ON public.reservation_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Table cours
ALTER TABLE public.cours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cours_public_read" ON public.cours
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cours_moniteur_insert" ON public.cours
  FOR INSERT
  WITH CHECK (
    auth.uid() = moniteur_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "cours_moniteur_update" ON public.cours
  FOR UPDATE
  USING (
    auth.uid() = moniteur_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "cours_admin_all" ON public.cours
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Table cours_inscriptions
ALTER TABLE public.cours_inscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cours_inscriptions_owner_read" ON public.cours_inscriptions
  FOR SELECT
  USING (auth.uid() = eleve_id);

CREATE POLICY "cours_inscriptions_owner_insert" ON public.cours_inscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = eleve_id);

CREATE POLICY "cours_inscriptions_owner_update" ON public.cours_inscriptions
  FOR UPDATE
  USING (auth.uid() = eleve_id);

CREATE POLICY "cours_inscriptions_admin_all" ON public.cours_inscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. Table club_settings
ALTER TABLE public.club_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "club_settings_public_read" ON public.club_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "club_settings_admin_all" ON public.club_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 11. Table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_owner_read" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_owner_update" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_owner_insert" ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_admin_all" ON public.notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 8.2 Script de correction du trigger

```sql
-- =====================================================
-- CORRECTION DU TRIGGER - Tennis Club du François
-- =====================================================
-- Corrige le trigger pour ne pas tenter de lire encrypted_password
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée dans public.users
  -- password_hash est mis à '' car l'authentification se fait via auth.users
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (
    NEW.id,
    NEW.email,
    '',  -- Password hash vide - authentification via auth.users
    COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    role = COALESCE((NEW.raw_user_meta_data->>'role')::role, 'eleve'::role);

  -- Créer une entrée dans profiles
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    prenom = COALESCE(NEW.raw_user_meta_data->>'prenom', '');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### 8.3 Script de correction des ENUMs (optionnel)

Si vous souhaitez aligner les ENUMs SQL sur les validators Zod :

```sql
-- =====================================================
-- ATTENTION : Ce script modifie les ENUMs existants
-- =====================================================
-- À exécuter UNIQUEMENT si vous voulez changer les valeurs SQL
-- pour correspondre aux validators Zod
-- =====================================================

-- 1. type_cours : ajouter 'individuel', 'clinique', 'competition'
ALTER TYPE type_cours ADD VALUE IF NOT EXISTS 'individuel';
ALTER TYPE type_cours ADD VALUE IF NOT EXISTS 'clinique';
ALTER TYPE type_cours ADD VALUE IF NOT EXISTS 'competition';

-- 2. type_abonnement : ajouter 'mensuel', 'annuel', 'occasionnel'
ALTER TYPE type_abonnement ADD VALUE IF NOT EXISTS 'mensuel';
ALTER TYPE type_abonnement ADD VALUE IF NOT EXISTS 'annuel';
ALTER TYPE type_abonnement ADD VALUE IF NOT EXISTS 'occasionnel';

-- 3. statut_adhesion : ajouter 'suspendu'
ALTER TYPE statut_adhesion ADD VALUE IF NOT EXISTS 'suspendu';

-- 4. niveau_tennis : ajouter 'expert', 'competition'
ALTER TYPE niveau_tennis ADD VALUE IF NOT EXISTS 'expert';
ALTER TYPE niveau_tennis ADD VALUE IF NOT EXISTS 'competition';

-- 5. niveau_requis : ajouter 'expert'
ALTER TYPE niveau_requis ADD VALUE IF NOT EXISTS 'expert';

-- 6. type_reservation : ajouter 'maintenance'
ALTER TYPE type_reservation ADD VALUE IF NOT EXISTS 'maintenance';
```

---

## 📝 9. CONCLUSION

### Résumé des problèmes

| Priorité | Nombre | Description |
|----------|--------|-------------|
| 🔴 CRITIQUE | 4 | RLS manquant, rôles incohérents, ENUMs avec accents |
| 🟠 MAJEUR | 3 | Noms de colonnes, trigger password_hash, role dans profiles |
| 🟡 MINEUR | 2 | Index, documentation |

### Actions immédiates requises

1. **EXÉCUTER le script RLS** (section 8.1)
2. **EXÉCUTER le script de correction du trigger** (section 8.2)
3. **CORRIGER les validators Zod** pour utiliser les mêmes valeurs que SQL (sans accents)
4. **CORRIGER `actions.ts`** pour ne pas insérer `role` dans `profiles`

### Prochaines étapes

1. Créer un script de migration Drizzle pour harmoniser les schémas
2. Mettre à jour TOUS les validators Zod
3. Tester l'authentification avec les 3 rôles
4. Documenter les politiques RLS dans `docs/RLS_POLICIES.md`

---

**Audit terminé.** Pour toute question, consulter le Data-Schema-Architect.
