
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

let pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
pbUrl = pbUrl.replace('/_/', '');

const pb = new PocketBase(pbUrl);

async function checkSchema() {
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );
        console.log('--- DIAGNOSTIC SCHEMA ---');
        const collection = await pb.collections.getOne('profiles');
        console.log('Champs disponibles dans "profiles":');
        collection.schema.forEach(field => {
            console.log(`- ${field.name} (${field.type})`);
        });
        console.log('-------------------------');
    } catch (error) {
        console.error('Erreur diagnostic:', error.message);
    }
}

checkSchema();
