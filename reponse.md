J'ai corrigé le problème dans l'action `addMemberAction`. 

Le problème venait d'une incohérence entre la logique de création de l'utilisateur et la structure de votre base de données. Plus précisément, l'utilisateur était créé dans le système d'authentification de Supabase, mais pas dans votre table `public.users`, ce qui empêchait l'ajout de son profil (nom, prénom) à cause d'une contrainte de clé étrangère.

J'ai modifié l'action pour qu'elle synchronise correctement le nouvel utilisateur dans la table `public.users` avant de créer son profil. J'ai aussi retiré une vérification d'email qui était incorrecte.

La création de membre devrait maintenant fonctionner comme prévu.
