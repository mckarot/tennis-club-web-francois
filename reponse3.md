J'ai appliqué le correctif final.

L'erreur `User not allowed` confirmait que les opérations d'administration nécessitaient des privilèges élevés.

Voici ce que j'ai fait :
1.  J'ai d'abord ajouté une fonction `createAdminClient` dans `lib/supabase/server.ts`. Elle permet de créer un client Supabase avec les droits de super-administrateur (`SERVICE_ROLE_KEY`), ce qui est indispensable pour gérer les utilisateurs.
2.  Ensuite, j'ai modifié `addMemberAction` pour qu'elle utilise **uniquement** ce nouveau client "admin" pour toutes ses opérations (création, insertion dans les tables, etc.).

La vérification `requireAdmin()` est toujours présente au début pour s'assurer que seul un admin connecté peut lancer l'action. Une fois cette vérification passée, l'action s'exécute avec les droits nécessaires.

Ceci résout la cascade d'erreurs que vous rencontriez. Le processus de création de membre devrait maintenant être pleinement fonctionnel, sans erreur de permission ni redirection inattendue.
