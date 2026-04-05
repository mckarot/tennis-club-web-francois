La deuxième correction a été appliquée. 

L'erreur `Rôle insuffisant` était causée par l'utilisation de `supabase.auth.signUp`, qui vous déconnectait de votre session admin et vous connectait en tant que le nouveau membre.

J'ai remplacé cette fonction par `supabase.auth.admin.createUser`, qui est la méthode correcte et sécurisée pour qu'un administrateur crée un nouvel utilisateur sans que sa propre session ne soit modifiée.

Avec ce changement, combiné à la correction précédente de la base de données, le processus de création de membre devrait maintenant être complet et ne plus causer de redirection ou d'erreur d'autorisation.
