# 🔧 FICHE DE DÉBOGAGE - Authentification Next.js + Supabase

**Date :** 31 Mars 2026  
**Projet :** Tennis Club du François  
**Stack :** Next.js 16 + React 19 + Supabase Local (Docker)

---

##  SYMPTÔMES DE L'ERREUR

### Ce que l'utilisateur voyait

1. **Page de login** : `http://localhost:3000/login` s'affiche correctement ✅
2. **Formulaire rempli** : Email + mot de passe saisis ✅
3. **Bouton "Se connecter" cliqué** : Rien ne se passe ❌
4. **Aucune erreur visible** dans la console du navigateur ❌
5. **Message d'erreur** : "Une erreur est survenue lors de la connexion" (message générique)

---

## 🔍 DIAGNOSTIC

### Ce qui se passait réellement

```
=== loginAction START ===
FormData: { email: 'admin@tennisclub.fr', password: 'Password123!' }
Email: admin@tennisclub.fr
Création client Supabase...
Client Supabase créé
Appel signInWithPassword...
Auth réussie, user ID: d405d3d5-7e82-4252-a5d0-ba405a406fb0
Recherche rôle dans public.users...
Rôle trouvé: admin
Redirection vers: admin
=== ERREUR DANS CATCH ===
Error: NEXT_REDIRECT
    at loginAction (src/app/(auth)/actions.ts:89:15)
```

### L'erreur exacte

```
Error: NEXT_REDIRECT
digest: 'NEXT_REDIRECT;push;/admin;307;'
```

---

## 🎯 CAUSE RACINE

### Problème #1 : `redirect()` dans un `try/catch`

**Code problématique :**

```typescript
try {
  // ... code qui fonctionne
  redirect('/admin');  // ← ICI
} catch (err) {
  console.error('Erreur:', err);  // ← NEXT_REDIRECT est catché ici !
  return error('Une erreur est survenue...', 'INTERNAL_ERROR');
}
```

**Explication :**

La fonction `redirect()` de Next.js **lance une erreur spéciale** `NEXT_REDIRECT` pour interrompre l'exécution et déclencher la redirection.

Cette erreur **DOIT** être propagée, pas attrapée par un `catch` générique.

---

### Problème #2 : Middleware lisait la mauvaise table

**Ancien code (middleware.ts) :**

```typescript
// ❌ MAUVAIS : Lit depuis 'profiles' qui n'a pas de colonne 'role'
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session.user.id)
  .single();
```

**Nouveau code :**

```typescript
// ✅ CORRECT : Lit depuis 'users' qui a la colonne 'role'
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', session.user.id)
  .single();
```

---

## ✅ SOLUTION APPLIQUÉE

### 1. Filtrer NEXT_REDIRECT dans le catch

**Code corrigé :**

```typescript
try {
  // ... code qui fonctionne
  
  // Redirection (lance NEXT_REDIRECT)
  if (role === 'admin') {
    redirect('/admin');
  } else if (role === 'moniteur') {
    redirect('/moniteur');
  } else {
    redirect('/membre');
  }
} catch (err: unknown) {
  // ✅ NEXT_REDIRECT doit être propagé
  if (err && typeof err === 'object' && 'digest' in err && 
      String(err.digest).includes('NEXT_REDIRECT')) {
    throw err;  // ← Propager l'erreur de redirection
  }
  
  // Seulement les VRAIES erreurs sont catchées ici
  console.error('=== ERREUR DANS CATCH ===');
  console.error(err);
  return error('Une erreur est survenue...', 'INTERNAL_ERROR');
}
```

---

### 2. Corriger le middleware

**Fichier :** `tennis-club-francois/middleware.ts`

**Changements :**

```typescript
// ANCIEN (erroné)
const { data: profile } = await supabase
  .from('profiles')
  .select('role')  // ❌ 'profiles' n'a pas de colonne 'role'
  .eq('id', session.user.id)
  .single();

// NOUVEAU (correct)
const { data: userData } = await supabase
  .from('users')
  .select('role')  // ✅ 'users' a la colonne 'role'
  .eq('id', session.user.id)
  .single();
```

---

### 3. Simplifier les routes

**Ancien code :**

```typescript
const adminRoutes = ['/admin', '/(dashboard)/admin'];
const coachRoutes = ['/moniteur', '/(dashboard)/moniteur'];
const memberRoutes = ['/membre', '/(dashboard)/membre'];

const isProtectedRoute =
  pathname.startsWith('/(dashboard)') ||
  pathname.startsWith('/admin') ||
  pathname.startsWith('/moniteur') ||
  pathname.startsWith('/membre');
```

**Nouveau code :**

```typescript
const isProtectedRoute =
  pathname.startsWith('/admin') ||
  pathname.startsWith('/moniteur') ||
  pathname.startsWith('/membre');
```

---

## 🧪 COMMENT TESTER

### Étape 1 : Vérifier que les utilisateurs existent

```sql
-- Dans Supabase SQL Editor
SELECT email, role FROM public.users;
```

**Résultat attendu :**

| email | role |
|-------|------|
| admin@tennisclub.fr | admin |
| moniteur@tennisclub.fr | moniteur |
| membre@tennisclub.fr | eleve |

---

### Étape 2 : Tester la connexion

1. Ouvrir `http://localhost:3000/login`
2. Email : `admin@tennisclub.fr`
3. Mot de passe : `Password123!`
4. Cliquer sur "Se connecter"

**Résultat attendu :** Redirection vers `/admin`

---

### Étape 3 : Vérifier les logs

**Dans le terminal** (où tourne `npm run dev`) :

```
=== loginAction START ===
FormData: { email: 'admin@tennisclub.fr', password: 'Password123!' }
Email: admin@tennisclub.fr
Création client Supabase...
Client Supabase créé
Appel signInWithPassword...
Auth réussie, user ID: d405d3d5-7e82-4252-a5d0-ba405a406fb0
Recherche rôle dans public.users...
Rôle trouvé: admin
Redirection vers: admin
```

**Pas d'erreur dans le `catch` !**

---

## 📁 FICHIERS MODIFIÉS

| Fichier | Modification |
|---------|-------------|
| `src/app/(auth)/actions.ts` | Filtrer `NEXT_REDIRECT` dans le `catch` |
| `middleware.ts` | Lire `role` depuis `users` au lieu de `profiles` |
| `middleware.ts` | Simplifier les routes protégées |

---

## 🚨 ERREURS SIMILAIRES À SURVEILLER

### 1. NEXT_REDIRECT catché par erreur

**Symptôme :** "Une erreur est survenue" après une action qui devrait rediriger

**Solution :**

```typescript
catch (err: unknown) {
  if (err && typeof err === 'object' && 'digest' in err && 
      String(err.digest).includes('NEXT_REDIRECT')) {
    throw err;
  }
  // ... gérer les autres erreurs
}
```

---

### 2. Trigger auth.users → public.users ne fonctionne pas

**Symptôme :** Utilisateur dans `auth.users` mais pas dans `public.users`

**Solution :**

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (NEW.id, NEW.email, NEW.encrypted_password, 
          COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role)
  ON CONFLICT (id) DO UPDATE SET 
    role = COALESCE(NEW.raw_user_meta_data->>'role', 'eleve')::role;
  
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (NEW.id, 
          COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
          COALESCE(NEW.raw_user_meta_data->>'prenom', ''))
  ON CONFLICT (user_id) DO UPDATE SET 
    nom = COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### 3. Logs qui n'apparaissent pas dans la console du navigateur

**Symptôme :** Les `console.log` dans une Server Action n'apparaissent pas dans le navigateur

**Explication :** Les Server Actions s'exécutent **côté serveur**, pas dans le navigateur.

**Solution :** Regarder les logs dans le **terminal** où tourne `npm run dev`, pas dans la console du navigateur.

---

## 📝 CHECKLIST DE DÉPANNAGE

Si l'authentification ne fonctionne pas :

- [ ] **Vérifier `public.users`** : `SELECT email, role FROM public.users;`
- [ ] **Vérifier le trigger** : Le trigger `on_auth_user_created` existe-t-il ?
- [ ] **Vérifier les logs serveur** : Regarder le terminal, pas la console navigateur
- [ ] **Vérifier le middleware** : Lit-il `role` depuis la bonne table (`users`) ?
- [ ] **Vérifier la redirection** : `redirect()` est-elle dans un `try` sans être catchée ?
- [ ] **Vérifier les routes** : Les pages `/admin`, `/moniteur`, `/membre` existent-elles ?

---

## 🔗 LIENS UTILES

- [Next.js redirect() documentation](https://nextjs.org/docs/app/api-reference/functions/redirect)
- [Supabase Auth SSR](https://supabase.com/docs/guides/auth/auth-hard-mode)
- [Drizzle ORM with Supabase](https://orm.drizzle.team/docs/get-started-postgresql)

---

## 💡 LEÇONS APRISSES

1. **Toujours propager `NEXT_REDIRECT`** : Ne jamais catch cette erreur
2. **Logs dans le terminal** : Les Server Actions s'exécutent côté serveur
3. **Vérifier la structure des tables** : `role` est dans `users`, pas dans `profiles`
4. **Tester avec curl** : Permet de vérifier Supabase Auth sans le frontend
5. **Trigger avec SECURITY DEFINER** : Nécessaire pour accéder à `auth.users`

---

**Dernière mise à jour :** 31 Mars 2026  
**Auteur :** Assistant IA
