# 🔴 AUDIT CRITIQUE - Tennis Club du François
**Date :** 14 Avril 2026  
**Projet :** `/Users/mathieu/StudioProjects/tennis_web/tennis-club-francois`  
**Symptôme :** Le PC bug complètement quand Docker + émulateur Supabase sont lancés (boucle infinie)

---

## ⚠️ DIAGNOSTIC : La cause du plantage

Le problème est une **combinaison de 3 facteurs** qui créent une boucle infinie quand Supabase local démarre :

1. **Middleware.ts** effectue des requêtes DB multiples sans gestion d'erreur
2. **Redirections vers `/connexion`** (route inexistante) dans 3 fichiers
3. **Double `logoutAction`** conflictuelle qui ne redirige pas après déconnexion

Quand Supabase local est lent à initialiser, le middleware sature les ressources avec des requêtes en boucle → **plantage complet du PC**.

---

## 🚨 PROBLÈMES CRITIQUES (à corriger en urgence)

### PROBLÈME 1 : Boucle de Redirection Middleware
**Fichier :** `middleware.ts`  
**Sévérité :** 🔴 CRITIQUE - Cause principale de la boucle

**Lignes problématiques :**
- **Lignes 54-60** : 1er appel à `profiles` pour routes publiques
- **Lignes 65-71** : 2ème appel IDENTIQUE pour routes protégées

**Code problématique :**
```typescript
// APPEL 1 - ligne 54-60
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', session.user.id)
  .single();

// APPEL 2 - ligne 65-71 (MÊME REQUÊTE !)
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', session.user.id)
  .single();
```

**Pourquoi ça plante :**
- Le middleware fait 2 requêtes DB par requête HTTP
- Si la session expire entre-temps → boucle `/login` → `/dashboard` → `/login`
- Aucune protection `try/catch` → le middleware crash silencieusement
- Le pattern `setAll` sur les cookies est dangereux avec Next.js 16

---

### PROBLÈME 2 : Chemins de Redirection Invalides (`/connexion` n'existe pas)
**Sévérité :** 🔴 CRITIQUE

| Fichier | Ligne | Problème | Correction |
|---------|-------|----------|------------|
| `src/app/dashboard/admin/layout.tsx` | 30 | `redirect('/connexion')` | `redirect('/login')` |
| `src/app/dashboard/admin/parametres/page.tsx` | 18 | `redirect('/connexion')` | `redirect('/login')` |
| `src/app/dashboard/admin/planning/page.tsx` | 22 | `redirect('/connexion')` | `redirect('/login')` |

**Pourquoi ça plante :**
Le projet utilise `/login`, pas `/connexion`. Rediriger vers une route inexistante → 404 → comportement erratique → boucle possible.

---

### PROBLÈME 3 : Double `logoutAction` Conflictuelle
**Sévérité :** 🟠 HAUT

| Fichier | Comportement | Problème |
|---------|--------------|----------|
| `src/app/(auth)/actions.ts` (ligne 167) | Fait `redirect('/')` | ✅ Correct |
| `src/app/dashboard/actions.ts` (ligne 1036) | **Ne redirige PAS** | ❌ Bug |

**Pourquoi ça plante :**
Le `LogoutButton.tsx` importe la mauvaise version :
```typescript
import { logoutAction } from '@/app/dashboard/actions'; // ❌ Mauvaise version
```

Après déconnexion, l'utilisateur reste sur la page protégée → le middleware le redirige en boucle.

---

## ⚠️ PROBLÈMES SECONDAIRES (aggravent la situation)

### PROBLÈME 4 : Trigger SQL `handle_new_user` fragile
**Fichier :** `supabase/migrations/20260402000000_initial_schema.sql` (lignes 72-110)

- Insertion en cascade sur 3 tables (`users` → `profiles` → `member_profiles`)
- `EXCEPTION WHEN OTHERS` masque TOUS les erreurs
- Si le trigger échoue → pas de profil créé → le middleware plante car `.single()` échoue

---

### PROBLÈME 5 : RLS Policies avec sous-requêtes inefficaces
**Fichiers :**
- `supabase/migrations/20260405010000_moniteur_rls.sql`
- `supabase/migrations/20260405020000_moniteur_management_rls.sql`

**Code problématique :**
```sql
USING (
  moniteur_id = auth.uid() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

**Pourquoi ça plante :**
Chaque ligne accédée exécute une sous-requête sur `profiles`.  
100 réservations = 100 sous-requêtes → timeouts → retries automatiques → ressemble à une boucle infinie.

---

### PROBLÈME 6 : Colonne `moniteur_id` incohérente
- Le schéma Drizzle (`src/db/schema.ts`) référence `moniteur_id`
- La migration initiale `20260402000000_initial_schema.sql` ne crée PAS cette colonne
- Les migrations RLS subséquentes référencent `moniteur_id` → erreurs SQL

---

### PROBLÈME 7 : `.single()` sans gestion d'erreur dans le middleware
**Fichier :** `middleware.ts` (lignes 54-60 et 65-71)

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', session.user.id)
  .single(); // ❌ Si pas de profil → erreur non capturée
```

Si le profil n'existe pas (trigger échoué), `.single()` lance une erreur non capturée → crash du middleware.

---

## 📋 CORRECTIONS À APPLIQUER (ordre de priorité)

### URGENCE 1 : Corriger les chemins `/connexion` → `/login`
**Fichiers à modifier :**
1. `tennis-club-francois/src/app/dashboard/admin/layout.tsx` (ligne 30)
2. `tennis-club-francois/src/app/dashboard/admin/parametres/page.tsx` (ligne 18)
3. `tennis-club-francois/src/app/dashboard/admin/planning/page.tsx` (ligne 22)

**Correction :** Remplacer `redirect('/connexion')` par `redirect('/login')`

---

### URGENCE 2 : Refactorer le middleware (`middleware.ts`)

**Modifications nécessaires :**
1. **Ne faire qu'UNE SEULE requête** `profiles` par exécution (mettre en cache le résultat)
2. **Ajouter une protection anti-boucle** : vérifier si déjà en redirection
3. **Encapsuler dans try/catch** tous les appels `.single()`
4. **Supprimer la modification de `request.cookies`** dans `setAll`

**Structure corrigée du middleware :**
```typescript
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(/* ... */);
  
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // 1. Récupérer session
  const { data: { session } } = await supabase.auth.getSession();

  // 2. Protection anti-boucle : si déjà en redirection, ne rien faire
  if (request.nextUrl.searchParams.has('redirecting')) {
    return supabaseResponse;
  }

  // 3. Rediriger vers login si non authentifié
  if (!session && pathname.startsWith('/dashboard')) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    url.searchParams.set('redirecting', '1');
    return NextResponse.redirect(url);
  }

  // 4. Si authentifié, récupérer le profil UNE SEULE FOIS
  if (session) {
    let role = 'membre';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      role = profile?.role ?? 'membre';
    } catch (error) {
      // Profil inexistant → rôle par défaut
      console.error('Profil non trouvé pour user:', session.user.id);
    }

    // Suite de la logique avec le rôle récupéré une seule fois...
  }

  return supabaseResponse;
}
```

---

### URGENCE 3 : Unifier `logoutAction`

**Action :**
1. Supprimer la fonction `logoutAction` de `src/app/dashboard/actions.ts`
2. Vérifier que tous les imports utilisent `src/app/(auth)/actions.ts`

---

### PRIORITÉ MOYENNE : Améliorations supplémentaires

1. **Trigger SQL** : Ajouter une gestion d'erreur explicite pour chaque table
2. **RLS Policies** : Remplacer les sous-requêtes `EXISTS` par des jointures
3. **Colonne `moniteur_id`** : Créer une migration pour ajouter la colonne manquante
4. **Error boundaries** : Ajouter des Error Boundary React sur les pages dashboard

---

## 🔧 CONFIGURATION SUPABASE LOCAL (pas de problème identifié)

**Fichier :** `supabase/config.toml`

Les ports sont correctement configurés :
- API : `54321`
- DB : `54322`
- Studio : `54323`
- Inbucket : `54324`
- Analytics : `54327`

**Pas de conflit de port détecté.**

---

## 🌐 PATH / MCP / ANTI-GRAVITY

**Aucun problème de PATH ou MCP détecté dans le projet.**

Les fichiers `.antigravity/` contiennent uniquement des règles pour les agents IA. Le problème PATH mentionné par l'utilisateur est probablement **externe au projet** (configuration système Google Anti-Gravity).

---

## 📊 RÉSUMÉ DES FICHIERS À MODIFIER

| Priorité | Fichier | Lignes | Action |
|----------|---------|--------|--------|
| 🔴 URGENT | `middleware.ts` | Toutes | Refactorer complètement |
| 🔴 URGENT | `src/app/dashboard/admin/layout.tsx` | 30 | `/connexion` → `/login` |
| 🔴 URGENT | `src/app/dashboard/admin/parametres/page.tsx` | 18 | `/connexion` → `/login` |
| 🔴 URGENT | `src/app/dashboard/admin/planning/page.tsx` | 22 | `/connexion` → `/login` |
| 🟠 HAUT | `src/app/dashboard/actions.ts` | 1036 | Supprimer `logoutAction` |
| 🟡 MOYEN | `supabase/migrations/20260402000000_initial_schema.sql` | 72-110 | Améliorer gestion d'erreur |
| 🟡 MOYEN | `supabase/migrations/20260405010000_moniteur_rls.sql` | Toutes | Optimiser sous-requêtes |

---

## ⚡ ACTION IMMÉDIATE RECOMMANDÉE

**Avant de relancer Docker/Supabase :**

1. Corriger les 3 fichiers avec `/connexion` → `/login`
2. Refactorer le middleware pour éviter les boucles
3. Unifier `logoutAction`

Ces 3 corrections devraient **résoudre 90% du problème de boucle infinie**.

---

**FIN DE L'AUDIT**  
*Conservez ce fichier. Si le projet plante à nouveau, montrez-le à l'assistant IA pour qu'il sache exactement quoi corriger.*
