# 🗄️ Documentation Base de Données — Tennis Club du François
**Dernière mise à jour :** 2 avril 2026  
**Moteur :** PostgreSQL via Supabase  
**Localisation migration :** `supabase/migrations/20260402000000_initial_schema.sql`

---

## 📐 Schéma Entité-Relation

```
auth.users (Supabase géré)
    │
    ├── 1:1 ──► public.users
    │               │
    │               ├── 1:1 ──► public.profiles
    │               │               │
    │               │               └── 1:1 ──► public.member_profiles
    │               │
    │               └── 1:N ──► public.reservations
    │                               │
    │                               └── N:1 ──► public.courts
    │
    └── (Supabase Auth gère email, password, sessions)
```

---

## 📋 Tables

### `auth.users` (Géré par Supabase)
> Table native Supabase. Ne jamais modifier directement.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid | Clé primaire (référencée partout) |
| `email` | text | Email unique de connexion |
| `raw_user_meta_data` | jsonb | Métadonnées : `{ full_name, role }` |
| `encrypted_password` | text | Hash bcrypt |
| `email_confirmed_at` | timestamptz | Date confirmation email |
| `created_at` | timestamptz | Date création |

---

### `public.users`
> Miroir de `auth.users` pour les requêtes côté app.

```sql
CREATE TABLE public.users (
    id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email      text NOT NULL UNIQUE,
    role       user_role DEFAULT 'membre' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
```

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | uuid | PK, FK auth | Synchronisé avec auth.users |
| `email` | text | UNIQUE, NOT NULL | Email de l'utilisateur |
| `role` | user_role | DEFAULT 'membre' | `admin` · `moniteur` · `membre` |
| `created_at` | timestamptz | AUTO | Date de création |
| `updated_at` | timestamptz | AUTO | Dernière modification |

> ⚠️ **Note :** Le rôle est dupliqué dans `users` et `profiles`. Source de vérité : **`profiles.role`** côté app, **`users.role`** côté migrations/seed.

---

### `public.profiles`
> Données d'identité visibles de l'utilisateur.

```sql
CREATE TABLE public.profiles (
    user_id    uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    nom        text DEFAULT 'Utilisateur' NOT NULL,
    prenom     text DEFAULT '' NOT NULL,
    role       user_role DEFAULT 'membre' NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
```

| Colonne | Type | Description |
|---|---|---|
| `user_id` | uuid | PK + FK vers `public.users.id` |
| `nom` | text | Nom de famille |
| `prenom` | text | Prénom |
| `role` | user_role | Rôle dans le club |
| `avatar_url` | text (nullable) | URL photo de profil |

> **Trigger :** `handle_new_user` peuple automatiquement cette table à l'inscription. Il extrait le prénom (1er mot) et le nom (reste) depuis `raw_user_meta_data->>'full_name'`.

---

### `public.member_profiles`
> Informations spécifiques aux membres actifs du club.

```sql
CREATE TABLE public.member_profiles (
    user_id          uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    telephone        text,
    niveau_tennis    text,
    statut_adhesion  text DEFAULT 'actif' NOT NULL,
    type_abonnement  text DEFAULT 'mensuel' NOT NULL,
    created_at       timestamptz DEFAULT now() NOT NULL
);
```

| Colonne | Type | Valeurs | Description |
|---|---|---|---|
| `user_id` | uuid | PK + FK | Lié à `profiles` |
| `telephone` | text (nullable) | — | Numéro de téléphone |
| `niveau_tennis` | text (nullable) | Débutant · Intermédiaire · Avancé · Expert | Niveau de jeu |
| `statut_adhesion` | text | `actif` · `en_attente` · `suspendu` | Statut de l'adhésion |
| `type_abonnement` | text | `mensuel` · `annuel` · `journalier` | Type d'abonnement |

> ⚠️ **Amélioration recommandée :** Convertir `statut_adhesion` et `type_abonnement` en types ENUM PostgreSQL pour garantir l'intégrité.

---

### `public.courts`
> Inventaire des terrains de tennis.

```sql
CREATE TABLE public.courts (
    id         integer PRIMARY KEY,
    nom        text NOT NULL,
    type       text DEFAULT 'Terre Battue' NOT NULL,
    disponible boolean DEFAULT true NOT NULL,
    eclairage  boolean DEFAULT true NOT NULL,
    status     text DEFAULT 'disponible' NOT NULL
);
```

| Colonne | Type | Valeurs | Description |
|---|---|---|---|
| `id` | integer | PK manuel | Identifiant du court |
| `nom` | text | — | Nom du court (ex: "Court Chatrier") |
| `type` | text | `Terre Battue` · `Gazon` · `Dur` · `Synthétique` | Type de surface |
| `disponible` | boolean | true/false | Disponibilité physique |
| `eclairage` | boolean | true/false | Présence d'éclairage nocturne |
| `status` | text | `disponible` · `occupé` · `maintenance` | État opérationnel actuel |

> ⚠️ **Redondance :** `disponible` (boolean) et `status` (text) encodent une information similaire. Recommandé : conserver uniquement `status` avec un ENUM.

---

### `public.reservations`
> Réservations de courts par les membres.

```sql
CREATE TABLE public.reservations (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id  integer REFERENCES public.courts(id) ON DELETE CASCADE,
    user_id   uuid REFERENCES public.users(id) ON DELETE CASCADE,
    start_time timestamptz NOT NULL,
    end_time   timestamptz NOT NULL,
    status    text DEFAULT 'confirmée' NOT NULL,
    notes     text
);
```

| Colonne | Type | Valeurs | Description |
|---|---|---|---|
| `id` | uuid | AUTO | Identifiant unique |
| `court_id` | integer | FK courts | Court réservé |
| `user_id` | uuid | FK users | Membre ayant réservé |
| `start_time` | timestamptz | — | Début de réservation |
| `end_time` | timestamptz | — | Fin de réservation |
| `status` | text | `confirmée` · `en_attente` · `annulée` · `terminée` | Statut |
| `notes` | text (nullable) | — | Commentaires libres |

> ⚠️ **Contrainte manquante :** Pas de vérification que `start_time < end_time`. À ajouter : `CHECK (end_time > start_time)`.

---

## 🔄 Trigger `handle_new_user`

**Déclencheur :** `AFTER INSERT ON auth.users`  
**Objectif :** Synchroniser les tables publiques à chaque nouvel utilisateur.

```sql
-- Logique du trigger (résumé)
1. Lire le rôle depuis raw_user_meta_data->>'role'
2. Insérer dans public.users (id, email, role)
3. Insérer dans public.profiles :
   - prenom = premier mot de full_name
   - nom    = reste de full_name (après le 1er espace)
4. Si rôle = 'membre' → insérer dans public.member_profiles
```

---

## 📊 Vue `court_status_summary`

Vue utilitaire pour le dashboard, affichant l'état de chaque court avec le nombre de réservations actives :

```sql
SELECT c.id, c.nom, c.type, c.status, COUNT(réservations futures) FROM courts;
```

---

## 🚀 Améliorations Recommandées

### Court terme (avant production)
```sql
-- 1. Contrainte de cohérence temporelle
ALTER TABLE public.reservations 
ADD CONSTRAINT check_reservation_times 
CHECK (end_time > start_time);

-- 2. Enum pour statut_adhesion
CREATE TYPE statut_adhesion_type AS ENUM ('actif', 'en_attente', 'suspendu', 'archive');
ALTER TABLE public.member_profiles 
ALTER COLUMN statut_adhesion TYPE statut_adhesion_type USING statut_adhesion::statut_adhesion_type;

-- 3. Index pour les performances
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_court_id ON public.reservations(court_id);
CREATE INDEX idx_reservations_start_time ON public.reservations(start_time);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- 4. Trigger de mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Moyen terme
```sql
-- 5. Table pour les paiements (future feature)
CREATE TABLE public.paiements (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid REFERENCES public.users(id) ON DELETE CASCADE,
    montant      numeric(10,2) NOT NULL,
    type         text NOT NULL,  -- 'adhesion', 'reservation', 'cours'
    statut       text DEFAULT 'en_attente' NOT NULL,
    reference    text,
    created_at   timestamptz DEFAULT now() NOT NULL
);

-- 6. Table pour les cours collectifs / moniteurs
CREATE TABLE public.cours (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moniteur_id  uuid REFERENCES public.users(id),
    court_id     integer REFERENCES public.courts(id),
    titre        text NOT NULL,
    niveau       text,
    max_participants integer DEFAULT 6,
    start_time   timestamptz NOT NULL,
    end_time     timestamptz NOT NULL,
    created_at   timestamptz DEFAULT now() NOT NULL
);
```

---

## 🔧 Commandes Utiles

```bash
# Démarrer Supabase en local
npx supabase start

# Appliquer les migrations
npx supabase db reset

# Voir le statut
npx supabase status

# Ouvrir le Studio local
# → http://localhost:54323

# Générer les types TypeScript depuis le schéma
npx supabase gen types typescript --local > src/lib/types/supabase.ts
```

> 💡 **Recommandation :** Exécuter `supabase gen types` après chaque migration pour synchroniser les types TypeScript avec le schéma SQL.
