
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

let pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
pbUrl = pbUrl.replace('/_/', '');

const pb = new PocketBase(pbUrl);

async function listCollections() {
    try {
        if (!process.env.PB_ADMIN_EMAIL || !process.env.PB_ADMIN_PASSWORD) {
            throw new Error('PB_ADMIN_EMAIL ou PB_ADMIN_PASSWORD manquant dans le .env');
        }

        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );

        const collections = await pb.collections.getFullList();
        console.log('--- COLLECTIONS POCKETBASE ---');
        collections.forEach(c => {
            console.log(`- ${c.name} (${c.type})${c.system ? ' [SYSTEM]' : ''}`);
        });
        console.log('------------------------------');
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

listCollections();
