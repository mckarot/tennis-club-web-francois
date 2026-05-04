# 🎾 Tennis Club François - Fiche de Secours Local

## ⚡ Commande Magique de Setup
Si ta base locale est vide, si tu as fait des bêtises dans le schéma ou si l'auth semble "cassée", lance simplement :

```bash
npm run db:setup
```

**Cette commande fait tout pour toi :**
1. Réinitialise la base de données locale (Tables, Trigger, Migrations).
2. Peuple les tables publiques (Courts de tennis, etc.).
3. Crée proprement les comptes de test via l'API Auth locale (évite les erreurs Docker).

## 👤 Comptes de Test (Local)
Utilise ces comptes pour tester les différentes interfaces :

| Rôle          | Email                     | Mot de passe  |
|---------------|---------------------------|---------------|
| **Admin**     | `admin@tennis-club.fr`    | `Admin123!`   |
| **Membre**    | `membre@tennis-club.fr`   | `Membre123!`  |
| **Moniteur**  | `moniteur@tennis-club.fr` | `Moniteur123!`|

## 🏗️ Architecture & Sécurité
- **Types de rôles** : Modifie `src/types/auth.ts` pour ajouter ou renommer un rôle.
- **Automatisation** : Le trigger Postgres `on_auth_user_created` gère la synchronisation entre l'authentification et ton application. Tout nouvel inscrit a automatiquement un profil public créé.
