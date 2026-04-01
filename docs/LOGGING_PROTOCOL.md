# Protocole de Logging - Tennis Club François

Ce document définit une stratégie de logging structurée pour faciliter le débogage de l'application Next.js, en particulier pour les Server Actions et les composants React.

## Principes Généraux

1.  **Logs Structurés** : Chaque message de log doit être préfixé pour identifier clairement sa provenance (ex: `[Admin Dashboard]`, `[Client Page]`).
2.  **Niveaux de Log** : Utilisez les différents niveaux de console pour refléter l'importance du message.
    - `console.log()`: Pour le suivi du flux d'exécution normal (entrée dans une fonction, etc.).
    - `console.info()`: Pour afficher des données importantes (résultats d'API, etc.).
    - `console.warn()`: Pour les situations inattendues mais non bloquantes.
    - `console.error()`: Pour les erreurs critiques qui cassent une fonctionnalité.
3.  **Logs sur le Serveur et le Client** : Le logging doit être présent des deux côtés pour avoir une vue d'ensemble. Les logs serveur apparaissent dans le terminal où vous lancez `npm run dev`, les logs client dans la console du navigateur.

---

## Stratégie Côté Serveur (Server Actions)

Les logs côté serveur sont les plus importants pour diagnostiquer les problèmes de données.

### Dans chaque Server Action :

1.  **Log d'entrée** : Au tout début de la fonction, pour confirmer qu'elle est bien appelée.
2.  **Log de succès de l'API** : Juste après un appel réussi à la base de données, pour voir les données brutes retournées.
3.  **Log d'erreur détaillé** : Dans le bloc `catch`, loguez l'action qui a échoué et l'objet d'erreur complet.

### Exemple dans `actions.ts`

```typescript
export async function getAdminDashboardData(): Promise<ActionResult<DashboardData>> {
  console.log('[Admin Dashboard] Entrée dans getAdminDashboardData...');
  
  try {
    // ... vérification admin ...
    
    const supabase = await createClient();
    
    // ... Promise.all pour les stats ...
    console.info('[Admin Dashboard] Données de stats brutes:', {
      membresCount,
      reservationsCount,
      // ...
    });
    
    // ...
    const { data: dernieresReservations, error: reservationsError } = await supabase
      .from('reservations')
      // ... select ...
      
    if (reservationsError) {
      console.error('[Admin Dashboard] Erreur Supabase (dernieresReservations):', reservationsError);
    }
    console.info('[Admin Dashboard] Dernières réservations brutes:', dernieresReservations);
    
    // ...
    
    return createSuccessResponse<DashboardData>({
      // ...
    });
    
  } catch (error) {
    console.error('[Admin Dashboard] ERREUR FATALE dans getAdminDashboardData:', error);
    
    // ...
  }
}
```

---

## Stratégie Côté Client (Composants React)

Les logs côté client confirment ce que le navigateur reçoit et affiche.

### Dans chaque composant "Page" ou "Layout" :

1.  **Afficher les `props`** : Dans un composant `async`, affichez les `props` reçues pour vérifier les données.
2.  **Afficher le résultat d'une Server Action** : Le résultat de l'appel à une Server Action doit être logué pour voir la réponse (succès ou erreur).

### Exemple dans `page.tsx` (Dashboard Admin)

```tsx
// src/app/dashboard/admin/page.tsx

import { getAdminDashboardData } from '../actions';

export default async function AdminDashboardPage() {
  console.log('[Client Page] Rendu de AdminDashboardPage.');

  const result = await getAdminDashboardData();
  
  // Loggue la réponse complète de la Server Action
  console.info('[Client Page] Résultat de getAdminDashboardData:', result);

  if (!result.success) {
    // Loggue l'erreur spécifiquement
    console.error('[Client Page] Erreur retournée par le serveur:', result.error);
    return (
      <div className="alert alert-danger">
        <h2>Erreur de chargement du tableau de bord</h2>
        <p>{result.error}</p>
      </div>
    );
  }
  
  const { stats, courts, dernieresReservations, membresRecents } = result.data;
  
  // Loggue les données déstructurées qui seront utilisées pour le rendu
  console.info('[Client Page] Données pour le rendu:', { stats, courts, dernieresReservations, membresRecents });

  return (
    // ... JSX du composant qui utilise les données ...
  );
}
```

En suivant ce protocole, vous pourrez tracer le parcours d'une donnée depuis l'appel de la Server Action jusqu'à son rendu dans le navigateur, et identifier précisément où se situe la rupture.
