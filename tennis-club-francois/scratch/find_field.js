
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

let pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
pbUrl = pbUrl.replace('/_/', '');

const pb = new PocketBase(pbUrl);

async function findTheField() {
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );

        const record = await pb.collection('profiles').getFirstListItem('', {
            sort: '-created'
        });
        
        console.log('--- CHAMPS RÉELS DANS POCKETBASE ---');
        console.log(Object.keys(record));
        console.log('------------------------------------');
        
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

findTheField();
