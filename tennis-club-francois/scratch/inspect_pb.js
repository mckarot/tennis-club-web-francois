
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

let pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
pbUrl = pbUrl.replace('/_/', '');

const pb = new PocketBase(pbUrl);

async function inspectEverything() {
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );

        const collections = await pb.collections.getFullList();
        const profileColl = collections.find(c => c.name === 'profiles' || c.id === 'ohvpgiuf3eqxjak');
        
        if (profileColl) {
            console.log('--- STRUCTURE DE LA COLLECTION PROFILES ---');
            console.log('Nom:', profileColl.name);
            console.log('Champs:');
            profileColl.schema.forEach(f => {
                console.log(`- ${f.name} (${f.type})`);
            });
            console.log('-------------------------------------------');
        } else {
            console.log('Collection non trouvée');
        }
        
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

inspectEverything();
