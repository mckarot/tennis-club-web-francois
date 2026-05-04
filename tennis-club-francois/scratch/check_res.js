
const PocketBase = require('pocketbase/cjs');
require('dotenv').config({ path: '.env' });

async function checkReservations() {
  const pb = new PocketBase(process.env.PB_URL);
  try {
    await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);
    
    const userId = 'shn8et5q0e4rsrk'; // Marie-Hélène
    console.log('--- Vérification Réservations Marie-Hélène ---');
    
    // On cherche TOUTES les réservations pour voir quel ID est utilisé
    const allRes = await pb.collection('reservations').getList(1, 5, {
        expand: 'user'
    });
    
    console.log('Exemple de réservation en base:');
    allRes.items.forEach(r => {
        console.log(`- ID: ${r.id} | User field: ${r.user} | Date: ${r.date_heure_debut}`);
    });

    // Test de filtrage spécifique
    const filtered = await pb.collection('reservations').getList(1, 1, {
        filter: `user = "${userId}"`
    });
    console.log(`\nRésultat du filtre user="${userId}": ${filtered.totalItems} trouvé(s)`);

  } catch (err) {
    console.error('Erreur:', err);
  }
}
checkReservations();
