# 🔧 GUIDE DE CORRECTION DES VALIDATORS ZOD

## Problème identifié

Les validators Zod dans `tennis-club-francois/src/lib/validators/*.ts` utilisent des valeurs **DIFFÉRENTES** des ENUMs SQL définis dans Drizzle.

---

## 📋 Corrections requises

### 1. `auth.ts` - Rôle utilisateur

**Fichier :** `tennis-club-francois/src/lib/validators/auth.ts`

**Actuel (ligne ~47) :**
```typescript
role: z.enum(['admin', 'moniteur', 'membre']).optional().default('membre'),
```

**Correction :**
```typescript
role: z.enum(['admin', 'moniteur', 'eleve', 'guest']).optional().default('eleve'),
```

**Pourquoi :** Le SQL utilise `'eleve'` et `'guest'`, pas `'membre'`.

---

### 2. `members.ts` - Multiple ENUMs incohérents

**Fichier :** `tennis-club-francois/src/lib/validators/members.ts`

#### 2.1 `statutAdhesionSchema`

**Actuel (ligne ~12) :**
```typescript
export const statutAdhesionSchema = z.enum(['actif', 'inactif', 'en_attente', 'suspendu']);
```

**Correction :**
```typescript
export const statutAdhesionSchema = z.enum(['actif', 'inactif', 'en_attente']);
```

**Pourquoi :** `'suspendu'` n'existe pas dans l'ENUM SQL.

---

#### 2.2 `typeAbonnementSchema`

**Actuel (ligne ~17) :**
```typescript
export const typeAbonnementSchema = z.enum(['mensuel', 'annuel', 'premium', 'vip', 'occasionnel']);
```

**Correction :**
```typescript
export const typeAbonnementSchema = z.enum(['standard', 'premium', 'vip']);
```

**Pourquoi :** Les valeurs SQL sont `standard`, `premium`, `vip` (pas `mensuel`, `annuel`, `occasionnel`).

---

#### 2.3 `niveauTennisSchema`

**Actuel (ligne ~22) :**
```typescript
export const niveauTennisSchema = z.enum(['débutant', 'intermédiaire', 'avancé', 'expert', 'competition']);
```

**Correction :**
```typescript
export const niveauTennisSchema = z.enum(['debutant', 'intermediaire', 'avance', 'pro']);
```

**Pourquoi :** 
- SQL n'utilise **PAS d'accents** (`debutant` pas `débutant`)
- SQL utilise `pro` au lieu de `expert` et `competition`

---

#### 2.4 `createMemberSchema` et `updateMemberSchema`

**Actuel (ligne ~35 et ~67) :**
```typescript
role: z.enum(['admin', 'moniteur', 'membre']).default('membre'),
```

**Correction :**
```typescript
role: z.enum(['admin', 'moniteur', 'eleve', 'guest']).default('eleve'),
```

---

### 3. `reservations.ts` - Statuts avec accents

**Fichier :** `tennis-club-francois/src/lib/validators/reservations.ts`

#### 3.1 `reservationStatusSchema`

**Actuel (ligne ~10) :**
```typescript
export const reservationStatusSchema = z.enum(['confirmée', 'en_attente', 'annulée']);
```

**Correction :**
```typescript
export const reservationStatusSchema = z.enum(['confirmee', 'en_attente', 'annulee']);
```

**Pourquoi :** SQL n'utilise **PAS d'accents** (`confirmee` pas `confirmée`).

---

### 4. `cours.ts` - Multiple ENUMs incohérents

**Fichier :** `tennis-club-francois/src/lib/validators/cours.ts`

#### 4.1 `typeCoursSchema`

**Actuel (ligne ~10) :**
```typescript
export const typeCoursSchema = z.enum(['individuel', 'groupe', 'clinique', 'stage', 'competition']);
```

**Correction :**
```typescript
export const typeCoursSchema = z.enum(['particulier', 'groupe', 'stage', 'perfectionnement']);
```

**Pourquoi :** 
- SQL utilise `particulier` pas `individuel`
- SQL n'a PAS `clinique` ni `competition`
- SQL a `perfectionnement`

---

#### 4.2 `niveauRequisSchema`

**Actuel (ligne ~15) :**
```typescript
export const niveauRequisSchema = z.enum(['tous', 'débutant', 'intermédiaire', 'avancé', 'expert']);
```

**Correction :**
```typescript
export const niveauRequisSchema = z.enum(['tous', 'debutant', 'intermediaire', 'avance']);
```

**Pourquoi :** 
- PAS d'accents dans SQL
- `expert` n'existe pas dans l'ENUM SQL

---

#### 4.3 `coursStatusSchema`

**Actuel (ligne ~20) :**
```typescript
export const coursStatusSchema = z.enum(['prévu', 'en_cours', 'terminé', 'annulé']);
```

**⚠️ ATTENTION :** Cet ENUM **N'EXISTE PAS** dans le schéma SQL !

**Option A - Supprimer (recommandé) :**
```typescript
// Supprimer ce schema car il n'a pas d'ENUM SQL correspondant
// Utiliser directement le statut de réservation si besoin
```

**Option B - Ajouter l'ENUM dans SQL :**
```sql
CREATE TYPE statut_cours AS ENUM ('prevu', 'en_cours', 'termine', 'annule');
ALTER TABLE cours ADD COLUMN statut statut_cours DEFAULT 'prevu';
```

---

### 5. `admin-reservations.ts` - Type de réservation

**Fichier :** `tennis-club-francois/src/lib/validators/admin-reservations.ts`

#### 5.1 `reservationTypeSchema`

**Actuel (ligne ~13) :**
```typescript
export const reservationTypeSchema = z.enum(['membre', 'entrainement', 'tournoi', 'libre', 'maintenance']);
```

**Correction :**
```typescript
export const reservationTypeSchema = z.enum(['membre', 'entrainement', 'tournoi', 'libre']);
```

**Pourquoi :** `maintenance` n'existe pas dans l'ENUM SQL `type_reservation`.

**Option alternative - Ajouter dans SQL :**
```sql
ALTER TYPE type_reservation ADD VALUE IF NOT EXISTS 'maintenance';
```

---

### 6. `settings.ts` - Niveau de tennis et notifications

**Fichier :** `tennis-club-francois/src/lib/validators/settings.ts`

#### 6.1 `profileSettingsSchema` - niveau

**Actuel (ligne ~89) :**
```typescript
niveau: z
  .enum(['débutant', 'intermédiaire', 'avancé', 'expert', 'competition'])
  .optional(),
```

**Correction :**
```typescript
niveau: z
  .enum(['debutant', 'intermediaire', 'avance', 'pro'])
  .optional(),
```

---

#### 6.2 `notificationPreferencesSchema`

**⚠️ ATTENTION :** Ce schema Zod n'a pas de table SQL correspondante directe.

La table `notifications` a une structure différente :
- `type_notification` (pas des booléens)
- `canal` (email, push, sms)
- `active` (booléen unique)

**Recommandation :** Adapter le schema ou la structure de la table.

---

## 📝 Résumé des corrections

| Fichier | Schema | Valeurs actuelles (❌) | Valeurs correctes (✅) |
|---------|--------|------------------------|------------------------|
| `auth.ts` | `role` | `membre` | `eleve` |
| `members.ts` | `statutAdhesion` | `suspendu` | (supprimer) |
| `members.ts` | `typeAbonnement` | `mensuel, annuel, occasionnel` | `standard, premium, vip` |
| `members.ts` | `niveauTennis` | `débutant, intermédiaire...` | `debutant, intermediaire...` |
| `reservations.ts` | `statut_reservation` | `confirmée, annulée` | `confirmee, annulee` |
| `cours.ts` | `type_cours` | `individuel, clinique...` | `particulier, perfectionnement` |
| `cours.ts` | `niveau_requis` | `débutant, expert` | `debutant, avance` |
| `cours.ts` | `coursStatus` | (n'existe pas en SQL) | (supprimer ou ajouter ENUM) |
| `admin-reservations.ts` | `type_reservation` | `maintenance` | (supprimer ou ajouter) |
| `settings.ts` | `niveau` | `débutant, expert` | `debutant, avance, pro` |

---

## 🛠️ Comment appliquer les corrections

### Option 1 : Correction manuelle (recommandé)

1. Ouvrir chaque fichier listé ci-dessus
2. Remplacer les schemas par les versions corrigées
3. Tester avec `tsc --noEmit` pour vérifier le typage

### Option 2 : Script automatique

Un script pourrait être créé pour remplacer automatiquement, mais attention aux effets de bord.

---

## ✅ Vérification après correction

Après avoir appliqué les corrections :

1. **Compiler le code :**
   ```bash
   cd tennis-club-francois
   npm run type-check
   # ou
   tsc --noEmit
   ```

2. **Tester l'insertion de données :**
   ```typescript
   // Exemple de test
   import { createMemberSchema } from '@/lib/validators/members';
   
   const data = {
     email: 'test@tennisclub.fr',
     password: 'Password123!',
     fullName: 'Test User',
     role: 'eleve', // ✅ Doit fonctionner
     statutAdhesion: 'en_attente', // ✅ Doit fonctionner
     typeAbonnement: 'standard', // ✅ Doit fonctionner
     niveau: 'debutant', // ✅ Doit fonctionner
   };
   
   const result = createMemberSchema.safeParse(data);
   console.log(result.success); // true
   ```

3. **Tester en base de données :**
   ```sql
   -- Vérifier que les valeurs s'insèrent correctement
   INSERT INTO public.member_profiles (user_id, niveau_tennis, statut_adhesion, type_abonnement)
   VALUES ('uuid-here', 'debutant', 'en_attente', 'standard');
   -- Doit fonctionner sans erreur
   ```

---

## 📚 Bonnes pratiques pour le futur

1. **Toujours vérifier les ENUMs SQL avant de créer des validators Zod**
2. **Utiliser des constantes partagées** pour les valeurs d'ENUM :
   ```typescript
   // Dans un fichier central
   export const ROLE_VALUES = ['admin', 'moniteur', 'eleve', 'guest'] as const;
   export type Role = typeof ROLE_VALUES[number];
   
   // Utiliser dans Zod
   export const roleSchema = z.enum(ROLE_VALUES);
   
   // Utiliser dans Drizzle
   export const roleEnum = pgEnum('role', ROLE_VALUES);
   ```

3. **Créer des tests automatisés** pour vérifier la cohérence SQL ↔ Zod

---

**Document créé par :** Data-Schema-Architect  
**Date :** 31 mars 2026  
**Statut :** À appliquer
