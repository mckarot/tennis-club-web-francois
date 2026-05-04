import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function diagnosePocketBase() {
  console.log('--- DIAGNOSTIC POCKETBASE ---');
  
  const pbUrl = process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL;
  const adminEmail = process.env.PB_ADMIN_EMAIL;
  const adminPassword = process.env.PB_ADMIN_PASSWORD;

  if (!pbUrl) {
    console.error('ERREUR: PB_URL ou NEXT_PUBLIC_PB_URL non défini');
    return;
  }

  console.log(`URL: ${pbUrl}`);
  const pb = new PocketBase(pbUrl);

  try {
    // Test accessibilité publique
    console.log('Test accessibilité publique (santé)...');
    const health = await pb.health.check();
    console.log('Statut Santé:', health);

    if (adminEmail && adminPassword) {
      console.log('Tentative de connexion Admin...');
      try {
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Connexion Admin RÉUSSIE');

        // Lister les collections pour voir si tout est là
        const collections = await pb.collections.getFullList();
        console.log('Collections disponibles:', collections.map(c => c.name).join(', '));

        // Test visibilité RESERVATIONS (Admin)
        try {
          const reservations = await pb.collection('reservations').getList(1, 1);
          console.log(`- Admin voit: ${reservations.totalItems} réservations`);
        } catch (e: any) {
          console.error('- Erreur lecture reservations (Admin):', e.message);
        }
      } catch (e: any) {
        console.error('Connexion Admin ÉCHOUÉE:', e.message);
      }
    } else {
      console.log('PB_ADMIN_EMAIL ou PB_ADMIN_PASSWORD non défini, test Admin sauté');
    }

    // Test visibilité publique (si autorisé par API)
    console.log('Test visibilité RÉSERVATIONS (Public):');
    try {
      const publicPb = new PocketBase(pbUrl);
      const publicRes = await publicPb.collection('reservations').getList(1, 1);
      console.log(`- Public voit: ${publicRes.totalItems} réservations`);
    } catch (e: any) {
      console.error(`- Public ERROR: ${e.message}`);
    }

  } catch (err: any) {
    console.error('ERREUR DIAGNOSTIC:', err.message);
    if (err.data) console.error('Détails:', err.data);
  }
}

diagnosePocketBase();
