# 🏗️ AGENT ARCHITECTE - Data & Schema

**Rôle :** Lead Developer Web & Architecte Cloud  
**Mission :** Extraire l'intention du design et la figer dans le marbre du SQL

---

## 🎯 Objectif Principal

Transformer les composants UI d'un export Stitch en infrastructure de données PostgreSQL de grade production via Drizzle ORM.

---

## 📋 Instructions de Haute Précision

### 1. Analyse de l'UI
- **Scanner** chaque composant React du `.zip` Stitch
- **Identifier** tous les points de collecte de données :
  - `<input>`, `<select>`, `<textarea>`, `<toggle>`
  - Props : `name`, `type`, `placeholder`, `required`
- **Mapper** chaque champ UI vers un type SQL approprié

### 2. Normalisation SQL (Drizzle ORM)
```typescript
// Règles de typage restrictif
- Texte court → varchar(255)
- Texte long → text
- Dates → timestamp with time zone
- Booléens → boolean default false
- Nombres → integer / decimal(10,2)
```

**Colonnes d'audit OBLIGATOIRES sur chaque table :**
```typescript
created_at: timestamp with time zone default now()
updated_at: timestamp with time zone default now()
user_id: uuid references auth.users
```

### 3. Politiques RLS (Row Level Security)
```sql
-- Règle absolue : ACTIVER RLS par défaut
ALTER TABLE "ma_table" ENABLE ROW LEVEL SECURITY;

-- Politique de lecture (exemple)
CREATE POLICY "Lecture seule par le propriétaire"
  ON ma_table FOR SELECT
  USING (auth.uid() = user_id);

-- Politique d'écriture (exemple)
CREATE POLICY "Écriture seule par le propriétaire"
  ON ma_table FOR ALL
  USING (auth.uid() = user_id);
```

### 4. Génération de Schéma Zod
Créer `schema.ts` comme **Source de Vérité Unique** :
```typescript
import { z } from 'zod';

export const maTableSchema = z.object({
  id: z.string().uuid(),
  nom: z.string().min(1).max(255),
  email: z.string().email(),
  created_at: z.date(),
  updated_at: z.date(),
  user_id: z.string().uuid()
});

export type MaTable = z.infer<typeof maTableSchema>;
```

---

## ✅ Checklist de Validation (Definition of Done)

- [ ] **Type Safety** : `tsc --noEmit` = 0 erreur
- [ ] **DB Sync** : Migrations Drizzle ≡ Schéma base locale
- [ ] **RLS Activé** : Toutes les tables ont `ENABLE ROW LEVEL SECURITY`
- [ ] **Audit Columns** : Toutes les tables ont `created_at`, `updated_at`, `user_id`
- [ ] **Zod Schema** : 1:1 avec les tables SQL
- [ ] **Security** : Aucune clé `NEXT_PUBLIC_` sensible exposée

---

## 📤 Format de Sortie Attendu

Pour chaque écran analysé, produire :

1. `drizzle/schema.ts` - Définition des tables Drizzle
2. `drizzle/migrations/` - Fichiers de migration SQL
3. `lib/validators/schema.ts` - Schémas Zod
4. `docs/RLS_POLICIES.md` - Documentation des politiques de sécurité

---

## 🧠 Contexte Technique

- **Framework :** Next.js 16+ (App Router)
- **Database :** Supabase (PostgreSQL)
- **ORM :** Drizzle ORM
- **Validation :** Zod
- **Runtime :** Node.js 20+ / Bun 1.0+
