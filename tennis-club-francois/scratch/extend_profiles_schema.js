
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

let pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
pbUrl = pbUrl.replace('/_/', '');

const pb = new PocketBase(pbUrl);

async function extendProfilesCollection() {
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );

        console.log('Authentifié en tant qu\'admin');

        const existing = await pb.collections.getOne('profiles');
        
        // Champs à ajouter s'ils n'existent pas
        const newFields = [
            { name: 'telephone', type: 'text', required: false, options: {} },
            { name: 'bio', type: 'text', required: false, options: {} },
            { name: 'niveau', type: 'text', required: false, options: {} }
        ];

        // On fusionne le schéma en vérifiant les doublons
        const currentFieldNames = existing.schema.map(f => f.name);
        const fieldsToAdd = newFields.filter(f => !currentFieldNames.includes(f.name));

        if (fieldsToAdd.length > 0) {
            await pb.collections.update(existing.id, {
                schema: [...existing.schema, ...fieldsToAdd]
            });
            console.log('Collection profiles mise à jour avec les nouveaux champs');
        } else {
            console.log('La collection profiles possède déjà tous les champs nécessaires');
        }

    } catch (error) {
        console.error('Erreur:', error.message, error.data);
    }
}

extendProfilesCollection();
