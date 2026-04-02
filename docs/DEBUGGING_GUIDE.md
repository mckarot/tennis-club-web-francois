# 🐛 Guide de Debugging - Tennis Club François

**Date de création :** 2026-04-01  
**Objectif :** Méthodologie structurée pour déboguer l'application Next.js + Supabase

---

## 📋 Sommaire

1. [Logs Structurés](#1-logs-structurés)
2. [Outils de Debugging](#2-outils-de-debugging)
3. [Scénarios Courants](#3-scénarios-courants)
4. [Checklist de Debugging](#4-checklist-de-debugging)

---

## 1. Logs Structurés

### Principe de Base

Chaque log doit être **préfixé** pour identifier sa provenance :

```typescript
// ❌ À NE PAS FAIRE
console.log('Erreur dans la fonction');
console.log(data);

// ✅ À FAIRE
console.log('[Admin Dashboard] Entrée dans getAdminDashboardData...');
console.info('[Admin Dashboard] Données brutes:', data);
console.error('[Admin Dashboard] Erreur Supabase (reservations):', error);
```

### Niveaux de Logs

| Niveau | Méthode | Quand l'utiliser | Exemple |
|--------|---------|------------------|---------|
| **Log** | `console.log()` | Flux d'exécution normal | Entrée/sortie de fonction |
| **Info** | `console.info()` | Données importantes | Résultats d'API, données brutes |
| **Warn** | `console.warn()` | Situations inattendues non bloquantes | Valeur par défaut utilisée |
| **Error** | `console.error()` | Erreurs critiques | Échec d'appel API, exception |

---

## 2. Outils de Debugging

### Terminal (Logs Serveur)

**Commande pour filtrer les logs :**
```bash
# Voir tous les logs structurés
npm run dev 2>&1 | grep -E "\[.*\]"

# Voir uniquement les logs Admin Dashboard
npm run dev 2>&1 | grep "\[Admin Dashboard\]"

# Voir uniquement les erreurs
npm run dev 2>&1 | grep "ERROR\|Error\|error"
```

### Navigateur (Logs Client)

**Console DevTools (F12) :**
1. Ouvrir l'onglet **Console**
2. Filtrer par préfixe : `[Client Page]`
3. Utiliser le filtre **Regex** : `/\[.*\]/`

**Network Tab :**
1. Ouvrir l'onglet **Network**
2. Filtrer par : `admin` (pour voir les requêtes dashboard)
3. Inspecter la réponse JSON des Server Actions

### Base de Données

**Vérifier les données :**
```bash
# Voir toutes les tables
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "\dt public.*"

# Vérifier données d'une table
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "SELECT COUNT(*) FROM public.reservations;"

# Voir dernières réservations
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
SELECT r.id, c.nom as court, p.nom, p.prenom, r.start_time 
FROM public.reservations r 
JOIN public.courts c ON r.court_id = c.id 
JOIN public.profiles p ON r.user_id = p.user_id 
ORDER BY r.start_time DESC LIMIT 5;"
```

---

## 3. Scénarios Courants

### Scénario 1 : Dashboard Vide (Données ne s'affichent pas)

**Symptômes :**
- Stats à 0
- Tables vides
- Composants n'affichent pas les données

**Debugging Steps :**

1. **Vérifier logs serveur :**
   ```bash
   npm run dev 2>&1 | grep "\[Admin Dashboard\]"
   ```
   → Chercher : `Entrée dans getAdminDashboardData`, `Données brutes`

2. **Vérifier logs client :**
   ```
   Console (F12) → Filtrer par [Client Page]
   ```
   → Chercher : `Résultat de getAdminDashboardData`, `Données pour le rendu`

3. **Vérifier données en DB :**
   ```bash
   docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
   SELECT 
     (SELECT COUNT(*) FROM public.courts) as courts,
     (SELECT COUNT(*) FROM public.reservations) as reservations,
     (SELECT COUNT(*) FROM public.profiles WHERE role = 'membre') as membres;"
   ```

4. **Vérifier jointures SQL :**
   ```bash
   # Tester la requête manuellement
   docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
   SELECT r.id, c.nom, p.nom, p.prenom 
   FROM public.reservations r 
   JOIN public.courts c ON r.court_id = c.id 
   JOIN public.profiles p ON r.user_id = p.user_id 
   LIMIT 3;"
   ```

5. **Vérifier FK dans la DB :**
   ```bash
   docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
   SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
   AND tc.table_name IN ('reservations', 'profiles');"
   ```

---

### Scénario 2 : Erreur RLS (Row Level Security)

**Symptômes :**
- Logs montrent `null` pour les données
- Erreur : "new row violates row-level security policy"

**Debugging Steps :**

1. **Vérifier policies RLS :**
   ```bash
   docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
   SELECT policyname, tablename, cmd, roles 
   FROM pg_policies 
   WHERE schemaname = 'public' 
   ORDER BY tablename, policyname;"
   ```

2. **Vérifier si RLS est activé :**
   ```bash
   docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';"
   ```

3. **Tester sans RLS (temporairement) :**
   ```sql
   -- Désactiver RLS pour test
   ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
   
   -- Tester la requête
   SELECT * FROM public.reservations;
   
   -- Réactiver RLS
   ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
   ```

4. **Vérifier session utilisateur :**
   ```typescript
   // Dans la Server Action
   console.log('[Server Action] Session:', session);
   console.log('[Server Action] User ID:', session?.user?.id);
   ```

---

### Scénario 3 : Erreur TypeScript / Build

**Symptômes :**
- `npm run build` échoue
- Erreurs de types dans le terminal

**Debugging Steps :**

1. **Lancer TypeScript check :**
   ```bash
   cd tennis-club-francois && npx tsc --noEmit
   ```

2. **Identifier le fichier problématique :**
   - Lire l'erreur complète
   - Noter : fichier, ligne, caractère

3. **Vérifier les interfaces :**
   ```typescript
   // Les données retournées correspondent-elles à l'interface ?
   interface Reservation {
     id: string;
     court?: { nom: string; type: string } | null;
     // ...
   }
   ```

4. **Vérifier les jointures Supabase :**
   ```typescript
   // La syntaxe est-elle correcte ?
   .select(`
     *,
     courts ( nom, type ),  // ✓ Correct
     profiles ( nom, prenom )  // ✓ Correct
   `)
   ```

---

### Scénario 4 : Redirection Incorrecte

**Symptômes :**
- Admin redirigé vers `/dashboard/membre`
- Boucle de redirection

**Debugging Steps :**

1. **Vérifier middleware :**
   ```bash
   cat tennis-club-francois/middleware.ts | grep -A 10 "role"
   ```

2. **Vérifier profil utilisateur :**
   ```bash
   docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
   SELECT p.role, p.nom, p.prenom, u.email 
   FROM public.profiles p 
   JOIN auth.users u ON p.user_id = u.id 
   WHERE u.email = 'admin@tennis-club.fr';"
   ```

3. **Vérifier logs middleware :**
   ```bash
   npm run dev 2>&1 | grep -E "Middleware|redirect"
   ```

---

## 4. Checklist de Debugging

### ✅ Checklist Générale

Quand un bug survient, suivre cette checklist :

- [ ] **1. Identifier le symptôme**
  - Page blanche ?
  - Données vides ?
  - Erreur rouge dans console ?
  - Redirection incorrecte ?

- [ ] **2. Vérifier les logs**
  - [ ] Terminal : `npm run dev 2>&1 | grep "\[.*\]"`
  - [ ] Navigateur : Console (F12) → Filtrer par préfixe
  - [ ] Network tab : Voir réponse Server Actions

- [ ] **3. Vérifier la database**
  - [ ] Tables existent : `\dt public.*`
  - [ ] Données présentes : `SELECT COUNT(*)`
  - [ ] FK correctes : `information_schema.table_constraints`
  - [ ] RLS policies : `pg_policies`

- [ ] **4. Vérifier le code**
  - [ ] Build passe : `npm run build`
  - [ ] TypeScript OK : `npx tsc --noEmit`
  - [ ] Interfaces correspondent aux données
  - [ ] Jointures Supabase correctes

- [ ] **5. Tester manuellement**
  - [ ] Requête SQL en direct (Docker)
  - [ ] Server Action en isolation
  - [ ] Composant avec données mockées

---

## 📞 Commandes de Debugging Rapides

### Tout vérifier d'un coup

```bash
# 1. Build
cd tennis-club-francois && npm run build 2>&1 | grep -E "(Error|✓)" | tail -5

# 2. Données
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
SELECT 'COURTS: ' || COUNT(*) FROM public.courts UNION ALL
SELECT 'RESERVATIONS: ' || COUNT(*) FROM public.reservations UNION ALL
SELECT 'MEMBRES: ' || COUNT(*) FROM public.profiles WHERE role = 'membre';"

# 3. FK
docker exec -i supabase_db_tennis-club-francois psql -U postgres -d postgres -c "
SELECT tc.table_name, ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc 
JOIN information_schema.constraint_column_usage AS ccu
  ON tc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('reservations', 'profiles');"
```

---

## 🎯 Bonnes Pratiques

### 1. Logs Proactifs

```typescript
// ✅ TOUJOURS logger l'entrée et la sortie
console.log('[Server Action] Entrée dans maFonction...');
console.info('[Server Action] Données retournées:', data);

// ✅ TOUJOURS logger les erreurs avec contexte
console.error('[Server Action] Erreur Supabase (table):', {
  table: 'reservations',
  error: error,
  userId: session?.user?.id
});
```

### 2. Logs Conditionnels

```typescript
// Log uniquement en développement
if (process.env.NODE_ENV === 'development') {
  console.log('[DEBUG] Données complètes:', JSON.stringify(data, null, 2));
}
```

### 3. Erreurs Utilisables

```typescript
// ❌ À NE PAS FAIRE
catch (error) {
  console.error('Erreur:', error);
  return createErrorResponse('Erreur');
}

// ✅ À FAIRE
catch (error) {
  const errorCode = (error as { code?: string }).code || 'INTERNAL_ERROR';
  const message = (error as Error).message || 'Erreur inattendue';
  
  console.error(`[Server Action] ERREUR FATALE (Code: ${errorCode}):`, {
    action: 'getAdminDashboardData',
    message: message,
    error: error,
    userId: session?.user?.id
  });
  
  return createErrorResponse(message, errorCode);
}
```

---

## 📚 Références

- **Protocole de Logging :** `docs/LOGGING_PROTOCOL.md`
- **Réflexes IA :** `.qwen/REFLEXES-IA.md`
- **État du Projet :** `docs/00-START-HERE.md`

---

**Document à consulter en cas de bug ou problème de debugging.**  
**Objectif :** Diagnostiquer rapidement et efficacement n'importe quel problème.
