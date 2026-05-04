# Audit de Migration Supabase vers PocketBase - Tennis Club François

## 1. État des Lieux de la Migration

La migration est largement avancée au niveau de l'authentification et de la structure des dossiers, mais elle présente des incohérences critiques dans la couche de données, notamment concernant la gestion des statuts et des types de données.

### Points Complétés :
- Utilisation de `pocketbase` SDK dans la majorité des Server Actions.
- Mise en place du middleware avec PocketBase pour la protection des routes `/dashboard`.
- Création des utilitaires `createClient` et `createAdminClient` dans `src/lib/pocketbase/server.ts`.
- Scripts de configuration de schéma (`scripts/setup_pb_schema.ts`) et de seed (`scripts/seed_reservations.ts`).

## 4. Découplage Drizzle/Supabase : **TERMINÉ**

Le projet a été intégralement découplé de l'ancienne infrastructure Postgres/Drizzle :
- **Nettoyage du Code** : Tous les imports et mocks relatifs à Drizzle ont été supprimés.
- **Suppression des Fichiers** : Les dossiers `src/db`, `drizzle` et `supabase` ont été supprimés.
- **Dépendances** : `drizzle-orm`, `drizzle-kit` et `postgres` ont été retirés de `package.json`.
- **Environnement** : Les variables Supabase et DATABASE_URL ont été purgées de `.env.local`.

Le projet repose désormais exclusivement sur **PocketBase** pour l'authentification et la persistance des données.

## 5. Recommandations de Sécurité

- S'assurer que les `PB_ADMIN_EMAIL` et `PB_ADMIN_PASSWORD` ne sont jamais exposés côté client.
- Renforcer les règles de collection (API Rules) dans PocketBase pour ne pas dépendre uniquement du `createAdminClient` dans les Server Actions (principe du moindre privilège).

---
*Document généré par Antigravity le 4 mai 2026.*
