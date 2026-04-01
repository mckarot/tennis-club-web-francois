# Test API Supabase Auth - Tennis Club du François

## Objectif

Tester **directement** l'API Supabase Auth pour isoler le problème d'authentification.

---

## 📋 PRÉ-REQUIS

1. **Supabase Local doit tourner** : http://localhost:54321
2. **Le script SQL doit être exécuté** : `scripts/auth-simple.sql`
3. **L'utilisateur admin doit exister** dans `auth.users`

---

## 🔧 TEST 1 : curl (depuis le terminal)

### Commande curl pour se connecter

```bash
curl -X POST 'http://localhost:54321/auth/v1/token?grant_type=password' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@tennisclub.fr",
    "password": "Password123!"
  }'
```

### Résultat attendu

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "expires_at": 1234567890,
  "refresh_token": "v1_abc123...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-ici",
    "email": "admin@tennisclub.fr",
    "email_confirmed_at": "2026-03-31T...",
    "app_metadata": {...},
    "user_metadata": {...}
  }
}
```

### Si erreur

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Invalid login credentials` | Email/password incorrect | Vérifie dans `auth.users` |
| `Connection refused` | Supabase ne tourne pas | `docker compose up` |
| `Database error querying schema` | Problème de permissions | Vérifie que `auth` schema existe |

---

## 🖥️ TEST 2 : JavaScript (depuis la console du navigateur)

### Étape 1 : Ouvrir la console

1. Va sur http://localhost:3000
2. Ouvre la console (F12 → Console)

### Étape 2 : Coller ce code

```javascript
// Configuration
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Test 1 : Vérifier que Supabase est accessible
async function testConnection() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log('✅ Supabase est accessible:', response.status);
  } catch (error) {
    console.error('❌ Supabase inaccessible:', error);
  }
}

// Test 2 : Se connecter avec Supabase Auth
async function testLogin() {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@tennisclub.fr',
        password: 'Password123!'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Connexion réussie!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Access Token:', data.access_token.substring(0, 50) + '...');
    } else {
      console.error('❌ Échec connexion:', data);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

// Test 3 : Vérifier public.users
async function testPublicUsers() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.admin@tennisclub.fr`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.length > 0) {
      console.log('✅ public.users contient l\'utilisateur:');
      console.log(data);
    } else {
      console.warn('⚠️ public.users est VIDE pour cet email');
      console.log('Le trigger on_auth_user_created n\'a pas fonctionné!');
    }
  } catch (error) {
    console.error('❌ Erreur requête public.users:', error);
  }
}

// Exécuter les tests
console.log('=== TEST AUTH SUPABASE ===\n');
await testConnection();
console.log('\n--- Test login ---');
await testLogin();
console.log('\n--- Test public.users ---');
await testPublicUsers();
console.log('\n=== FIN DES TESTS ===');
```

### Résultat attendu

```
=== TEST AUTH SUPABASE ===

✅ Supabase est accessible: 200

--- Test login ---
✅ Connexion réussie!
User ID: 123e4567-e89b-12d3-a456-426614174000
Email: admin@tennisclub.fr
Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--- Test public.users ---
✅ public.users contient l'utilisateur:
[{ id: "...", email: "admin@tennisclub.fr", role: "admin", ... }]

=== FIN DES TESTS ===
```

---

## 🐛 TEST 3 : Diagnostiquer le trigger

### Vérifier que le trigger existe

```sql
-- Dans Supabase SQL Editor
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname = 'on_auth_user_created';
```

### Vérifier la fonction

```sql
-- Dans Supabase SQL Editor
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'handle_new_user';
```

### Tester le trigger manuellement

```sql
-- 1. Supprimer l'utilisateur existant
DELETE FROM auth.users WHERE email = 'test@trigger.fr';

-- 2. Créer un nouvel utilisateur
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@trigger.fr',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('nom', 'Test', 'prenom', 'Trigger', 'role', 'admin'),
  NOW(),
  NOW()
);

-- 3. Vérifier que public.users a été peuplé
SELECT * FROM public.users WHERE email = 'test@trigger.fr';
SELECT * FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@trigger.fr');

-- 4. Nettoyer
DELETE FROM auth.users WHERE email = 'test@trigger.fr';
```

---

## 📊 CHECKLIST DE DIAGNOSTIC

| # | Vérification | Commande | Résultat attendu |
|---|--------------|----------|------------------|
| 1 | Supabase tourne | `curl http://localhost:54321` | HTTP 200 |
| 2 | auth.users existe | `SELECT * FROM auth.users LIMIT 1;` | 1 ligne |
| 3 | Trigger existe | `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';` | 1 ligne |
| 4 | public.users sync | `SELECT * FROM public.users WHERE email = 'admin@tennisclub.fr';` | 1 ligne |
| 5 | Login API marche | curl test (voir plus haut) | access_token retourné |
| 6 | Login Next.js marche | Tester dans l'app | Redirection vers dashboard |

---

## 🚀 SOLUTION RAPIDE

Si **rien ne marche**, exécute cette commande dans Supabase SQL Editor :

```sql
-- 1. Nettoyer
DELETE FROM auth.users WHERE email = 'admin@tennisclub.fr';
DELETE FROM public.users WHERE email = 'admin@tennisclub.fr';
DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@tennisclub.fr');

-- 2. Recréer le trigger (copie depuis scripts/auth-simple.sql)
-- ... (voir fichier auth-simple.sql)

-- 3. Recréer l'utilisateur (copie depuis scripts/auth-simple.sql)
-- ... (voir fichier auth-simple.sql)

-- 4. Vérifier
SELECT 'auth.users' as src, * FROM auth.users WHERE email = 'admin@tennisclub.fr'
UNION ALL
SELECT 'public.users' as src, id, email, role, created_at, NULL, NULL, NULL, NULL, NULL FROM public.users WHERE email = 'admin@tennisclub.fr';
```

---

## 📞 PROCHAINES ÉTAPES

1. ✅ Exécute `scripts/auth-simple.sql` dans Supabase SQL Editor
2. ✅ Exécute les tests curl ou JavaScript ci-dessus
3. ✅ Si ça marche → Teste dans l'app Next.js
4. ❌ Si ça ne marche pas → Copie-colle l'erreur exacte

---

**Fichiers liés :**
- `/Users/mathieu/StudioProjects/tennis_web/scripts/auth-simple.sql` - Script SQL de test
- `/Users/mathieu/StudioProjects/tennis_web/tennis-club-francois/src/app/(auth)/actions.ts` - Server Action login
- `/Users/mathieu/StudioProjects/tennis_web/tennis-club-francois/src/lib/supabase/server.ts` - Client Supabase SSR
