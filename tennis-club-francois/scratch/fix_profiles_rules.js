
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

let pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
pbUrl = pbUrl.replace('/_/', '');

const pb = new PocketBase(pbUrl);

async function fixProfileRules() {
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );

        console.log('Authentifié en tant qu\'admin');

        const collection = await pb.collections.getOne('profiles');
        
        // Configuration des règles
        // viewRule: id != ""  -> Tout le monde peut voir les profils (utile pour les photos)
        // updateRule: user = @request.auth.id -> Seul le propriétaire peut modifier son profil
        
        await pb.collections.update(collection.id, {
            viewRule: 'id != ""',
            listRule: 'id != ""',
            updateRule: 'user = @request.auth.id',
            // On s'assure que les champs créés existent
            createRule: '@request.auth.id != ""', 
        });

        console.log('✅ Les règles de la collection "profiles" ont été mises à jour avec succès !');
        console.log('- Lecture : Autorisée pour tous les membres');
        console.log('- Mise à jour : Autorisée uniquement pour le propriétaire du profil');

    } catch (error) {
        console.error('Erreur lors de la mise à jour des règles:', error.message);
    }
}

fixProfileRules();
