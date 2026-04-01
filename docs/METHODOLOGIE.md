# 🚀 MÉTHODOLOGIE DE DÉVELOPPEMENT - Tennis Club du François

**Date de création :** 2026-04-01  
**Dernière mise à jour :** 2026-04-01  
**Version :** 1.0  
**Statut :** ✅ Validée et opérationnelle

---

## 📋 TABLE DES MATIÈRES

1. [État Actuel du Projet](#état-actuel-du-projet)
2. [Méthodologie par Écran (7 étapes)](#méthodologie-par-écran-7-étapes)
3. [Prochaine Étape : Dashboard Membre](#prochaine-étape-dashboard-membre)
4. [Roadmap Complète](#roadmap-complète)
5. [Structure de Fichiers](#structure-de-fichiers)
6. [Commandes Utiles](#commandes-utiles)
7. [Dépannage](#dépannage)

---

## 🎯 ÉTAT ACTUEL DU PROJET

### ✅ **Terminé (100%)**

| Module | Statut | Détails |
|--------|--------|---------|
| **Authentification** | ✅ 100% | Login, Register, Redirection par rôle |
| **Base de données** | ✅ 100% | Tables `users`, `profiles` créées |
| **Middleware** | ✅ 100% | Protection des routes par rôle |
| **Scripts SQL** | ✅ 100% | Réparation Auth fonctionnelle |

**Fichiers clés :**
```
tennis-club-francois/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx          ✅ Login fonctionnel
│   │   └── dashboard/
│   │       ├── layout.tsx              ✅ Layout partagé (sidebar)
│   │       ├── admin/page.tsx          ✅ Page créée (vide)
│   │       ├── membre/page.tsx         ✅ Page créée (vide)
│   │       └── moniteur/page.tsx       ✅ Page créée (vide)
│   ├── components/
│   │   └── auth/
│   │       └── LoginForm.tsx           ✅ Avec auto-fill + redirection
│   └── lib/
│       ├── supabase/server.ts          ✅ Client Supabase
│       └── validators/auth.ts          ✅ Validation Zod
└── scripts/
    ├── repair-auth-complete.sql        ✅ Script de réparation Auth
    └── fix-auth-email-change.sql       ✅ Fix NULL columns
```

**Identifiants de test :**
| Rôle | Email | Mot de passe | Redirection |
|------|-------|--------------|-------------|
| Admin | `admin@tennis-club.fr` | `Admin123!` | `/dashboard/admin` |
| Membre | `membre@tennis-club.fr` | `Membre123!` | `/dashboard/membre` |
| Moniteur | `moniteur@tennis-club.fr` | `Moniteur123!` | `/dashboard/moniteur` |

---

### ⬜ **À Faire (0%)**

| Module | Priorité | Tables Requises | Design Stitch |
|--------|----------|-----------------|---------------|
| **Dashboard Membre** | P0 | `courts`, `reservations` | `dashboard_membre_vision_des_courts_directe` |
| **Dashboard Admin** | P0 | `courts`, `reservations`, `member_profiles` | `dashboard_admin_sans_finances` |
| **Dashboard Moniteur** | P0 | `cours`, `student_profiles` | `dashboard_moniteur_topbar_pur_e` |
| **Gestion Membres** | P1 | `member_profiles` | `gestion_des_membres_admin` |
| **Planning Admin** | P1 | `courts`, `reservations` | `planning_des_courts_admin` |
| **Planning Membre** | P1 | `courts`, `reservations` | `planning_des_courts_membre_menu_corrig` |
| **Mes Réservations** | P1 | `reservations` | `mes_r_servations_membre_menu_corrig` |
| **Gestion Élèves** | P1 | `student_profiles` | `gestion_des_l_ves_topbar_pur_e` |
| **Planning Moniteur** | P1 | `cours` | `planning_moniteur_sans_prochain_cours` |
| **Paramètres Admin** | P2 | `club_settings` | `param_tres_du_club_admin_contraste_optimis` |
| **Paramètres Membre** | P2 | - | `param_tres_membre_menu_corrig` |
| **Paramètres Moniteur** | P2 | - | `param_tres_moniteur_version_pur_e_simplifi_e` |

---

## 🔧 MÉTHODOLOGIE PAR ÉCRAN (7 ÉTAPES)

### **Vue d'Ensemble**

```
┌─────────────────────────────────────────────────────────────┐
│  1. Analyse du Design Stitch                                │
│  2. Vérification Schéma SQL (tables nécessaires)            │
│  3. Création/Mise à jour des Tables SQL                     │
│  4. Server Actions (récupération données)                   │
│  5. Intégration UI (composants Stitch)                      │
│  6. Wiring (connexion UI → Server Actions)                  │
│  7. Tests & Validation                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### **Étape 1 : Analyse du Design Stitch** 🎨

**Objectif :** Comprendre ce qu'on doit construire

**Actions :**
1. Ouvrir le dossier Stitch de l'écran
2. Identifier tous les composants UI
3. Lister les données affichées

**Exemple pour Dashboard Membre :**
```bash
# Dossier Stitch
stitch_connexion_membres_admin/dashboard_membre_vision_des_courts_directe/
├── screen.png          # Aperçu visuel
└── code.html           # HTML/CSS à convertir

# Composants identifiés :
- Header avec nom utilisateur + avatar
- Stats cards (réservations à venir, courts dispo)
- Liste des courts disponibles (nom, type, bouton réserver)
- Boutons d'action rapide (réserver, voir planning)
```

**Questions à se poser :**
- [ ] Quelles données sont affichées ?
- [ ] Quels sont les éléments interactifs (boutons, formulaires) ?
- [ ] Y a-t-il des états (loading, error, success) ?
- [ ] Le design est-il responsive ?

**Livrable :** Liste des composants et données nécessaires

---

### **Étape 2 : Vérification Schéma SQL** 🗄️

**Objectif :** Identifier les tables à créer

**Actions :**
1. Lister les tables nécessaires pour l'écran
2. Vérifier lesquelles existent déjà
3. Identifier les colonnes manquantes

**Exemple pour Dashboard Membre :**
```sql
-- Tables nécessaires :
✅ profiles (existe) - pour nom, prenom, role, avatar_url
✅ users (existe) - pour email
❌ courts (manque) - pour afficher les courts
❌ reservations (manque) - pour afficher les réservations
```

**Vérification rapide :**
```sql
-- Vérifier si une table existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'courts'
);
```

**Livrable :** Liste des tables à créer

---

### **Étape 3 : Création/Mise à jour des Tables SQL** 🔨

**Objectif :** Créer les tables manquantes avec RLS

**Actions :**
1. Créer un script SQL dans `/scripts/`
2. Définir les tables, index, triggers
3. Configurer RLS (Row Level Security)
4. Exécuter dans Supabase SQL Editor

**Template de script SQL :**
```sql
-- =====================================================
-- SCRIPT: Création tables Dashboard Membre
-- DATE: 2026-04-01
-- DESCRIPTION: Crée courts et reservations
-- =====================================================

-- 1. Table: courts
CREATE TABLE IF NOT EXISTS public.courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type text NOT NULL DEFAULT 'Terre battue',
  disponible boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_courts_disponible ON public.courts(disponible);

-- Trigger: set_updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.courts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 2. Table: reservations
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'confirmée',
  created_at timestamptz DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_court_id ON public.reservations(court_id);
CREATE INDEX IF NOT EXISTS idx_reservations_start_time ON public.reservations(start_time);

-- Trigger: set_updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.reservations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. RLS (Row Level Security)
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Courts: tout le monde peut lire
DROP POLICY IF EXISTS "courts_public_read" ON public.courts;
CREATE POLICY "courts_public_read" ON public.courts
  FOR SELECT TO authenticated USING (true);

-- Réservations: owner read
DROP POLICY IF EXISTS "reservations_owner_read" ON public.reservations;
CREATE POLICY "reservations_owner_read" ON public.reservations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Réservations: owner create
DROP POLICY IF EXISTS "reservations_owner_create" ON public.reservations;
CREATE POLICY "reservations_owner_create" ON public.reservations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Réservations: owner delete
DROP POLICY IF EXISTS "reservations_owner_delete" ON public.reservations;
CREATE POLICY "reservations_owner_delete" ON public.reservations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Données de test
INSERT INTO public.courts (nom, type, disponible) VALUES
  ('Court 1', 'Terre battue', true),
  ('Court 2', 'Terre battue', true),
  ('Court 3', 'Dur', true),
  ('Court 4', 'Dur', true),
  ('Court 5', 'Synthétique', true),
  ('Court 6', 'Synthétique', true)
ON CONFLICT DO NOTHING;
```

**Exécution :**
1. Ouvrir Supabase Studio : http://localhost:54323
2. Aller dans SQL Editor
3. Copier-coller le script
4. Cliquer sur "Run"

**Livrable :** Tables SQL créées + RLS configuré

---

### **Étape 4 : Server Actions** ⚡

**Objectif :** Récupérer et modifier les données

**Actions :**
1. Créer/modifier le fichier d'actions dans `src/app/(dashboard)/actions.ts`
2. Implémenter la logique de récupération des données
3. Gérer les erreurs et la validation Zod

**Template de Server Action :**
```typescript
// src/app/(dashboard)/actions.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Récupère les données du Dashboard Membre
 */
export async function getMemberDashboardData() {
  const supabase = await createClient();
  
  // Récupérer l'utilisateur connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Non authentifié');
  }
  
  // Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('nom, prenom, role, avatar_url')
    .eq('user_id', session.user.id)
    .single();
  
  // Récupérer les courts disponibles
  const { data: courts } = await supabase
    .from('courts')
    .select('id, nom, type, disponible')
    .eq('disponible', true);
  
  // Récupérer les prochaines réservations
  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      id,
      start_time,
      end_time,
      status,
      court:courts (nom, type)
    `)
    .eq('user_id', session.user.id)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5);
  
  return {
    user: {
      nom: profile?.nom ?? 'Utilisateur',
      prenom: profile?.prenom ?? '',
      email: session.user.email ?? '',
      avatar_url: profile?.avatar_url,
    },
    stats: {
      reservationsAVenir: reservations?.length ?? 0,
      courtsDisponibles: courts?.length ?? 0,
    },
    courts: courts ?? [],
    reservations: reservations ?? [],
  };
}

/**
 * Crée une réservation pour un court
 */
export async function createReservationAction(formData: FormData) {
  const supabase = await createClient();
  
  // Récupérer l'utilisateur
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'Non authentifié' };
  }
  
  // Récupérer les données du formulaire
  const courtId = formData.get('court_id') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  
  // Validation basique
  if (!courtId || !startTime || !endTime) {
    return { success: false, error: 'Données incomplètes' };
  }
  
  // Créer la réservation
  const { error } = await supabase
    .from('reservations')
    .insert({
      court_id: courtId,
      user_id: session.user.id,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      status: 'confirmée',
    });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // Revalidate pour mettre à jour l'UI
  revalidatePath('/dashboard/membre');
  
  return { success: true };
}
```

**Livrable :** Server Actions fonctionnelles

---

### **Étape 5 : Intégration UI (Composants Stitch)** 🎨

**Objectif :** Convertir le design Stitch en composants React

**Actions :**
1. Analyser le code HTML/CSS Stitch
2. Convertir en composants React avec Tailwind CSS
3. Créer des composants réutilisables

**Structure des composants :**
```
src/components/dashboard/member/
├── MemberDashboard.tsx       # Composant principal
├── StatsCard.tsx             # Carte de stats (réutilisable)
├── CourtCard.tsx             # Carte d'un court
├── CourtList.tsx             # Liste des courts
└── ReservationForm.tsx       # Formulaire de réservation
```

**Template de composant :**
```tsx
// src/components/dashboard/member/MemberDashboard.tsx

import { getMemberDashboardData } from '@/app/(dashboard)/actions';
import { StatsCard } from './StatsCard';
import { CourtList } from './CourtList';

export default async function MemberDashboard() {
  const data = await getMemberDashboardData();
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {data.user.avatar_url ? (
            <img
              src={data.user.avatar_url}
              alt={data.user.prenom}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-2xl">
                person
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">
              Bonjour, {data.user.prenom} {data.user.nom}
            </h1>
            <p className="text-white/60">
              Voici vos courts disponibles
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Réservations à venir"
          value={data.stats.reservationsAVenir}
          icon="calendar_month"
          color="blue"
        />
        <StatsCard
          title="Courts disponibles"
          value={data.stats.courtsDisponibles}
          icon="sports_tennis"
          color="green"
        />
        <StatsCard
          title="Dernière réservation"
          value="Hier"
          icon="history"
          color="purple"
        />
      </div>
      
      {/* Courts List */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Courts Disponibles
        </h2>
        <CourtList courts={data.courts} />
      </div>
    </div>
  );
}
```

**Composant réutilisable :**
```tsx
// src/components/dashboard/member/StatsCard.tsx

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className={`glass-card rounded-xl p-6 border ${colorMap[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-white/60 text-sm font-medium">{title}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
```

**Livrable :** Composants React avec design Stitch

---

### **Étape 6 : Wiring (Connexion UI → Server Actions)** 🔌

**Objectif :** Rendre l'UI interactive

**Actions :**
1. Connecter les formulaires aux Server Actions
2. Gérer les états (loading, error, success)
3. Ajouter les interactions (clic, submit)

**Template de composant interactif :**
```tsx
// src/components/dashboard/member/CourtCard.tsx

'use client';

import { useActionState } from 'react';
import { createReservationAction } from '@/app/(dashboard)/actions';

interface CourtCardProps {
  court: {
    id: string;
    nom: string;
    type: string;
    disponible: boolean;
  };
}

export function CourtCard({ court }: CourtCardProps) {
  const [state, formAction, isPending] = useActionState(
    createReservationAction,
    { success: false, error: '' }
  );
  
  return (
    <form action={formAction}>
      <input type="hidden" name="court_id" value={court.id} />
      
      <div className="glass-card p-6 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{court.nom}</h3>
            <p className="text-white/60 text-sm">{court.type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            court.disponible
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {court.disponible ? 'Disponible' : 'Indisponible'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="datetime-local"
            name="start_time"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            required
          />
          <input
            type="datetime-local"
            name="end_time"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            required
          />
          <button
            type="submit"
            disabled={isPending || !court.disponible}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              isPending || !court.disponible
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-secondary hover:bg-secondary-fixed text-white'
            }`}
          >
            {isPending ? 'Réservation...' : 'Réserver'}
          </button>
        </div>
        
        {state.error && (
          <p className="text-error mt-2 text-sm">{state.error}</p>
        )}
        {state.success && (
          <p className="text-green-400 mt-2 text-sm">
            Réservation créée avec succès !
          </p>
        )}
      </div>
    </form>
  );
}
```

**Livrable :** UI interactive connectée aux données

---

### **Étape 7 : Tests & Validation** ✅

**Objectif :** Vérifier que tout fonctionne

**Checklist de validation :**
```
[ ] Build réussi : npm run build (0 erreur)
[ ] TypeScript : tsc --noEmit (0 erreur)
[ ] Lint : npm run lint (0 warning)
[ ] Design Stitch préservé (comparaison avec screen.png)
[ ] Responsive (mobile, tablet, desktop)
[ ] Données affichées correctement
[ ] Actions fonctionnelles (submit, navigation)
[ ] États UI gérés (loading, error, success)
[ ] Accessibilité de base (labels ARIA)
[ ] RLS configuré et testé
```

**Commandes de test :**
```bash
# Build
cd tennis-club-francois
npm run build

# TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Test manuel
# 1. Ouvrir http://localhost:3000/login
# 2. Se connecter avec membre@tennis-club.fr / Membre123!
# 3. Vérifier la redirection vers /dashboard/membre
# 4. Vérifier l'affichage des données
# 5. Tester la réservation d'un court
```

**Livrable :** Écran validé et prêt pour la production

---

## 🎯 PROCHAINE ÉTAPE : DASHBOARD MEMBRE

### **Statut Actuel**

| Étape | Statut | Fichiers |
|-------|--------|----------|
| 1. Analyse Design Stitch | ⬜ | - |
| 2. Vérification SQL | ⬜ | - |
| 3. Création Tables SQL | ⬜ | `scripts/create-tables-member.sql` |
| 4. Server Actions | ⬜ | `src/app/(dashboard)/actions.ts` |
| 5. Intégration UI | ⬜ | `src/components/dashboard/member/*` |
| 6. Wiring | ⬜ | - |
| 7. Tests | ⬜ | - |

### **Design Stitch à Intégrer**

```
stitch_connexion_membres_admin/
└── dashboard_membre_vision_des_courts_directe/
    ├── screen.png          # Aperçu visuel
    └── code.html           # HTML/CSS à convertir
```

### **Tables SQL à Créer**

```sql
-- courts
-- reservations
```

### **Server Actions à Créer**

```typescript
- getMemberDashboardData()
- createReservationAction()
- cancelReservationAction()
```

### **Composants à Créer**

```
src/components/dashboard/member/
├── MemberDashboard.tsx
├── StatsCard.tsx
├── CourtCard.tsx
├── CourtList.tsx
└── ReservationForm.tsx
```

---

## 📊 ROADMAP COMPLÈTE

### **Semaine 1 : Dashboard Membre (P0)**

| Jour | Tâche | Livrable |
|------|-------|----------|
| J1 | Tables SQL (`courts`, `reservations`) | Script SQL exécuté |
| J2 | Server Actions | `getMemberDashboardData()`, `createReservationAction()` |
| J3-J4 | Intégration UI | Composants React (5 fichiers) |
| J5 | Wiring + Tests | Écran fonctionnel |

### **Semaine 2 : Dashboard Admin (P0)**

| Jour | Tâche | Livrable |
|------|-------|----------|
| J1 | Tables SQL (`member_profiles`, `club_settings`) | Script SQL exécuté |
| J2-J3 | Server Actions | `getAdminDashboardData()`, `createMemberAction()` |
| J4-J5 | Intégration UI | Composants React |

### **Semaine 3 : Dashboard Moniteur (P0)**

| Jour | Tâche | Livrable |
|------|-------|----------|
| J1 | Tables SQL (`cours`, `student_profiles`) | Script SQL exécuté |
| J2 | Server Actions | `getCoachDashboardData()`, `createCoursAction()` |
| J3-J4 | Intégration UI | Composants React |
| J5 | Wiring + Tests | Écran fonctionnel |

### **Semaine 4 : Features Avancées (P1)**

| Écran | Tables Requises | Temps Estimé |
|-------|-----------------|--------------|
| Gestion des Membres | `member_profiles` | 2 jours |
| Planning Admin | `courts`, `reservations` | 2 jours |
| Planning Membre | `courts`, `reservations` | 2 jours |
| Mes Réservations | `reservations` | 1 jour |
| Gestion des Élèves | `student_profiles` | 2 jours |
| Planning Moniteur | `cours` | 2 jours |

---

## 📁 STRUCTURE DE FICHIERS

### **Structure Actuelle**

```
tennis-club-francois/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx              # Login page
│   │   │   └── register/
│   │   │       └── page.tsx              # Register page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # Layout partagé (sidebar)
│   │   │   ├── admin/
│   │   │   │   └── page.tsx              # Dashboard Admin (vide)
│   │   │   ├── membre/
│   │   │   │   └── page.tsx              # Dashboard Membre (vide)
│   │   │   └── moniteur/
│   │   │       └── page.tsx              # Dashboard Moniteur (vide)
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # Landing Page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx             # Formulaire de connexion
│   │   │   └── RegisterForm.tsx          # Formulaire d'inscription
│   │   ├── dashboard/
│   │   │   └── member/                   # Composants Dashboard Membre
│   │   │       ├── MemberDashboard.tsx
│   │   │       ├── StatsCard.tsx
│   │   │       ├── CourtCard.tsx
│   │   │       └── CourtList.tsx
│   │   └── landing/                      # Composants Landing Page
│   │       ├── HeroSection.tsx
│   │       └── FeaturesSection.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Client Supabase (browser)
│   │   │   └── server.ts                 # Client Supabase (server)
│   │   ├── types/
│   │   │   └── actions.ts                # Types Server Actions
│   │   └── validators/
│   │       └── auth.ts                   # Validators Zod
│   └── db/
│       └── schema.ts                     # Schéma Drizzle
├── scripts/
│   ├── repair-auth-complete.sql          # Réparation Auth
│   ├── fix-auth-email-change.sql         # Fix NULL columns
│   └── create-tables-member.sql          # Tables Dashboard Membre (à créer)
├── docs/
│   ├── PROJECT_TRACKER.md                # Suivi des écrans
│   ├── PROJECT_ROADMAP.md                # Roadmap détaillée
│   ├── METHODOLOGIE.md                   # Ce fichier
│   └── AUDIT_SYNTHÈSE.md                 # Audit database
└── supabase/
    └── config.toml                       # Configuration Supabase Local
```

---

## 🛠️ COMMANDES UTILES

### **Développement**

```bash
# Démarrer Next.js
cd tennis-club-francois
npm run dev

# Build de production
npm run build

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint
```

### **Supabase Local**

```bash
# Démarrer Supabase
cd /Users/mathieu/StudioProjects/tennis_web
npx supabase start

# Arrêter Supabase
npx supabase stop

# Vérifier le statut
npx supabase status

# Reset complet (ATTENTION: efface les données)
npx supabase stop --no-backup && npx supabase start
```

### **SQL Scripts**

```bash
# Exécuter un script SQL dans Supabase
# 1. Ouvrir http://localhost:54323
# 2. Aller dans SQL Editor
# 3. Copier-coller le contenu du fichier .sql
# 4. Cliquer sur "Run"
```

### **Git**

```bash
# Voir le statut
git status

# Ajouter des fichiers
git add .

# Commit
git commit -m "feat: description"

# Push (si remote configuré)
git push
```

---

## 🐛 DÉPANNAGE

### **Problème : "Database error querying schema"**

**Solution :**
```bash
# 1. Exécuter le script de réparation
# Dans Supabase SQL Editor :
\i scripts/repair-auth-complete.sql

# 2. Redémarrer Supabase
npx supabase stop && npx supabase start

# 3. Tester la connexion
```

### **Problème : 404 sur /dashboard/admin**

**Cause :** La page n'existe pas au bon format

**Solution :**
```bash
# Vérifier la structure des dossiers
# Doit être : src/app/dashboard/admin/page.tsx
# Pas : src/app/dashboard/admin.tsx

# Si incorrect, déplacer :
mkdir -p src/app/dashboard/admin
mv src/app/dashboard/admin.tsx src/app/dashboard/admin/page.tsx
```

### **Problème : NEXT_REDIRECT dans la console**

**Cause :** `redirect()` dans une Server Action avec `useActionState`

**Solution :**
```typescript
// Au lieu de redirect() dans l'action, retourner les données
// Et gérer la redirection côté client avec useEffect

// Dans le composant :
useEffect(() => {
  if (state.success && state.data?.user) {
    const role = state.data.user.role ?? 'membre';
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else if (role === 'moniteur') {
      router.push('/dashboard/moniteur');
    } else {
      router.push('/dashboard/membre');
    }
  }
}, [state, router]);
```

### **Problème : RLS bloque les requêtes**

**Solution :**
```sql
-- Vérifier si RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'profiles', 'courts', 'reservations');

-- Si RLS activé et bloque, vérifier les policies
SELECT policyname, tablename, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Pour débugger, désactiver temporairement RLS
ALTER TABLE public.courts DISABLE ROW LEVEL SECURITY;

-- Puis réactiver avec les bonnes policies
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courts_public_read" ON public.courts
  FOR SELECT TO authenticated USING (true);
```

---

## 📞 RESSOURCES

### **Documentation**

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)

### **Fichiers de Référence**

- `scripts/repair-auth-complete.sql` - Réparation Auth
- `src/app/(auth)/actions.ts` - Server Actions Auth
- `src/components/auth/LoginForm.tsx` - Exemple de formulaire
- `docs/PROJECT_TRACKER.md` - Suivi des écrans
- `docs/PROJECT_ROADMAP.md` - Roadmap détaillée

---

## ✅ CHECKLIST DE REPRISE

Si tu reprends le projet après une interruption :

```
[ ] 1. Lire ce fichier (METHODOLOGIE.md)
[ ] 2. Vérifier l'état actuel : npm run dev
[ ] 3. Tester la connexion : http://localhost:3000/login
[ ] 4. Vérifier Supabase : npx supabase status
[ ] 5. Consulter docs/PROJECT_TRACKER.md pour l'écran en cours
[ ] 6. Suivre la méthodologie (7 étapes) pour l'écran suivant
```

---

**Document généré automatiquement.**  
**Prochaine mise à jour :** Après complétion du Dashboard Membre.
